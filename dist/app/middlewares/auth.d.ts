import { NextFunction, Request, Response } from 'express';
import { USER_ROLE } from '../modules/User/user.constant';
/**
 * Main authentication middleware with optional role-based access control
 */
declare const auth: (...requiredRoles: (keyof typeof USER_ROLE)[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Any authenticated user */
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Admin or HR access only */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Regular users (including teachers, students, admins) */
export declare const requireUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Teachers and admins only */
export declare const requireTeacher: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Students and admins only */
export declare const requireStudent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if user owns the resource or is admin
 */
export declare const requireOwnershipOrAdmin: (userIdField?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check email verification
 */
export declare const requireEmailVerification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Company or Admin users only */
export declare const requireCompany: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default auth;
//# sourceMappingURL=auth.d.ts.map