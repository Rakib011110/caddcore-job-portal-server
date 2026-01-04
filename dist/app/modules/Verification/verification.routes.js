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
 */
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Get predefined CADDCORE courses list (no auth required)
router.get('/courses', verification_controller_1.VerificationControllers.getCoursesList);
// ─────────────────────────────────────────────────────────────────────────────
// USER ROUTES (Authentication Required)
// ─────────────────────────────────────────────────────────────────────────────
// Apply for verification
router.post('/apply', auth_1.requireAuth, verification_controller_1.VerificationControllers.applyForVerification);
// Get my verification status
router.get('/my-status', auth_1.requireAuth, verification_controller_1.VerificationControllers.getMyVerificationStatus);
// Update pending verification request
router.put('/update/:id', auth_1.requireAuth, verification_controller_1.VerificationControllers.updateVerificationRequest);
// Cancel pending verification request
router.delete('/cancel/:id', auth_1.requireAuth, verification_controller_1.VerificationControllers.cancelVerificationRequest);
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