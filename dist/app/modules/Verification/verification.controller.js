"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const verification_services_1 = require("./verification.services");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VERIFICATION CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// USER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Apply for verification
 */
const applyForVerification = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    const result = await verification_services_1.VerificationServices.applyForVerification(userId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Verification request submitted successfully',
        data: result,
    });
});
/**
 * Get my verification status
 */
const getMyVerificationStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    const result = await verification_services_1.VerificationServices.getMyVerificationStatus(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Verification status fetched successfully',
        data: result,
    });
});
/**
 * Update verification request
 */
const updateVerificationRequest = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Request ID is required',
            data: null,
        });
    }
    const result = await verification_services_1.VerificationServices.updateVerificationRequest(id, userId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Verification request updated successfully',
        data: result,
    });
});
/**
 * Cancel verification request
 */
const cancelVerificationRequest = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Request ID is required',
            data: null,
        });
    }
    const result = await verification_services_1.VerificationServices.cancelVerificationRequest(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: result.message,
        data: null,
    });
});
/**
 * Get courses list
 */
const getCoursesList = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = verification_services_1.VerificationServices.getCoursesList();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Courses list fetched successfully',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get all verification requests (Admin)
 */
const getAllVerificationRequests = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { status, page, limit, searchTerm } = req.query;
    const result = await verification_services_1.VerificationServices.getAllVerificationRequests({
        status: status,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        searchTerm: searchTerm,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Verification requests fetched successfully',
        data: result.data,
        meta: result.meta,
    });
});
/**
 * Get single verification request (Admin)
 */
const getSingleVerificationRequest = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Request ID is required',
            data: null,
        });
    }
    const result = await verification_services_1.VerificationServices.getSingleVerificationRequest(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Verification request fetched successfully',
        data: result,
    });
});
/**
 * Approve verification request (Admin)
 */
const approveVerification = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.user?._id || req.user?.id;
    const { id } = req.params;
    if (!adminId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Request ID is required',
            data: null,
        });
    }
    const result = await verification_services_1.VerificationServices.approveVerification(id, adminId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Verification request approved successfully',
        data: result,
    });
});
/**
 * Reject verification request (Admin)
 */
const rejectVerification = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.user?._id || req.user?.id;
    const { id } = req.params;
    if (!adminId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Request ID is required',
            data: null,
        });
    }
    const result = await verification_services_1.VerificationServices.rejectVerification(id, adminId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Verification request rejected',
        data: result,
    });
});
/**
 * Get verification stats (Admin)
 */
const getVerificationStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await verification_services_1.VerificationServices.getVerificationStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Verification stats fetched successfully',
        data: result,
    });
});
/**
 * Upgrade user to Platinum badge (Admin)
 */
const upgradeToPlatinum = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.user?._id || req.user?.id;
    const { userId } = req.params;
    if (!adminId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'User ID is required',
            data: null,
        });
    }
    const result = await verification_services_1.VerificationServices.upgradeToPlatinum(userId, adminId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: result.message,
        data: null,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
exports.VerificationControllers = {
    // User
    applyForVerification,
    getMyVerificationStatus,
    updateVerificationRequest,
    cancelVerificationRequest,
    getCoursesList,
    // Admin
    getAllVerificationRequests,
    getSingleVerificationRequest,
    approveVerification,
    rejectVerification,
    getVerificationStats,
    upgradeToPlatinum,
};
//# sourceMappingURL=verification.controller.js.map