"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Jobaplications_controller_1 = require("./Jobaplications.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION ROUTES - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Complete API routes for application management with interview scheduling
 */
const router = express_1.default.Router();
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Get all applications (public - for admin without strict auth)
router.get("/", Jobaplications_controller_1.ApplicationController.getAllApplications);
// Search applications with filters
router.get("/search", Jobaplications_controller_1.ApplicationController.searchApplications);
// ─────────────────────────────────────────────────────────────────────────────
// USER AUTHENTICATED ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Apply to a job (requires user login)
router.post("/apply", (0, auth_1.default)("USER", "ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.applyToJob);
// Get my applications (authenticated user)
router.get("/my-applications", (0, auth_1.default)("USER", "ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.getMyApplications);
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN/HR ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Get upcoming interviews (for admin dashboard)
router.get("/interviews/upcoming", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.getUpcomingInterviews);
// Get applications by user ID (admin only)
router.get("/user/:userId", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.getApplicationsByUserId);
// Get all applications for a specific job
router.get("/job/:jobId", Jobaplications_controller_1.ApplicationController.getApplicationsByJob);
// Get application count by status for a job
router.get("/job/:jobId/count-by-status", Jobaplications_controller_1.ApplicationController.getApplicationCountByStatus);
// Get total applications count for a job
router.get("/job/:jobId/total-count", Jobaplications_controller_1.ApplicationController.getTotalApplicationsForJob);
// Get single application by ID (with full timeline)
router.get("/:id", Jobaplications_controller_1.ApplicationController.getApplicationById);
// Get application with complete timeline
router.get("/:id/timeline", Jobaplications_controller_1.ApplicationController.getApplicationWithTimeline);
// ─────────────────────────────────────────────────────────────────────────────
// STATUS MANAGEMENT (Admin/HR Only)
// ─────────────────────────────────────────────────────────────────────────────
// Update application status (with email notification)
router.patch("/:id/status", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.updateApplicationStatus);
// Add internal notes to application
router.patch("/:id/notes", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.addApplicationNotes);
// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW SCHEDULING (Admin/HR Only)
// ─────────────────────────────────────────────────────────────────────────────
// Schedule a new interview
router.post("/:id/interview", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.scheduleInterview);
// Reschedule an existing interview
router.patch("/:id/interview/:interviewId/reschedule", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.rescheduleInterview);
// Cancel an interview
router.patch("/:id/interview/:interviewId/cancel", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.cancelInterview);
// Submit interview feedback
router.post("/:id/interview/:interviewId/feedback", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.submitInterviewFeedback);
// ─────────────────────────────────────────────────────────────────────────────
// DELETE (Admin/HR Only)
// ─────────────────────────────────────────────────────────────────────────────
// Delete application
router.delete("/:id", (0, auth_1.default)("ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.deleteApplication);
exports.ApplicationRoutes = router;
//# sourceMappingURL=jobaplication.routes.js.map