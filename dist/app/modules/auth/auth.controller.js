"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = exports.isTokenBlacklisted = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const catchAsync_1 = require("../../utils/catchAsync");
const auth_services_1 = require("./auth.services");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
// Blacklist for revoked tokens (in production, use Redis or database)
const tokenBlacklist = new Set();
const registerUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_services_1.AuthServices.registerUser(req.body);
    const { refreshToken, accessToken } = result;
    // Set secure HTTP-only cookies
    res.cookie('refreshToken', refreshToken, {
        secure: config_1.default.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User registered successfully!',
        data: {
            accessToken,
            refreshToken,
        },
    });
});
const loginUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_services_1.AuthServices.loginUser(req.body);
    const { refreshToken, accessToken } = result;
    // Set secure HTTP-only cookies
    res.cookie('refreshToken', refreshToken, {
        secure: config_1.default.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User logged in successfully!',
        data: {
            accessToken,
            refreshToken,
        },
    });
});
const logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    // Add token to blacklist if it exists
    if (token) {
        tokenBlacklist.add(token);
    }
    // Clear cookies
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config_1.default.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Logged out successfully!',
        data: null,
    });
});
const changePassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { ...passwordData } = req.body;
    if (!req.user) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'User not authenticated',
            data: null,
        });
    }
    const result = await auth_services_1.AuthServices.changePassword(req.user, passwordData);
    // Invalidate all existing tokens for this user (force re-login)
    // In production, you might want to implement token versioning
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password updated successfully!',
        data: result,
    });
});
const refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'Refresh token not found',
            data: null,
        });
    }
    const result = await auth_services_1.AuthServices.refreshToken(refreshToken);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Access token retrieved successfully!',
        data: result,
    });
});
// Add this new controller
const verifyEmail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { token } = req.body;
    const result = await auth_services_1.AuthServices.verifyEmail(token);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result.user,
    });
});
const resendVerificationEmail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email } = req.body;
    const result = await auth_services_1.AuthServices.resendVerificationEmail(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
const getMyProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'User ID not found in token',
            data: null,
        });
    }
    const result = await auth_services_1.AuthServices.getMyProfile(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User profile retrieved successfully",
        data: result,
    });
});
const forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_services_1.AuthServices.forgotPassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
const resetPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_services_1.AuthServices.resetPassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
const bulkRegisterUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_services_1.AuthServices.bulkRegisterUsers(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: {
            successful: result.successful,
            errors: result.errors,
            totalProcessed: result.totalProcessed,
            successCount: result.successCount,
            errorCount: result.errorCount
        },
    });
});
// Helper function to check if token is blacklisted
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
exports.isTokenBlacklisted = isTokenBlacklisted;
// Clean up expired tokens from blacklist periodically (in production, use Redis TTL)
setInterval(() => {
    // In production, implement proper cleanup based on token expiry
    // For now, we'll keep a reasonable size limit
    if (tokenBlacklist.size > 10000) {
        tokenBlacklist.clear();
    }
}, 3600000); // Clean every hour
exports.AuthControllers = {
    registerUser,
    loginUser,
    logout,
    changePassword,
    refreshToken,
    verifyEmail,
    resendVerificationEmail,
    getMyProfile,
    forgotPassword,
    resetPassword,
    bulkRegisterUsers,
    isTokenBlacklisted: exports.isTokenBlacklisted,
};
//# sourceMappingURL=auth.controller.js.map