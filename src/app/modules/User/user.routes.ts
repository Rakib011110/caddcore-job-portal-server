import express from "express";
import { UserControllers } from "./user.controller";
import { uploadUserProfileFiles, uploadProfilePhoto, handleUploadError } from "../../../lib/multer/cloudinary.multer";
import auth, {
  requireAdmin,
  requireOwnershipOrAdmin,
} from "../../middlewares/auth";
import { requireVerifiedViewer } from "../../middlewares/requireVerifiedViewer";

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Self-service signup — the only genuinely anonymous route in this module.
router.post("/create-user", UserControllers.createUsers);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// The full user table, emails included. This was open to the internet: anyone
// could GET /users and walk away with every account's name, email and phone
// number, which also made the talent-pool gate trivially bypassable.
router.get("/", requireAdmin, UserControllers.getAllUsers);

// ─────────────────────────────────────────────────────────────────────────────
// TALENT POOL — MEMBERS ONLY
// ─────────────────────────────────────────────────────────────────────────────
//
// These paths are still named "public" because clients depend on the URLs, but
// they are not public: candidate rows are personal data (name, photo, employer,
// certifications), so the caller must be signed in AND cleared by
// `requireVerifiedViewer` — a verified job seeker, an approved company, or
// staff. Without this, blurring the listing page would hide the data from the
// page while leaving it one `curl` away.

// Get all talent-pool candidates
router.get(
  "/candidates/public",
  auth(),
  requireVerifiedViewer,
  UserControllers.getPublicCandidates
);

// Get a single candidate by ID
router.get(
  "/candidates/public/:id",
  auth(),
  requireVerifiedViewer,
  UserControllers.getPublicCandidateById
);

// Get single user by ID. Returns the whole account document, so it is yours or
// an admin's to read — not the public's. Browsing other people is what the
// talent-pool endpoints above are for.
router.get(
  "/:id",
  auth(),
  requireOwnershipOrAdmin("id"),
  UserControllers.getAUser
);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - SAVED JOBS
// ─────────────────────────────────────────────────────────────────────────────

// Get all saved jobs for current user
router.get("/me/saved-jobs", auth(), UserControllers.getSavedJobs);

// Save a job
router.post("/me/saved-jobs", auth(), UserControllers.saveJob);

// Check if a job is saved
router.get("/me/saved-jobs/:jobId/check", auth(), UserControllers.checkJobSaved);

// Remove a saved job
router.delete("/me/saved-jobs/:jobId", auth(), UserControllers.unsaveJob);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - JOB ALERTS
// ─────────────────────────────────────────────────────────────────────────────

// Get job alert preferences
router.get("/me/job-alerts", auth(), UserControllers.getJobAlertPreferences);

// Update job alert preferences
router.put("/me/job-alerts", auth(), UserControllers.updateJobAlertPreferences);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - CV / PROFILE
// ─────────────────────────────────────────────────────────────────────────────

// Get CV data for current user
router.get("/me/cv", auth(), UserControllers.getCVData);

// Update CV data
router.put("/me/cv", auth(), UserControllers.updateCVData);

// Get profile completeness
router.get("/me/profile-completeness", auth(), UserControllers.getProfileCompleteness);

// Get CV data by user ID.
//
// The old comment here promised "public profiles if visibility is public", but
// nothing checked `cvVisibility` and nothing checked the caller — the handler
// returned email, phone, address, date of birth and expected salary to anyone
// who could guess an ID. Own-or-admin until a real visibility rule exists; the
// members-only CV that belongs on a candidate profile is served by
// /resumes/candidate/:userId.
router.get(
  "/:id/cv",
  auth(),
  requireOwnershipOrAdmin("id"),
  UserControllers.getCVData
);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Everything below writes to a *named* account, so `auth()` alone was never
 * enough — it proves who you are, not that the `:id` is yours. Any signed-in
 * user could previously overwrite, photograph or delete any other account,
 * including an admin's, by changing the ID in the URL.
 *
 * `requireOwnershipOrAdmin("id")` is the missing half: you, or an admin.
 * The ownership check runs before multer so a rejected request never uploads.
 */

// Update user profile with file uploads
router.put(
  "/:id",
  auth(),
  requireOwnershipOrAdmin("id"),
  uploadUserProfileFiles,
  handleUploadError,
  UserControllers.updateUser
);

// Upload profile photo only
router.post(
  "/:id/upload-profile-photo",
  auth(),
  requireOwnershipOrAdmin("id"),
  uploadProfilePhoto,
  handleUploadError,
  UserControllers.uploadProfilePhoto
);

// Delete user — admin only. Self-service account deletion does not exist in the
// UI, so there is no reason to accept it from a normal session.
router.delete("/:id", requireAdmin, UserControllers.deleteUser);

/**
 * `PATCH /:id/make-base-member` used to live here. It belonged to the BASE
 * membership system, which is a different CADD CORE product — this portal has
 * no /base-member module, no application flow, and no client screen that ever
 * called it. All it did was write a string into `membershipId`.
 *
 * `membershipId` itself stays on the model: the admin All Users screen still
 * shows, edits and CSV-exports it, and it saves through `PUT /:id` like every
 * other profile field.
 */

export const UserRoutes = router;
