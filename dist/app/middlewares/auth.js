"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCompany = exports.requireEmailVerification = exports.requireOwnershipOrAdmin = exports.requireStudent = exports.requireTeacher = exports.requireUser = exports.requireAdmin = exports.requireAuth = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../utils/catchAsync");
const user_constant_1 = require("../modules/User/user.constant");
const user_model_1 = require("../modules/User/user.model");
const AppError_1 = __importDefault(require("../error/AppError"));
const config_1 = __importDefault(require("../../config"));
const verifyJWT_1 = require("../utils/verifyJWT");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTHENTICATION MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides JWT-based authentication and role-based access control.
 *
 * USAGE:
 *   router.get('/protected', auth(), controller);
 *   router.get('/admin-only', auth('ADMIN'), controller);
 *   router.get('/multi-role', auth('ADMIN', 'HR'), controller);
 */
// Rate limiting store (simple in-memory)
const authAttempts = new Map();
// Cleanup old rate limit entries every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of authAttempts.entries()) {
        if (now > value.resetTime) {
            authAttempts.delete(key);
        }
    }
}, 60000);
/**
 * Check rate limiting for authentication requests
 */
const checkRateLimit = (req) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 500; // Increased to support chat polling
    const now = Date.now();
    const windowKey = `${clientIP}:${Math.floor(now / windowMs)}`;
    const attempts = authAttempts.get(windowKey) || { count: 0, resetTime: now + windowMs };
    if (attempts.count >= maxAttempts) {
        return false;
    }
    attempts.count++;
    authAttempts.set(windowKey, attempts);
    return true;
};
/**
 * Main authentication middleware with optional role-based access control
 */
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.catchAsync)(async (req, res, next) => {
        // Skip rate limiting for chat endpoints (they use polling)
        const isChatEndpoint = req.originalUrl.includes('/chat/');
        // Check rate limiting (skip for chat endpoints)
        if (!isChatEndpoint && !checkRateLimit(req)) {
            throw new AppError_1.default(http_status_1.default.TOO_MANY_REQUESTS, 'Too many requests. Please try again later.');
        }
        let token = req.headers.authorization;
        // Validate authorization header
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized! Please provide a valid token.');
        }
        // Extract token from Bearer format
        if (token.startsWith('Bearer ')) {
            token = token.slice(7);
        }
        // Validate token format
        if (!token || token.length < 10) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid token format!');
        }
        // Verify JWT token
        let decoded;
        try {
            decoded = (0, verifyJWT_1.verifyToken)(token, config_1.default.jwt_access_secret);
        }
        catch (error) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid or expired token!');
        }
        const { role, email, iat, exp } = decoded;
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (exp && exp < currentTime) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Token has expired!');
        }
        // Verify user exists
        const user = await user_model_1.User.isUserExistsByEmail(email);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user does not exist!');
        }
        // Check if user is blocked
        if (user?.status === 'BLOCKED') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user account is blocked!');
        }
        // Check if password was changed after token was issued
        if (user.passwordChangedAt && user_model_1.User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Password has been changed. Please login again!');
        }
        // Role-based access control
        if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to access this resource!');
        }
        // Attach user info to request
        req.user = {
            ...decoded,
            _id: user._id?.toString() || '',
            id: user._id?.toString() || '',
            email: decoded.email,
            role: decoded.role,
            status: user.status,
            emailVerified: user.emailVerified,
            name: user.name,
            mobileNumber: user.mobileNumber,
            companyId: decoded.companyId, // For COMPANY role authorization
        };
        next();
    });
};
// ─────────────────────────────────────────────────────────────────────────────
// PRE-CONFIGURED AUTH MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────
/** Any authenticated user */
exports.requireAuth = auth();
/** Admin or HR access only */
exports.requireAdmin = auth(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.HR);
/** Regular users (including teachers, students, admins) */
exports.requireUser = auth(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.TEACHER, user_constant_1.USER_ROLE.STUDENT, user_constant_1.USER_ROLE.ADMIN);
/** Teachers and admins only */
exports.requireTeacher = auth(user_constant_1.USER_ROLE.TEACHER, user_constant_1.USER_ROLE.ADMIN);
/** Students and admins only */
exports.requireStudent = auth(user_constant_1.USER_ROLE.STUDENT, user_constant_1.USER_ROLE.ADMIN);
/**
 * Middleware to check if user owns the resource or is admin
 */
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
    return (0, catchAsync_1.catchAsync)(async (req, res, next) => {
        const userId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];
        if (!userId) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User ID not found in request');
        }
        if (req.user?.role === user_constant_1.USER_ROLE.ADMIN || req.user?.role === user_constant_1.USER_ROLE.HR || req.user?._id === userId) {
            return next();
        }
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only access your own resources!');
    });
};
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
/**
 * Middleware to check email verification
 */
exports.requireEmailVerification = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.user?.emailVerified) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Email verification required!');
    }
    next();
});
/** Company or Admin users only */
exports.requireCompany = auth(user_constant_1.USER_ROLE.COMPANY, user_constant_1.USER_ROLE.ADMIN);
exports.default = auth;
//# sourceMappingURL=auth.js.map