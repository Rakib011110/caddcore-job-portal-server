"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const resume_service_1 = require("./resume.service");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const getUserId = (req) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Authentication required');
    }
    return userId;
};
// ─────────────────────────────────────────────────────────────────────────────
// USER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/** Create a resume (optionally pre-filled from the user's profile CV) */
const createResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.createResume(userId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Resume created successfully',
        data: result,
    });
});
/** List my resumes */
const getMyResumes = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const filters = {};
    if (req.query.status) {
        filters.status = req.query.status;
    }
    const result = await resume_service_1.ResumeService.getMyResumes(userId, filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resumes fetched successfully',
        data: result,
    });
});
/** Get one of my resumes */
const getMyResumeById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.getMyResumeById(userId, req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume fetched successfully',
        data: result,
    });
});
/** My working CV — created from my profile on first access */
const getPrimaryResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.ensurePrimaryResume(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume fetched successfully',
        data: result,
    });
});
/** Re-pull resume content from my profile CV */
const syncFromProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.syncFromProfile(userId, req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume updated from your profile',
        data: result,
    });
});
/** Update a resume */
const updateResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.updateResume(userId, req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume updated successfully',
        data: result,
    });
});
/** Delete a resume (soft delete) */
const deleteResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.deleteResume(userId, req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: result.message,
        data: result,
    });
});
/** Mark a resume as the default one */
const setDefaultResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.setDefaultResume(userId, req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Default resume updated successfully',
        data: result,
    });
});
/** Submit a resume for review */
const submitForReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.submitForReview(userId, req.params.id, req.body || {});
    const autoApproved = result.status === 'approved';
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: autoApproved
            ? 'Resume approved successfully'
            : 'Resume submitted for review. It is now pending approval.',
        data: result,
    });
});
/** Withdraw a resume from the review queue */
const withdrawSubmission = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.withdrawSubmission(userId, req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume withdrawn from review',
        data: result,
    });
});
/** Can I apply for jobs yet? */
/** CV completeness for the progress bar, with the next steps to fill in. */
const getMyCvCompleteness = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.getCvCompleteness(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'CV completeness fetched successfully',
        data: result,
    });
});
const getMyEligibility = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const result = await resume_service_1.ResumeService.getEligibility(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Eligibility fetched successfully',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * The approved CV behind a public candidate profile.
 *
 * `data: null` is a normal answer, not an error: the candidate is visible, they
 * just have no approved CV yet. The profile page shows their self-entered
 * details in that case and says so.
 */
const getPublicCandidateResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await resume_service_1.ResumeService.getPublicCandidateResume(req.params.userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: result
            ? 'Approved CV fetched successfully'
            : 'This candidate has no approved CV yet',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / REVIEWER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/** Review queue */
const getAllResumes = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const filters = {
        ...(req.query.status ? { status: req.query.status } : {}),
        ...(req.query.userId ? { userId: req.query.userId } : {}),
        ...(req.query.searchTerm
            ? { searchTerm: req.query.searchTerm }
            : {}),
        ...(req.query.page ? { page: Number(req.query.page) } : {}),
        ...(req.query.limit ? { limit: Number(req.query.limit) } : {}),
        ...(req.query.sortBy ? { sortBy: req.query.sortBy } : {}),
        ...(req.query.sortOrder
            ? { sortOrder: req.query.sortOrder }
            : {}),
    };
    const { data, meta } = await resume_service_1.ResumeService.getAllResumes(filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resumes fetched successfully',
        data,
        meta,
    });
});
/** Full resume for the reviewer */
const getResumeById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await resume_service_1.ResumeService.getResumeById(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume fetched successfully',
        data: result,
    });
});
/** Approve */
const approveResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const reviewerId = getUserId(req);
    const reviewerRole = req.user?.role || 'ADMIN';
    const result = await resume_service_1.ResumeService.approveResume(req.params.id, reviewerId, reviewerRole, req.body || {});
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume approved successfully',
        data: result,
    });
});
/** Reject (feedback optional) */
const rejectResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const reviewerId = getUserId(req);
    const reviewerRole = req.user?.role || 'ADMIN';
    const result = await resume_service_1.ResumeService.rejectResume(req.params.id, reviewerId, reviewerRole, req.body || {});
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume rejected',
        data: result,
    });
});
/** Review queue counters */
const getResumeStats = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const result = await resume_service_1.ResumeService.getResumeStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Resume stats fetched successfully',
        data: result,
    });
});
exports.ResumeControllers = {
    // User
    createResume,
    getMyResumes,
    getMyResumeById,
    getPrimaryResume,
    syncFromProfile,
    updateResume,
    deleteResume,
    setDefaultResume,
    submitForReview,
    withdrawSubmission,
    getMyEligibility,
    getMyCvCompleteness,
    // Public
    getPublicCandidateResume,
    // Admin
    getAllResumes,
    getResumeById,
    approveResume,
    rejectResume,
    getResumeStats,
};
//# sourceMappingURL=resume.controller.js.map