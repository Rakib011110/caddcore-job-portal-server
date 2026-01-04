import express from "express";
import { UserControllers } from "./user.controller";
import { uploadUserProfileFiles, uploadProfilePhoto, handleUploadError } from "../../../lib/multer/cloudinary.multer";
import auth from "../../middlewares/auth";

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

router.post("/create-user", UserControllers.createUsers);
router.get("/", UserControllers.getAllUsers);

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CANDIDATES / TALENT POOL (for companies to browse)
// ─────────────────────────────────────────────────────────────────────────────

// Get all public candidates (job seekers with public profiles)
router.get("/candidates/public", UserControllers.getPublicCandidates);

// Get single public candidate by ID
router.get("/candidates/public/:id", UserControllers.getPublicCandidateById);

// Get single user by ID (general)
router.get("/:id", UserControllers.getAUser);

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

// Get CV data by user ID (for public profiles if visibility is public)
router.get("/:id/cv", UserControllers.getCVData);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────

// Update user profile with file uploads
router.put(
  "/:id",
  auth(),
  uploadUserProfileFiles,
  handleUploadError,
  UserControllers.updateUser
);

// Upload profile photo only
router.post(
  "/:id/upload-profile-photo",
  auth(),
  uploadProfilePhoto,
  handleUploadError,
  UserControllers.uploadProfilePhoto
);

// Delete user
router.delete("/:id", auth(), UserControllers.deleteUser);

// BASE Member management
router.patch("/:id/make-base-member", auth(), UserControllers.makeBaseMember);

export const UserRoutes = router;
