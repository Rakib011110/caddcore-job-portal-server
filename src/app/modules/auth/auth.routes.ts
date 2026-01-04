import express from 'express';
import { requireAuth, requireAdmin } from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', AuthControllers.registerUser);
router.post('/login', AuthControllers.loginUser);
router.post('/refresh-token', AuthControllers.refreshToken);
router.post('/verify-email', AuthControllers.verifyEmail);
router.post('/resend-verification', AuthControllers.resendVerificationEmail);
router.post('/forgot-password', AuthControllers.forgotPassword);
router.post('/reset-password', AuthControllers.resetPassword);

// Protected routes (authentication required)
router.post('/logout', requireAuth, AuthControllers.logout);

router.post(
  '/change-password',
  requireAuth,
  AuthControllers.changePassword
);

// Admin only routes
router.post(
  '/bulk-register',
  requireAdmin,
  AuthControllers.bulkRegisterUsers
);

// User profile route (requires authentication)
router.get(
  '/me',
  requireAuth,
  AuthControllers.getMyProfile
);

export const AuthRoutes = router;