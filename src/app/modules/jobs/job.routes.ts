import express from "express";
import * as JobController from "./job.controller";
import { uploadJobLogo, handleUploadError } from "../../../lib/multer/cloudinary.multer";
import auth, { requireCompany } from "../../middlewares/auth";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (No auth required)
// ─────────────────────────────────────────────────────────────────────────────

// Get all jobs (with optional filters) - public
router.get("/", JobController.getAllJobs);

// Get featured jobs
router.get("/featured/list", JobController.getFeaturedJobs);

// Get jobs count by category
router.get("/analytics/count-by-category", JobController.getJobsCountByCategory);

// Get total active jobs count
router.get("/analytics/total-count", JobController.getTotalJobsCount);

// Get jobs by company name
router.get("/company/:companyName", JobController.getJobsByCompany);

// Get single job by ID
router.get("/by-id/:id", JobController.getSingleJobById);

// Get single job by slug
router.get("/:slug", JobController.getSingleJob);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES (Auth required)
// Authorization check happens in controller
// ─────────────────────────────────────────────────────────────────────────────

// Create a new job - requires ADMIN or COMPANY role
router.post("/", requireCompany, JobController.createJob);

// Upload job logo - requires auth (ownership checked in controller)
router.post("/:jobId/upload-logo", auth(), uploadJobLogo, handleUploadError, JobController.uploadJobLogo);

// Update job - requires auth (ownership checked in controller)
router.patch("/:id", auth(), JobController.updateJob);

// Delete job - requires auth (ownership checked in controller)
router.delete("/:id", auth(), JobController.deleteJob);

export const JobsRoutes = router;
