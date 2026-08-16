import express from "express";
import { ApplicationController } from "./Jobaplications.controller";
import auth from "../../../middlewares/auth";
import {
  guardApplicationList,
  guardApplicationScope,
  guardJobScope,
} from "./application.access";
import { ResumeExportControllers } from "../../Resume/resume.export.controller";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Every route here touches candidate PII and CV content, so none of them are
 * public. Two layers protect them:
 *
 *   1. `auth(...)`  - is this role allowed near applications at all?
 *   2. `guard*`     - is THIS viewer allowed near THIS application?
 *
 * The second layer is what lets COMPANY accounts in safely: they reach the same
 * handlers as staff, but only ever for jobs their own company posted.
 */

const router = express.Router();

/** Roles that manage applications: platform staff plus employers. */
const recruiterAuth = auth("ADMIN", "HR", "COMPANY");

/** Staff-only actions that span the whole platform. */
const staffAuth = auth("ADMIN", "HR");

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Apply to a job. The applicant is taken from the token, never the body.
router.post("/apply", auth("USER", "ADMIN", "HR"), ApplicationController.applyToJob);

// My own applications
router.get("/my-applications", auth("USER", "ADMIN", "HR"), ApplicationController.getMyApplications);

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITER LISTS (scoped to the caller's company unless staff)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/", recruiterAuth, guardApplicationList, ApplicationController.getAllApplications);

router.get("/search", recruiterAuth, guardApplicationList, ApplicationController.searchApplications);

// Upcoming interviews for the dashboard
router.get("/interviews/upcoming", recruiterAuth, guardApplicationList, ApplicationController.getUpcomingInterviews);

// Every application from one candidate - staff only, it crosses company lines
router.get("/user/:userId", staffAuth, ApplicationController.getApplicationsByUserId);

// ─────────────────────────────────────────────────────────────────────────────
// PER-JOB ROUTES
// ─────────────────────────────────────────────────────────────────────────────

router.get("/job/:jobId", recruiterAuth, guardJobScope, ApplicationController.getApplicationsByJob);

router.get("/job/:jobId/count-by-status", recruiterAuth, guardJobScope, ApplicationController.getApplicationCountByStatus);

router.get("/job/:jobId/total-count", recruiterAuth, guardJobScope, ApplicationController.getTotalApplicationsForJob);

// ─────────────────────────────────────────────────────────────────────────────
// PER-APPLICATION ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// `guardApplicationScope` also admits the candidate who owns the application,
// so these double as the candidate's own detail endpoints.

router.get("/:id", auth(), guardApplicationScope, ApplicationController.getApplicationById);

router.get("/:id/timeline", auth(), guardApplicationScope, ApplicationController.getApplicationWithTimeline);

// The CV exactly as it was approved when this application was sent
router.get("/:id/resume", recruiterAuth, guardApplicationScope, ApplicationController.getApplicationResume);

// Same CV as a document: `.pdf` downloads a file, the bare path returns the
// HTML the preview frame embeds.
router.get(["/:id/resume/export", "/:id/resume/export.pdf"], recruiterAuth, guardApplicationScope, ResumeExportControllers.exportApplicationResume);

// ─────────────────────────────────────────────────────────────────────────────
// STATUS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/:id/status", recruiterAuth, guardApplicationScope, ApplicationController.updateApplicationStatus);

router.patch("/:id/notes", recruiterAuth, guardApplicationScope, ApplicationController.addApplicationNotes);

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW SCHEDULING
// ─────────────────────────────────────────────────────────────────────────────

router.post("/:id/interview", recruiterAuth, guardApplicationScope, ApplicationController.scheduleInterview);

router.patch("/:id/interview/:interviewId/reschedule", recruiterAuth, guardApplicationScope, ApplicationController.rescheduleInterview);

router.patch("/:id/interview/:interviewId/cancel", recruiterAuth, guardApplicationScope, ApplicationController.cancelInterview);

router.post("/:id/interview/:interviewId/feedback", recruiterAuth, guardApplicationScope, ApplicationController.submitInterviewFeedback);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE (staff only - companies close applications by status, not deletion)
// ─────────────────────────────────────────────────────────────────────────────

router.delete("/:id", staffAuth, ApplicationController.deleteApplication);

export const ApplicationRoutes = router;
