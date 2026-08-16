import { NextFunction, Request, Response } from 'express';
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
export interface IApplicationScope {
    viewerId: string;
    role: string;
    /** Staff see everything and skip ownership checks */
    isStaff: boolean;
    /** Set for COMPANY viewers - the company whose jobs they may read */
    companyId?: string;
}
/**
 * Resolve who is asking.
 *
 * `companyId` normally rides along in the JWT, but tokens issued before company
 * accounts existed do not carry it, so fall back to the user document rather
 * than locking those accounts out until they re-login.
 */
export declare const resolveScope: (req: Request) => Promise<IApplicationScope>;
/** Throws unless the viewer may read applications for `jobId`. */
export declare const assertJobAccess: (scope: IApplicationScope, jobId: string) => Promise<void>;
/**
 * Throws unless the viewer may read `applicationId`.
 *
 * Candidates are allowed through for their own applications so the same guard
 * can protect the detail and timeline endpoints they use.
 */
export declare const assertApplicationAccess: (scope: IApplicationScope, applicationId: string) => Promise<void>;
/** Populates `req.applicationScope`. Mount after `auth(...)`. */
export declare const withScope: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Guards routes keyed by `:jobId`. */
export declare const guardJobScope: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Guards routes keyed by `:id` (an application id). */
export declare const guardApplicationScope: (req: Request, res: Response, next: NextFunction) => Promise<void>;
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
export declare const guardApplicationList: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * The company a list endpoint should be filtered by.
 *
 * Non-staff are pinned to their own company and the query parameter is ignored
 * entirely. Staff may filter by any company they ask for, or see everything.
 */
export declare const resolveListCompanyId: (req: Request) => string | undefined;
//# sourceMappingURL=application.access.d.ts.map