import express from 'express';
import { requireAuth, requireAdmin } from '../../middlewares/auth';
import { VerificationControllers } from './verification.controller';

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VERIFICATION ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Get predefined CADDCORE courses list (no auth required)
router.get('/courses', VerificationControllers.getCoursesList);

// ─────────────────────────────────────────────────────────────────────────────
// USER ROUTES (Authentication Required)
// ─────────────────────────────────────────────────────────────────────────────

// Apply for verification
router.post(
  '/apply',
  requireAuth,
  VerificationControllers.applyForVerification
);

// Get my verification status
router.get(
  '/my-status',
  requireAuth,
  VerificationControllers.getMyVerificationStatus
);

// Update pending verification request
router.put(
  '/update/:id',
  requireAuth,
  VerificationControllers.updateVerificationRequest
);

// Cancel pending verification request
router.delete(
  '/cancel/:id',
  requireAuth,
  VerificationControllers.cancelVerificationRequest
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES (Admin Only)
// ─────────────────────────────────────────────────────────────────────────────

// Get all verification requests
router.get(
  '/admin/requests',
  requireAdmin,
  VerificationControllers.getAllVerificationRequests
);

// Get verification stats
router.get(
  '/admin/stats',
  requireAdmin,
  VerificationControllers.getVerificationStats
);

// Get single verification request
router.get(
  '/admin/requests/:id',
  requireAdmin,
  VerificationControllers.getSingleVerificationRequest
);

// Approve verification request
router.post(
  '/admin/approve/:id',
  requireAdmin,
  VerificationControllers.approveVerification
);

// Reject verification request
router.post(
  '/admin/reject/:id',
  requireAdmin,
  VerificationControllers.rejectVerification
);

// Upgrade user to Platinum badge
router.post(
  '/admin/upgrade-platinum/:userId',
  requireAdmin,
  VerificationControllers.upgradeToPlatinum
);

export const VerificationRoutes = router;
