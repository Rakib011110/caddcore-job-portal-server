import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../error/AppError';
import { User } from '../modules/User/user.model';
import { Company } from '../modules/Company/company.model';
import { USER_ROLE } from '../modules/User/user.constant';
import { COMPANY_STATUS } from '../modules/Company/company.constant';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REQUIRE VERIFIED VIEWER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Gate for the member-only directories (talent pool, and any future listing of
 * personal data). Must run *after* `auth()`, which is what puts `req.user` in
 * place and proves the caller holds a valid, unexpired token.
 *
 * ── Who gets through ────────────────────────────────────────────────────────
 *   Staff (ADMIN / HR / MARKETING_TEAM / CUSTOMER_SERVICE_TEAM)
 *   COMPANY whose company record is APPROVED
 *   Job seeker whose caddcoreVerification.isVerified is true
 *
 * Anything else gets a 403 with a message the client can show verbatim. The
 * roles and statuses are re-read from the database rather than trusted from the
 * JWT: a token minted before an account was suspended would otherwise keep
 * working until it expired.
 *
 * The client mirrors this policy in `useDirectoryAccess` so the UI can explain
 * the refusal, but this middleware is the one that actually enforces it.
 */

const STAFF_ROLES: string[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.HR,
  USER_ROLE.MARKETING_TEAM,
  USER_ROLE.CUSTOMER_SERVICE_TEAM,
];

export const requireVerifiedViewer = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const requester = req.user;

    if (!requester?._id) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Please sign in to view this directory.'
      );
    }

    if (STAFF_ROLES.includes(requester.role)) {
      return next();
    }

    // ── Employers ────────────────────────────────────────────────────────────
    if (requester.role === USER_ROLE.COMPANY) {
      const company = await Company.findOne({ userId: requester._id }).select(
        'status'
      );

      if (company?.status === COMPANY_STATUS.APPROVED) {
        return next();
      }

      const reason =
        company?.status === COMPANY_STATUS.REJECTED
          ? 'Your company profile was not approved. Update your details and resubmit to regain access.'
          : company?.status === COMPANY_STATUS.SUSPENDED
            ? 'Your company account is suspended. Please contact the CADD CORE team to restore access.'
            : 'Your company is awaiting admin approval. You will get access as soon as it is approved.';

      throw new AppError(httpStatus.FORBIDDEN, reason);
    }

    // ── Job seekers ──────────────────────────────────────────────────────────
    const user = await User.findById(requester._id).select(
      'caddcoreVerification'
    );

    if (user?.caddcoreVerification?.isVerified) {
      return next();
    }

    const status = user?.caddcoreVerification?.verificationStatus;

    const reason =
      status === 'pending'
        ? 'Your CADD CORE verification is still under review. You will get access once it is approved.'
        : status === 'rejected'
          ? 'Your CADD CORE verification was not approved. Please review the feedback and apply again.'
          : 'CADD CORE verification is required to browse this directory.';

    throw new AppError(httpStatus.FORBIDDEN, reason);
  }
);

export default requireVerifiedViewer;
