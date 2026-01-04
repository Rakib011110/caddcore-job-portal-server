import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { USER_ROLE } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';
import AppError from '../error/AppError';
import config from '../../config';
import { verifyToken } from '../utils/verifyJWT';

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
const authAttempts = new Map<string, { count: number; resetTime: number }>();

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
const checkRateLimit = (req: Request): boolean => {
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
const auth = (...requiredRoles: (keyof typeof USER_ROLE)[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting for chat endpoints (they use polling)
    const isChatEndpoint = req.originalUrl.includes('/chat/');
    
    // Check rate limiting (skip for chat endpoints)
    if (!isChatEndpoint && !checkRateLimit(req)) {
      throw new AppError(httpStatus.TOO_MANY_REQUESTS, 'Too many requests. Please try again later.');
    }

    let token = req.headers.authorization;

    // Validate authorization header
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized! Please provide a valid token.');
    }

    // Extract token from Bearer format
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Validate token format
    if (!token || token.length < 10) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token format!');
    }

    // Verify JWT token
    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token, config.jwt_access_secret as string) as JwtPayload;
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token!');
    }

    const { role, email, iat, exp } = decoded;

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (exp && exp < currentTime) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token has expired!');
    }

    // Verify user exists
    const user = await User.isUserExistsByEmail(email);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist!');
    }

    // Check if user is blocked
    if (user?.status === 'BLOCKED') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user account is blocked!');
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Password has been changed. Please login again!');
    }

    // Role-based access control
    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to access this resource!');
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
export const requireAuth = auth();

/** Admin or HR access only */
export const requireAdmin = auth(USER_ROLE.ADMIN, USER_ROLE.HR);

/** Regular users (including teachers, students, admins) */
export const requireUser = auth(USER_ROLE.USER, USER_ROLE.TEACHER, USER_ROLE.STUDENT, USER_ROLE.ADMIN);

/** Teachers and admins only */
export const requireTeacher = auth(USER_ROLE.TEACHER, USER_ROLE.ADMIN);

/** Students and admins only */
export const requireStudent = auth(USER_ROLE.STUDENT, USER_ROLE.ADMIN);

/**
 * Middleware to check if user owns the resource or is admin
 */
export const requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];

    if (!userId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User ID not found in request');
    }

    if (req.user?.role === USER_ROLE.ADMIN || req.user?.role === USER_ROLE.HR || req.user?._id === userId) {
      return next();
    }

    throw new AppError(httpStatus.FORBIDDEN, 'You can only access your own resources!');
  });
};

/**
 * Middleware to check email verification
 */
export const requireEmailVerification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.emailVerified) {
    throw new AppError(httpStatus.FORBIDDEN, 'Email verification required!');
  }
  next();
});

/** Company or Admin users only */
export const requireCompany = auth(USER_ROLE.COMPANY, USER_ROLE.ADMIN);

export default auth;