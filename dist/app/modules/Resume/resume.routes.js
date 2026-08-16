"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const requireVerifiedViewer_1 = require("../../middlewares/requireVerifiedViewer");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const resume_controller_1 = require("./resume.controller");
const resume_export_controller_1 = require("./resume.export.controller");
const resume_validation_1 = require("./resume.validation");
const router = express_1.default.Router();
// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES (public - candidates compare formats before signing up)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/templates', resume_export_controller_1.ResumeExportControllers.listTemplates);
// ─────────────────────────────────────────────────────────────────────────────
// TALENT-POOL CANDIDATE CV — MEMBERS ONLY
// ─────────────────────────────────────────────────────────────────────────────
// The approved CV behind a talent-pool profile. Visible to exactly the same
// extent the profile itself is: the service still applies the candidate-side
// rule (verified and active), and `requireVerifiedViewer` now applies the
// reader-side one. A CV carries more personal data than the profile card does,
// so leaving it open would have made the gate on the profile pointless.
router.get('/candidate/:userId', auth_1.requireAuth, requireVerifiedViewer_1.requireVerifiedViewer, resume_controller_1.ResumeControllers.getPublicCandidateResume);
// Same CV as a document: `.pdf` downloads a file, the bare path returns the
// HTML the preview frame embeds.
router.get(['/candidate/:userId/export', '/candidate/:userId/export.pdf'], auth_1.requireAuth, requireVerifiedViewer_1.requireVerifiedViewer, resume_export_controller_1.ResumeExportControllers.exportPublicCandidateResume);
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
router.get('/admin/all', auth_1.requireAdmin, resume_controller_1.ResumeControllers.getAllResumes);
// Queue counters
router.get('/admin/stats', auth_1.requireAdmin, resume_controller_1.ResumeControllers.getResumeStats);
// Full resume for review
router.get('/admin/:id', auth_1.requireAdmin, resume_controller_1.ResumeControllers.getResumeById);
// Review copy. `.pdf` downloads a real file, the bare path returns the HTML
// the preview frame embeds - same document either way.
router.get(['/admin/:id/export', '/admin/:id/export.pdf'], auth_1.requireAdmin, resume_export_controller_1.ResumeExportControllers.exportResumeForReview);
// Approve
router.patch('/admin/:id/approve', auth_1.requireAdmin, (0, validateRequest_1.default)(resume_validation_1.ResumeValidations.approveResumeValidationSchema), resume_controller_1.ResumeControllers.approveResume);
// Reject (feedback optional)
router.patch('/admin/:id/reject', auth_1.requireAdmin, (0, validateRequest_1.default)(resume_validation_1.ResumeValidations.rejectResumeValidationSchema), resume_controller_1.ResumeControllers.rejectResume);
// ─────────────────────────────────────────────────────────────────────────────
// USER ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Can I apply for jobs yet?
router.get('/me/eligibility', auth_1.requireAuth, resume_controller_1.ResumeControllers.getMyEligibility);
// My working CV (created from my profile on first access)
router.get('/me/primary', auth_1.requireAuth, resume_controller_1.ResumeControllers.getPrimaryResume);
// List my resumes
router.get('/', auth_1.requireAuth, resume_controller_1.ResumeControllers.getMyResumes);
// Create a resume
router.post('/', auth_1.requireAuth, (0, validateRequest_1.default)(resume_validation_1.ResumeValidations.createResumeValidationSchema), resume_controller_1.ResumeControllers.createResume);
// Read one of my resumes
router.get('/:id', auth_1.requireAuth, resume_controller_1.ResumeControllers.getMyResumeById);
// Print-ready copy. Approved CVs export only in the template they were approved
// in; drafts export in any template and carry a DRAFT stamp.
router.get(['/:id/export', '/:id/export.pdf'], auth_1.requireAuth, resume_export_controller_1.ResumeExportControllers.exportMyResume);
// Edit
router.patch('/:id', auth_1.requireAuth, (0, validateRequest_1.default)(resume_validation_1.ResumeValidations.updateResumeValidationSchema), resume_controller_1.ResumeControllers.updateResume);
// Delete
router.delete('/:id', auth_1.requireAuth, resume_controller_1.ResumeControllers.deleteResume);
// Submit for review
router.patch('/:id/submit', auth_1.requireAuth, (0, validateRequest_1.default)(resume_validation_1.ResumeValidations.submitResumeValidationSchema), resume_controller_1.ResumeControllers.submitForReview);
// Withdraw from review
router.patch('/:id/withdraw', auth_1.requireAuth, resume_controller_1.ResumeControllers.withdrawSubmission);
// Re-pull content from my profile CV
router.patch('/:id/sync-from-profile', auth_1.requireAuth, resume_controller_1.ResumeControllers.syncFromProfile);
// Set as default resume
router.patch('/:id/set-default', auth_1.requireAuth, resume_controller_1.ResumeControllers.setDefaultResume);
exports.ResumeRoutes = router;
//# sourceMappingURL=resume.routes.js.map