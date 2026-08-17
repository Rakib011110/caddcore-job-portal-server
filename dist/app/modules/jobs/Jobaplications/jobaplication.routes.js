"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Jobaplications_controller_1 = require("./Jobaplications.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const application_access_1 = require("./application.access");
const resume_export_controller_1 = require("../../Resume/resume.export.controller");
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
const router = express_1.default.Router();
/** Roles that manage applications: platform staff plus employers. */
const recruiterAuth = (0, auth_1.default)("ADMIN", "HR", "COMPANY");
/** Staff-only actions that span the whole platform. */
const staffAuth = (0, auth_1.default)("ADMIN", "HR");
// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Apply to a job. The applicant is taken from the token, never the body.
router.post("/apply", (0, auth_1.default)("USER", "ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.applyToJob);
// My own applications
router.get("/my-applications", (0, auth_1.default)("USER", "ADMIN", "HR"), Jobaplications_controller_1.ApplicationController.getMyApplications);
// ─────────────────────────────────────────────────────────────────────────────
// RECRUITER LISTS (scoped to the caller's company unless staff)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", recruiterAuth, application_access_1.guardApplicationList, Jobaplications_controller_1.ApplicationController.getAllApplications);
router.get("/search", recruiterAuth, application_access_1.guardApplicationList, Jobaplications_controller_1.ApplicationController.searchApplications);
// Upcoming interviews for the dashboard
router.get("/interviews/upcoming", recruiterAuth, application_access_1.guardApplicationList, Jobaplications_controller_1.ApplicationController.getUpcomingInterviews);
// Placement follow-ups due now, plus hires with no joining date recorded.
// Above "/:id" so "placements" is not parsed as an application id.
router.get("/placements/due", staffAuth, Jobaplications_controller_1.ApplicationController.getDuePlacementFollowups);
// Every application from one candidate - staff only, it crosses company lines
router.get("/user/:userId", staffAuth, Jobaplications_controller_1.ApplicationController.getApplicationsByUserId);
// ─────────────────────────────────────────────────────────────────────────────
// PER-JOB ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.get("/job/:jobId", recruiterAuth, application_access_1.guardJobScope, Jobaplications_controller_1.ApplicationController.getApplicationsByJob);
router.get("/job/:jobId/count-by-status", recruiterAuth, application_access_1.guardJobScope, Jobaplications_controller_1.ApplicationController.getApplicationCountByStatus);
router.get("/job/:jobId/total-count", recruiterAuth, application_access_1.guardJobScope, Jobaplications_controller_1.ApplicationController.getTotalApplicationsForJob);
// ─────────────────────────────────────────────────────────────────────────────
// PER-APPLICATION ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// `guardApplicationScope` also admits the candidate who owns the application,
// so these double as the candidate's own detail endpoints.
router.get("/:id", (0, auth_1.default)(), application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.getApplicationById);
router.get("/:id/timeline", (0, auth_1.default)(), application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.getApplicationWithTimeline);
// The CV exactly as it was approved when this application was sent
router.get("/:id/resume", recruiterAuth, application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.getApplicationResume);
// Same CV as a document: `.pdf` downloads a file, the bare path returns the
// HTML the preview frame embeds.
router.get(["/:id/resume/export", "/:id/resume/export.pdf"], recruiterAuth, application_access_1.guardApplicationScope, resume_export_controller_1.ResumeExportControllers.exportApplicationResume);
// ─────────────────────────────────────────────────────────────────────────────
// STATUS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/status", recruiterAuth, application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.updateApplicationStatus);
router.patch("/:id/notes", recruiterAuth, application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.addApplicationNotes);
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT RECORD
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Offer terms and post-hire tracking - joining date, salary, employment status,
 * the 6-month follow-up and placement verification.
 *
 * `staffAuth` rather than `recruiterAuth`: this is the institute's own
 * placement record, and the placement rate reported off it must not be
 * something a hiring company can edit.
 */
router.patch("/:id/placement", staffAuth, Jobaplications_controller_1.ApplicationController.updatePlacementDetails);
// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW SCHEDULING
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/interview", recruiterAuth, application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.scheduleInterview);
router.patch("/:id/interview/:interviewId/reschedule", recruiterAuth, application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.rescheduleInterview);
router.patch("/:id/interview/:interviewId/cancel", recruiterAuth, application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.cancelInterview);
router.post("/:id/interview/:interviewId/feedback", recruiterAuth, application_access_1.guardApplicationScope, Jobaplications_controller_1.ApplicationController.submitInterviewFeedback);
// ─────────────────────────────────────────────────────────────────────────────
// DELETE (staff only - companies close applications by status, not deletion)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", staffAuth, Jobaplications_controller_1.ApplicationController.deleteApplication);
exports.ApplicationRoutes = router;
//# sourceMappingURL=jobaplication.routes.js.map