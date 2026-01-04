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
exports.JobsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const JobController = __importStar(require("./job.controller"));
const cloudinary_multer_1 = require("../../../lib/multer/cloudinary.multer");
const auth_1 = __importStar(require("../../middlewares/auth"));
const router = express_1.default.Router();
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
router.post("/", auth_1.requireCompany, JobController.createJob);
// Upload job logo - requires auth (ownership checked in controller)
router.post("/:jobId/upload-logo", (0, auth_1.default)(), cloudinary_multer_1.uploadJobLogo, cloudinary_multer_1.handleUploadError, JobController.uploadJobLogo);
// Update job - requires auth (ownership checked in controller)
router.patch("/:id", (0, auth_1.default)(), JobController.updateJob);
// Delete job - requires auth (ownership checked in controller)
router.delete("/:id", (0, auth_1.default)(), JobController.deleteJob);
exports.JobsRoutes = router;
//# sourceMappingURL=job.routes.js.map