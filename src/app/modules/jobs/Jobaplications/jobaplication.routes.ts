import express from "express";
import { ApplicationController } from "./Jobaplications.controller";
import auth from "../../../middlewares/auth";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION ROUTES - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Complete API routes for application management with interview scheduling
 */

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Get all applications (public - for admin without strict auth)
router.get("/", ApplicationController.getAllApplications);

// Search applications with filters
router.get("/search", ApplicationController.searchApplications);

// ─────────────────────────────────────────────────────────────────────────────
// USER AUTHENTICATED ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Apply to a job (requires user login)
router.post("/apply", auth("USER", "ADMIN", "HR"), ApplicationController.applyToJob);

// Get my applications (authenticated user)
router.get("/my-applications", auth("USER", "ADMIN", "HR"), ApplicationController.getMyApplications);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN/HR ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Get upcoming interviews (for admin dashboard)
router.get("/interviews/upcoming", auth("ADMIN", "HR"), ApplicationController.getUpcomingInterviews);

// Get applications by user ID (admin only)
router.get("/user/:userId", auth("ADMIN", "HR"), ApplicationController.getApplicationsByUserId);

// Get all applications for a specific job
router.get("/job/:jobId", ApplicationController.getApplicationsByJob);

// Get application count by status for a job
router.get("/job/:jobId/count-by-status", ApplicationController.getApplicationCountByStatus);

// Get total applications count for a job
router.get("/job/:jobId/total-count", ApplicationController.getTotalApplicationsForJob);

// Get single application by ID (with full timeline)
router.get("/:id", ApplicationController.getApplicationById);

// Get application with complete timeline
router.get("/:id/timeline", ApplicationController.getApplicationWithTimeline);

// ─────────────────────────────────────────────────────────────────────────────
// STATUS MANAGEMENT (Admin/HR Only)
// ─────────────────────────────────────────────────────────────────────────────

// Update application status (with email notification)
router.patch("/:id/status", auth("ADMIN", "HR"), ApplicationController.updateApplicationStatus);

// Add internal notes to application
router.patch("/:id/notes", auth("ADMIN", "HR"), ApplicationController.addApplicationNotes);

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW SCHEDULING (Admin/HR Only)
// ─────────────────────────────────────────────────────────────────────────────

// Schedule a new interview
router.post("/:id/interview", auth("ADMIN", "HR"), ApplicationController.scheduleInterview);

// Reschedule an existing interview
router.patch("/:id/interview/:interviewId/reschedule", auth("ADMIN", "HR"), ApplicationController.rescheduleInterview);

// Cancel an interview
router.patch("/:id/interview/:interviewId/cancel", auth("ADMIN", "HR"), ApplicationController.cancelInterview);

// Submit interview feedback
router.post("/:id/interview/:interviewId/feedback", auth("ADMIN", "HR"), ApplicationController.submitInterviewFeedback);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE (Admin/HR Only)
// ─────────────────────────────────────────────────────────────────────────────

// Delete application
router.delete("/:id", auth("ADMIN", "HR"), ApplicationController.deleteApplication);

export const ApplicationRoutes = router;

