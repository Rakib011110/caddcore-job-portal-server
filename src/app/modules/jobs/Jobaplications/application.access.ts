import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../../error/AppError';
import { catchAsync } from '../../../utils/catchAsync';
import { USER_ROLE } from '../../User/user.constant';
import { User } from '../../User/user.model';
import { Job } from '../job.model';
import { JobApplication } from './Jobaplications.model';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION ACCESS CONTROL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Job applications carry candidate PII (name, email, phone) and, since the
 * resume snapshot landed, an entire CV. Three parties may read them and each
 * sees a different slice:
 *
 *   ADMIN / HR  - every application on the platform
 *   COMPANY     - only applications made to jobs their own company posted
 *   USER        - only their own applications
 *
 * The company rule is the reason this file exists: role alone is not enough,
 * every company-scoped request has to be checked against the job's owner. The
 * guards below resolve that once and hand the result to the controller on
 * `req.applicationScope`, so services never have to re-derive it.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SCOPE
// ─────────────────────────────────────────────────────────────────────────────

export interface IApplicationScope {
  viewerId: string;
  role: string;
  /** Staff see everything and skip ownership checks */
  isStaff: boolean;
  /** Set for COMPANY viewers - the company whose jobs they may read */
  companyId?: string;
}

const STAFF_ROLES: string[] = [USER_ROLE.ADMIN, USER_ROLE.HR];

/**
 * Resolve who is asking.
 *
 * `companyId` normally rides along in the JWT, but tokens issued before company
 * accounts existed do not carry it, so fall back to the user document rather
 * than locking those accounts out until they re-login.
 */
export const resolveScope = async (
  req: Request
): Promise<IApplicationScope> => {
  const user = req.user;

  if (!user?._id) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const isStaff = STAFF_ROLES.includes(user.role);
  const scope: IApplicationScope = {
    viewerId: String(user._id),
    role: user.role,
    isStaff,
  };

  if (user.role === USER_ROLE.COMPANY) {
    let companyId = user.companyId ? String(user.companyId) : '';

    if (!companyId) {
      const fresh = await User.findById(user._id).select('companyId');
      companyId = fresh?.companyId ? String(fresh.companyId) : '';
    }

    if (!companyId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Your account is not linked to a company profile yet.'
      );
    }

    scope.companyId = companyId;
  }

  req.applicationScope = scope;
  return scope;
};

// ─────────────────────────────────────────────────────────────────────────────
// OWNERSHIP CHECKS
// ─────────────────────────────────────────────────────────────────────────────

const forbidden = () =>
  new AppError(
    httpStatus.FORBIDDEN,
    'You do not have access to this application.'
  );

/** Throws unless the viewer may read applications for `jobId`. */
export const assertJobAccess = async (
  scope: IApplicationScope,
  jobId: string
): Promise<void> => {
  if (scope.isStaff) return;

  if (!Types.ObjectId.isValid(jobId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid job id');
  }

  const job = await Job.findById(jobId).select('company');

  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, 'Job not found');
  }

  const ownsJob =
    !!scope.companyId && String(job.company ?? '') === scope.companyId;

  if (!ownsJob) throw forbidden();
};

/**
 * Throws unless the viewer may read `applicationId`.
 *
 * Candidates are allowed through for their own applications so the same guard
 * can protect the detail and timeline endpoints they use.
 */
export const assertApplicationAccess = async (
  scope: IApplicationScope,
  applicationId: string
): Promise<void> => {
  if (scope.isStaff) return;

  if (!Types.ObjectId.isValid(applicationId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid application id');
  }

  const application = await JobApplication.findById(applicationId).select(
    'jobId userId'
  );

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, 'Application not found');
  }

  if (String(application.userId) === scope.viewerId) return;

  await assertJobAccess(scope, String(application.jobId));
};

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────

/** Populates `req.applicationScope`. Mount after `auth(...)`. */
export const withScope = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    await resolveScope(req);
    next();
  }
);

/** Guards routes keyed by `:jobId`. */
export const guardJobScope = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const scope = await resolveScope(req);
    await assertJobAccess(scope, req.params.jobId as string);
    next();
  }
);

/** Guards routes keyed by `:id` (an application id). */
export const guardApplicationScope = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const scope = await resolveScope(req);
    await assertApplicationAccess(scope, req.params.id as string);
    next();
  }
);

/**
 * Guards list endpoints, which have no id to check.
 *
 * Only establishes the scope - it deliberately does NOT rewrite
 * `req.query.companyId`. In Express 5 `req.query` is a getter that re-parses the
 * query string on every access, so an assignment here is silently discarded and
 * the caller's original value survives into the controller. A company passing
 * `?companyId=<someone else>` would have read another company's applications.
 *
 * Controllers must therefore resolve the company through
 * `resolveListCompanyId(req)` below, never from the raw query.
 */
export const guardApplicationList = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const scope = await resolveScope(req);

    if (!scope.isStaff && !scope.companyId) throw forbidden();

    next();
  }
);

/**
 * The company a list endpoint should be filtered by.
 *
 * Non-staff are pinned to their own company and the query parameter is ignored
 * entirely. Staff may filter by any company they ask for, or see everything.
 */
export const resolveListCompanyId = (req: Request): string | undefined => {
  const scope = req.applicationScope;

  if (!scope) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Application scope was not resolved. Mount guardApplicationList first.'
    );
  }

  if (!scope.isStaff) return scope.companyId;

  const requested = req.query.companyId;
  return typeof requested === 'string' && requested ? requested : undefined;
};
