"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const verification_controller_1 = require("./verification.controller");
const router = express_1.default.Router();
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VERIFICATION ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * MERGED INTO CV APPROVAL
 * ─────────────────────────────────────────────────────────────────────────────
 * Candidates no longer apply for verification separately. Their CADD CORE
 * credentials are a section of the CV (`Resume.caddcoreCredentials`), and
 * approving the CV grants the badge - see `Resume/resume.badge.ts`.
 *
 * What survives here:
 *   - `/courses`, which the CV builder's credentials section reads
 *   - the admin read endpoints, so historical requests stay auditable
 *   - the Platinum upgrade, which fires when a candidate is placed
 *
 * The old apply/update/cancel endpoints are gone. They are deliberately NOT
 * left as harmless no-ops: a submission through them would create a request in
 * a queue nobody reviews any more, and the candidate would be left waiting for
 * an approval that was never coming.
 */
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// The CADD CORE course list. Now read by the CV builder's credentials section.
router.get('/courses', verification_controller_1.VerificationControllers.getCoursesList);
// ─────────────────────────────────────────────────────────────────────────────
// USER ROUTES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Kept so an old client, or a bookmarked page, gets a clear answer instead of a
 * confusing 404. Points the caller at where the flow actually lives now.
 */
const movedToCv = (_req, res) => {
    res.status(410).json({
        success: false,
        message: 'Verification is now part of CV approval. Add your CADD CORE credentials in the CV builder and submit your CV - approving it grants your badge.',
        redirectTo: '/user-profile/cv-builder',
    });
};
router.post('/apply', auth_1.requireAuth, movedToCv);
router.put('/update/:id', auth_1.requireAuth, movedToCv);
router.delete('/cancel/:id', auth_1.requireAuth, movedToCv);
// Still live: reads the badge stored on the user, which the CV approval writes.
router.get('/my-status', auth_1.requireAuth, verification_controller_1.VerificationControllers.getMyVerificationStatus);
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES (Admin Only)
// ─────────────────────────────────────────────────────────────────────────────
// Get all verification requests
router.get('/admin/requests', auth_1.requireAdmin, verification_controller_1.VerificationControllers.getAllVerificationRequests);
// Get verification stats
router.get('/admin/stats', auth_1.requireAdmin, verification_controller_1.VerificationControllers.getVerificationStats);
// Get single verification request
router.get('/admin/requests/:id', auth_1.requireAdmin, verification_controller_1.VerificationControllers.getSingleVerificationRequest);
// Approve verification request
router.post('/admin/approve/:id', auth_1.requireAdmin, verification_controller_1.VerificationControllers.approveVerification);
// Reject verification request
router.post('/admin/reject/:id', auth_1.requireAdmin, verification_controller_1.VerificationControllers.rejectVerification);
// Upgrade user to Platinum badge
router.post('/admin/upgrade-platinum/:userId', auth_1.requireAdmin, verification_controller_1.VerificationControllers.upgradeToPlatinum);
exports.VerificationRoutes = router;
//# sourceMappingURL=verification.routes.js.map