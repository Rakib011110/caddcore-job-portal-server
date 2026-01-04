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
exports.uploadJobLogo = exports.getTotalJobsCount = exports.getJobsCountByCategory = exports.getFeaturedJobs = exports.getJobsByCompany = exports.deleteJob = exports.updateJob = exports.getSingleJobById = exports.getSingleJob = exports.getAllJobs = exports.createJob = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const JobService = __importStar(require("./job.service"));
const authorization_1 = require("../../utils/authorization");
// Create a new job
exports.createJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await JobService.createJob(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Job created successfully",
        data: result,
    });
});
// Get all jobs with optional filters
exports.getAllJobs = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const filters = req.query;
    const result = await JobService.getAllJobs(filters);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All jobs fetched successfully",
        data: result,
    });
});
// Get single job by slug
exports.getSingleJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await JobService.getSingleJob(req.params.slug);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Job fetched successfully",
        data: result,
    });
});
// Get single job by ID
exports.getSingleJobById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await JobService.getSingleJobById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Job fetched successfully",
        data: result,
    });
});
// Update job (with authorization check)
exports.updateJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const jobId = req.params.id;
    // Check if user has permission to update this job (also validates jobId exists)
    await (0, authorization_1.checkJobOwnership)(jobId, req.user);
    const result = await JobService.updateJob(jobId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Job updated successfully",
        data: result,
    });
});
// Delete job (with authorization check)
exports.deleteJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const jobId = req.params.id;
    // Check if user has permission to delete this job (also validates jobId exists)
    await (0, authorization_1.checkJobOwnership)(jobId, req.user);
    const result = await JobService.deleteJob(jobId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Job deleted successfully",
        data: result,
    });
});
// Get jobs by company
exports.getJobsByCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { companyName } = req.params;
    const result = await JobService.getJobsByCompany(companyName);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Company jobs fetched successfully",
        data: result,
    });
});
// Get featured jobs
exports.getFeaturedJobs = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const result = await JobService.getFeaturedJobs(limit);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Featured jobs fetched successfully",
        data: result,
    });
});
// Get jobs count by category
exports.getJobsCountByCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await JobService.getJobsCountByCategory();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Jobs count by category fetched successfully",
        data: result,
    });
});
// Get total active jobs count
exports.getTotalJobsCount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const count = await JobService.getTotalJobsCount();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Total jobs count fetched successfully",
        data: { count },
    });
});
// Upload job logo (with authorization check)
exports.uploadJobLogo = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const jobId = req.params.jobId;
    if (!jobId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Job ID is required",
            data: null,
        });
    }
    // Check if user has permission to modify this job
    await (0, authorization_1.checkJobOwnership)(jobId, req.user);
    if (!req.file) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "No file uploaded",
            data: null,
        });
    }
    const result = await JobService.uploadJobLogo(jobId, req.file);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Job logo uploaded successfully",
        data: result,
    });
});
//# sourceMappingURL=job.controller.js.map