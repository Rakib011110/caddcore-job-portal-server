"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCompanyOwnership = exports.checkJobOwnership = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../error/AppError"));
const job_model_1 = require("../modules/jobs/job.model");
const user_constant_1 = require("../modules/User/user.constant");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTHORIZATION HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Simple functions to check resource ownership.
 * Call these in your controllers, not as middleware.
 *
 * USAGE:
 *   await checkJobOwnership(req.params.id, req.user);
 */
/**
 * Check if user can modify a job
 * - ADMIN/HR can modify any job
 * - COMPANY can only modify their own company's jobs
 */
const checkJobOwnership = async (jobId, user) => {
    if (!jobId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Job ID is required");
    }
    // Admin/HR can access any job
    if (user?.role === user_constant_1.USER_ROLE.ADMIN || user?.role === user_constant_1.USER_ROLE.HR) {
        return true;
    }
    const job = await job_model_1.Job.findById(jobId);
    if (!job) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    }
    // COMPANY must own the job
    if (user?.role === user_constant_1.USER_ROLE.COMPANY) {
        if (!user.companyId || job.company?.toString() !== user.companyId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You can only modify your own company's jobs");
        }
    }
    return true;
};
exports.checkJobOwnership = checkJobOwnership;
/**
 * Check if user can modify a company
 * - ADMIN/HR can modify any company
 * - COMPANY can only modify their own company
 */
const checkCompanyOwnership = async (companyId, user) => {
    // Admin/HR can access any company
    if (user?.role === user_constant_1.USER_ROLE.ADMIN || user?.role === user_constant_1.USER_ROLE.HR) {
        return true;
    }
    // COMPANY must own the company
    if (user?.role === user_constant_1.USER_ROLE.COMPANY) {
        if (!user.companyId || companyId !== user.companyId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You can only modify your own company");
        }
    }
    return true;
};
exports.checkCompanyOwnership = checkCompanyOwnership;
//# sourceMappingURL=authorization.js.map