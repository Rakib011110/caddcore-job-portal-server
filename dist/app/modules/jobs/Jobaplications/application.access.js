"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveListCompanyId = exports.guardApplicationList = exports.guardApplicationScope = exports.guardJobScope = exports.withScope = exports.assertApplicationAccess = exports.assertJobAccess = exports.resolveScope = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../error/AppError"));
const catchAsync_1 = require("../../../utils/catchAsync");
const user_constant_1 = require("../../User/user.constant");
const user_model_1 = require("../../User/user.model");
const job_model_1 = require("../job.model");
const Jobaplications_model_1 = require("./Jobaplications.model");
const STAFF_ROLES = [user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.HR];
/**
 * Resolve who is asking.
 *
 * `companyId` normally rides along in the JWT, but tokens issued before company
 * accounts existed do not carry it, so fall back to the user document rather
 * than locking those accounts out until they re-login.
 */
const resolveScope = async (req) => {
    const user = req.user;
    if (!user?._id) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Authentication required');
    }
    const isStaff = STAFF_ROLES.includes(user.role);
    const scope = {
        viewerId: String(user._id),
        role: user.role,
        isStaff,
    };
    if (user.role === user_constant_1.USER_ROLE.COMPANY) {
        let companyId = user.companyId ? String(user.companyId) : '';
        if (!companyId) {
            const fresh = await user_model_1.User.findById(user._id).select('companyId');
            companyId = fresh?.companyId ? String(fresh.companyId) : '';
        }
        if (!companyId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Your account is not linked to a company profile yet.');
        }
        scope.companyId = companyId;
    }
    req.applicationScope = scope;
    return scope;
};
exports.resolveScope = resolveScope;
// ─────────────────────────────────────────────────────────────────────────────
// OWNERSHIP CHECKS
// ─────────────────────────────────────────────────────────────────────────────
const forbidden = () => new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have access to this application.');
/** Throws unless the viewer may read applications for `jobId`. */
const assertJobAccess = async (scope, jobId) => {
    if (scope.isStaff)
        return;
    if (!mongoose_1.Types.ObjectId.isValid(jobId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid job id');
    }
    const job = await job_model_1.Job.findById(jobId).select('company');
    if (!job) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Job not found');
    }
    const ownsJob = !!scope.companyId && String(job.company ?? '') === scope.companyId;
    if (!ownsJob)
        throw forbidden();
};
exports.assertJobAccess = assertJobAccess;
/**
 * Throws unless the viewer may read `applicationId`.
 *
 * Candidates are allowed through for their own applications so the same guard
 * can protect the detail and timeline endpoints they use.
 */
const assertApplicationAccess = async (scope, applicationId) => {
    if (scope.isStaff)
        return;
    if (!mongoose_1.Types.ObjectId.isValid(applicationId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid application id');
    }
    const application = await Jobaplications_model_1.JobApplication.findById(applicationId).select('jobId userId');
    if (!application) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Application not found');
    }
    if (String(application.userId) === scope.viewerId)
        return;
    await (0, exports.assertJobAccess)(scope, String(application.jobId));
};
exports.assertApplicationAccess = assertApplicationAccess;
// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────
/** Populates `req.applicationScope`. Mount after `auth(...)`. */
exports.withScope = (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
    await (0, exports.resolveScope)(req);
    next();
});
/** Guards routes keyed by `:jobId`. */
exports.guardJobScope = (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
    const scope = await (0, exports.resolveScope)(req);
    await (0, exports.assertJobAccess)(scope, req.params.jobId);
    next();
});
/** Guards routes keyed by `:id` (an application id). */
exports.guardApplicationScope = (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
    const scope = await (0, exports.resolveScope)(req);
    await (0, exports.assertApplicationAccess)(scope, req.params.id);
    next();
});
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
exports.guardApplicationList = (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
    const scope = await (0, exports.resolveScope)(req);
    if (!scope.isStaff && !scope.companyId)
        throw forbidden();
    next();
});
/**
 * The company a list endpoint should be filtered by.
 *
 * Non-staff are pinned to their own company and the query parameter is ignored
 * entirely. Staff may filter by any company they ask for, or see everything.
 */
const resolveListCompanyId = (req) => {
    const scope = req.applicationScope;
    if (!scope) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Application scope was not resolved. Mount guardApplicationList first.');
    }
    if (!scope.isStaff)
        return scope.companyId;
    const requested = req.query.companyId;
    return typeof requested === 'string' && requested ? requested : undefined;
};
exports.resolveListCompanyId = resolveListCompanyId;
//# sourceMappingURL=application.access.js.map