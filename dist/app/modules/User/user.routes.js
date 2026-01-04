"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const cloudinary_multer_1 = require("../../../lib/multer/cloudinary.multer");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.post("/create-user", user_controller_1.UserControllers.createUsers);
router.get("/", user_controller_1.UserControllers.getAllUsers);
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CANDIDATES / TALENT POOL (for companies to browse)
// ─────────────────────────────────────────────────────────────────────────────
// Get all public candidates (job seekers with public profiles)
router.get("/candidates/public", user_controller_1.UserControllers.getPublicCandidates);
// Get single public candidate by ID
router.get("/candidates/public/:id", user_controller_1.UserControllers.getPublicCandidateById);
// Get single user by ID (general)
router.get("/:id", user_controller_1.UserControllers.getAUser);
// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - SAVED JOBS
// ─────────────────────────────────────────────────────────────────────────────
// Get all saved jobs for current user
router.get("/me/saved-jobs", (0, auth_1.default)(), user_controller_1.UserControllers.getSavedJobs);
// Save a job
router.post("/me/saved-jobs", (0, auth_1.default)(), user_controller_1.UserControllers.saveJob);
// Check if a job is saved
router.get("/me/saved-jobs/:jobId/check", (0, auth_1.default)(), user_controller_1.UserControllers.checkJobSaved);
// Remove a saved job
router.delete("/me/saved-jobs/:jobId", (0, auth_1.default)(), user_controller_1.UserControllers.unsaveJob);
// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - JOB ALERTS
// ─────────────────────────────────────────────────────────────────────────────
// Get job alert preferences
router.get("/me/job-alerts", (0, auth_1.default)(), user_controller_1.UserControllers.getJobAlertPreferences);
// Update job alert preferences
router.put("/me/job-alerts", (0, auth_1.default)(), user_controller_1.UserControllers.updateJobAlertPreferences);
// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - CV / PROFILE
// ─────────────────────────────────────────────────────────────────────────────
// Get CV data for current user
router.get("/me/cv", (0, auth_1.default)(), user_controller_1.UserControllers.getCVData);
// Update CV data
router.put("/me/cv", (0, auth_1.default)(), user_controller_1.UserControllers.updateCVData);
// Get profile completeness
router.get("/me/profile-completeness", (0, auth_1.default)(), user_controller_1.UserControllers.getProfileCompleteness);
// Get CV data by user ID (for public profiles if visibility is public)
router.get("/:id/cv", user_controller_1.UserControllers.getCVData);
// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES - USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────
// Update user profile with file uploads
router.put("/:id", (0, auth_1.default)(), cloudinary_multer_1.uploadUserProfileFiles, cloudinary_multer_1.handleUploadError, user_controller_1.UserControllers.updateUser);
// Upload profile photo only
router.post("/:id/upload-profile-photo", (0, auth_1.default)(), cloudinary_multer_1.uploadProfilePhoto, cloudinary_multer_1.handleUploadError, user_controller_1.UserControllers.uploadProfilePhoto);
// Delete user
router.delete("/:id", (0, auth_1.default)(), user_controller_1.UserControllers.deleteUser);
// BASE Member management
router.patch("/:id/make-base-member", (0, auth_1.default)(), user_controller_1.UserControllers.makeBaseMember);
exports.UserRoutes = router;
//# sourceMappingURL=user.routes.js.map