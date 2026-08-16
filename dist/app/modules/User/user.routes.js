"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const cloudinary_multer_1 = require("../../../lib/multer/cloudinary.multer");
const auth_1 = __importStar(require("../../middlewares/auth"));
const requireVerifiedViewer_1 = require("../../middlewares/requireVerifiedViewer");
const router = express_1.default.Router();
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Self-service signup — the only genuinely anonymous route in this module.
router.post("/create-user", user_controller_1.UserControllers.createUsers);
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// The full user table, emails included. This was open to the internet: anyone
// could GET /users and walk away with every account's name, email and phone
// number, which also made the talent-pool gate trivially bypassable.
router.get("/", auth_1.requireAdmin, user_controller_1.UserControllers.getAllUsers);
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
router.get("/candidates/public", (0, auth_1.default)(), requireVerifiedViewer_1.requireVerifiedViewer, user_controller_1.UserControllers.getPublicCandidates);
// Get a single candidate by ID
router.get("/candidates/public/:id", (0, auth_1.default)(), requireVerifiedViewer_1.requireVerifiedViewer, user_controller_1.UserControllers.getPublicCandidateById);
// Get single user by ID. Returns the whole account document, so it is yours or
// an admin's to read — not the public's. Browsing other people is what the
// talent-pool endpoints above are for.
router.get("/:id", (0, auth_1.default)(), (0, auth_1.requireOwnershipOrAdmin)("id"), user_controller_1.UserControllers.getAUser);
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
// Get CV data by user ID.
//
// The old comment here promised "public profiles if visibility is public", but
// nothing checked `cvVisibility` and nothing checked the caller — the handler
// returned email, phone, address, date of birth and expected salary to anyone
// who could guess an ID. Own-or-admin until a real visibility rule exists; the
// members-only CV that belongs on a candidate profile is served by
// /resumes/candidate/:userId.
router.get("/:id/cv", (0, auth_1.default)(), (0, auth_1.requireOwnershipOrAdmin)("id"), user_controller_1.UserControllers.getCVData);
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
router.put("/:id", (0, auth_1.default)(), (0, auth_1.requireOwnershipOrAdmin)("id"), cloudinary_multer_1.uploadUserProfileFiles, cloudinary_multer_1.handleUploadError, user_controller_1.UserControllers.updateUser);
// Upload profile photo only
router.post("/:id/upload-profile-photo", (0, auth_1.default)(), (0, auth_1.requireOwnershipOrAdmin)("id"), cloudinary_multer_1.uploadProfilePhoto, cloudinary_multer_1.handleUploadError, user_controller_1.UserControllers.uploadProfilePhoto);
// Delete user — admin only. Self-service account deletion does not exist in the
// UI, so there is no reason to accept it from a normal session.
router.delete("/:id", auth_1.requireAdmin, user_controller_1.UserControllers.deleteUser);
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
exports.UserRoutes = router;
//# sourceMappingURL=user.routes.js.map