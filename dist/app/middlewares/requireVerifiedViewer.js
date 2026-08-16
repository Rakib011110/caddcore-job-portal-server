"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerifiedViewer = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = __importDefault(require("../error/AppError"));
const user_model_1 = require("../modules/User/user.model");
const company_model_1 = require("../modules/Company/company.model");
const user_constant_1 = require("../modules/User/user.constant");
const company_constant_1 = require("../modules/Company/company.constant");
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
const STAFF_ROLES = [
    user_constant_1.USER_ROLE.ADMIN,
    user_constant_1.USER_ROLE.HR,
    user_constant_1.USER_ROLE.MARKETING_TEAM,
    user_constant_1.USER_ROLE.CUSTOMER_SERVICE_TEAM,
];
exports.requireVerifiedViewer = (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
    const requester = req.user;
    if (!requester?._id) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Please sign in to view this directory.');
    }
    if (STAFF_ROLES.includes(requester.role)) {
        return next();
    }
    // ── Employers ────────────────────────────────────────────────────────────
    if (requester.role === user_constant_1.USER_ROLE.COMPANY) {
        const company = await company_model_1.Company.findOne({ userId: requester._id }).select('status');
        if (company?.status === company_constant_1.COMPANY_STATUS.APPROVED) {
            return next();
        }
        const reason = company?.status === company_constant_1.COMPANY_STATUS.REJECTED
            ? 'Your company profile was not approved. Update your details and resubmit to regain access.'
            : company?.status === company_constant_1.COMPANY_STATUS.SUSPENDED
                ? 'Your company account is suspended. Please contact the CADD CORE team to restore access.'
                : 'Your company is awaiting admin approval. You will get access as soon as it is approved.';
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, reason);
    }
    // ── Job seekers ──────────────────────────────────────────────────────────
    const user = await user_model_1.User.findById(requester._id).select('caddcoreVerification');
    if (user?.caddcoreVerification?.isVerified) {
        return next();
    }
    const status = user?.caddcoreVerification?.verificationStatus;
    const reason = status === 'pending'
        ? 'Your CADD CORE verification is still under review. You will get access once it is approved.'
        : status === 'rejected'
            ? 'Your CADD CORE verification was not approved. Please review the feedback and apply again.'
            : 'CADD CORE verification is required to browse this directory.';
    throw new AppError_1.default(http_status_1.default.FORBIDDEN, reason);
});
exports.default = exports.requireVerifiedViewer;
//# sourceMappingURL=requireVerifiedViewer.js.map