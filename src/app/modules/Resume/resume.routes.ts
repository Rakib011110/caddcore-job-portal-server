import express from 'express';
import { requireAuth, requireAdmin } from '../../middlewares/auth';
import { requireVerifiedViewer } from '../../middlewares/requireVerifiedViewer';
import validateRequest from '../../middlewares/validateRequest';
import { ResumeControllers } from './resume.controller';
import { ResumeExportControllers } from './resume.export.controller';
import { ResumeValidations } from './resume.validation';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES (public - candidates compare formats before signing up)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/templates', ResumeExportControllers.listTemplates);

// ─────────────────────────────────────────────────────────────────────────────
// TALENT-POOL CANDIDATE CV — MEMBERS ONLY
// ─────────────────────────────────────────────────────────────────────────────
// The approved CV behind a talent-pool profile. Visible to exactly the same
// extent the profile itself is: the service still applies the candidate-side
// rule (verified and active), and `requireVerifiedViewer` now applies the
// reader-side one. A CV carries more personal data than the profile card does,
// so leaving it open would have made the gate on the profile pointless.

router.get(
  '/candidate/:userId',
  requireAuth,
  requireVerifiedViewer,
  ResumeControllers.getPublicCandidateResume
);

// Same CV as a document: `.pdf` downloads a file, the bare path returns the
// HTML the preview frame embeds.
router.get(
  ['/candidate/:userId/export', '/candidate/:userId/export.pdf'],
  requireAuth,
  requireVerifiedViewer,
  ResumeExportControllers.exportPublicCandidateResume
);

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Admin routes are declared BEFORE `/:id` so that `/admin/...` is never
 * swallowed by the id parameter.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / REVIEWER ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Review queue
router.get('/admin/all', requireAdmin, ResumeControllers.getAllResumes);

// Queue counters
router.get('/admin/stats', requireAdmin, ResumeControllers.getResumeStats);

// Full resume for review
router.get('/admin/:id', requireAdmin, ResumeControllers.getResumeById);

// Review copy. `.pdf` downloads a real file, the bare path returns the HTML
// the preview frame embeds - same document either way.
router.get(
  ['/admin/:id/export', '/admin/:id/export.pdf'],
  requireAdmin,
  ResumeExportControllers.exportResumeForReview
);

// Approve
router.patch(
  '/admin/:id/approve',
  requireAdmin,
  validateRequest(ResumeValidations.approveResumeValidationSchema),
  ResumeControllers.approveResume
);

// Reject (feedback optional)
router.patch(
  '/admin/:id/reject',
  requireAdmin,
  validateRequest(ResumeValidations.rejectResumeValidationSchema),
  ResumeControllers.rejectResume
);

// ─────────────────────────────────────────────────────────────────────────────
// USER ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Can I apply for jobs yet?
router.get('/me/eligibility', requireAuth, ResumeControllers.getMyEligibility);

// CV completeness for the candidate's progress bar
router.get('/me/completeness', requireAuth, ResumeControllers.getMyCvCompleteness);

// My working CV (created from my profile on first access)
router.get('/me/primary', requireAuth, ResumeControllers.getPrimaryResume);

// List my resumes
router.get('/', requireAuth, ResumeControllers.getMyResumes);

// Create a resume
router.post(
  '/',
  requireAuth,
  validateRequest(ResumeValidations.createResumeValidationSchema),
  ResumeControllers.createResume
);

// Read one of my resumes
router.get('/:id', requireAuth, ResumeControllers.getMyResumeById);

// Print-ready copy. Approved CVs export only in the template they were approved
// in; drafts export in any template and carry a DRAFT stamp.
router.get(
  ['/:id/export', '/:id/export.pdf'],
  requireAuth,
  ResumeExportControllers.exportMyResume
);

// Edit
router.patch(
  '/:id',
  requireAuth,
  validateRequest(ResumeValidations.updateResumeValidationSchema),
  ResumeControllers.updateResume
);

// Delete
router.delete('/:id', requireAuth, ResumeControllers.deleteResume);

// Submit for review
router.patch(
  '/:id/submit',
  requireAuth,
  validateRequest(ResumeValidations.submitResumeValidationSchema),
  ResumeControllers.submitForReview
);

// Withdraw from review
router.patch('/:id/withdraw', requireAuth, ResumeControllers.withdrawSubmission);

// Re-pull content from my profile CV
router.patch(
  '/:id/sync-from-profile',
  requireAuth,
  ResumeControllers.syncFromProfile
);

// Set as default resume
router.patch('/:id/set-default', requireAuth, ResumeControllers.setDefaultResume);

export const ResumeRoutes = router;
