"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadJobLogo = exports.getTotalJobsCount = exports.getJobsCountByCategory = exports.getFeaturedJobs = exports.getJobsByCompany = exports.deleteJob = exports.updateJob = exports.getSingleJobById = exports.getSingleJob = exports.getAllJobs = exports.createJob = void 0;
const job_model_1 = require("./job.model");
const jobAlertService_1 = require("../../utils/jobAlertService");
// Create a new job
const createJob = async (payload) => {
    const result = await job_model_1.Job.create(payload);
    // Trigger job alerts in background (non-blocking)
    // This will find matching users and send them email notifications
    if (result && result.isActive) {
        (0, jobAlertService_1.triggerJobAlerts)(result.toObject());
    }
    return result;
};
exports.createJob = createJob;
// Get all jobs with filters and pagination
const getAllJobs = async (filters) => {
    const query = {};
    // Pagination
    const page = parseInt(filters?.page) || 1;
    const limit = parseInt(filters?.limit) || 10;
    const skip = (page - 1) * limit;
    // Only show active jobs in public listing (when no admin/company context)
    if (filters?.isActive !== undefined) {
        query.isActive = filters.isActive;
    }
    else if (!filters?.companyId && !filters?.showAll) {
        // Default: only show active jobs for public
        query.isActive = true;
    }
    // Role-based filtering: Company users see only their own jobs
    if (filters?.companyId) {
        query.company = filters.companyId;
    }
    if (filters?.category)
        query.category = filters.category;
    if (filters?.subcategory)
        query.subcategory = filters.subcategory;
    if (filters?.categoryRef)
        query.categoryRef = filters.categoryRef;
    if (filters?.subcategoryRef)
        query.subcategoryRef = filters.subcategoryRef;
    if (filters?.jobType)
        query.jobType = filters.jobType;
    if (filters?.location)
        query.location = { $regex: filters.location, $options: 'i' };
    if (filters?.experience)
        query.experience = filters.experience;
    if (filters?.locationType)
        query.locationType = filters.locationType;
    if (filters?.isFeatured !== undefined)
        query.isFeatured = filters.isFeatured;
    if (filters?.search) {
        query.$or = [
            { title: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
            { companyName: { $regex: filters.search, $options: 'i' } }
        ];
    }
    // Get total count for pagination
    const total = await job_model_1.Job.countDocuments(query);
    // Get paginated results
    const data = await job_model_1.Job.find(query)
        .sort({ datePosted: -1 })
        .skip(skip)
        .limit(limit);
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    };
};
exports.getAllJobs = getAllJobs;
// Get single job by slug
const getSingleJob = async (slug) => {
    const result = await job_model_1.Job.findOne({ slug });
    return result;
};
exports.getSingleJob = getSingleJob;
// Get single job by ID
const getSingleJobById = async (id) => {
    const result = await job_model_1.Job.findById(id);
    return result;
};
exports.getSingleJobById = getSingleJobById;
// Update job
const updateJob = async (id, payload) => {
    const result = await job_model_1.Job.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    return result;
};
exports.updateJob = updateJob;
// Delete job
const deleteJob = async (id) => {
    const result = await job_model_1.Job.findByIdAndDelete(id);
    return result;
};
exports.deleteJob = deleteJob;
// Get jobs by company
const getJobsByCompany = async (companyName) => {
    const result = await job_model_1.Job.find({ companyName, isActive: true });
    return result;
};
exports.getJobsByCompany = getJobsByCompany;
// Get featured jobs
const getFeaturedJobs = async (limit = 5) => {
    const result = await job_model_1.Job.find({ isFeatured: true, isActive: true }).limit(limit).sort({ datePosted: -1 });
    return result;
};
exports.getFeaturedJobs = getFeaturedJobs;
// Get jobs count by category
const getJobsCountByCategory = async () => {
    const result = await job_model_1.Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    return result;
};
exports.getJobsCountByCategory = getJobsCountByCategory;
// Get total active jobs count
const getTotalJobsCount = async () => {
    const count = await job_model_1.Job.countDocuments({ isActive: true });
    return count;
};
exports.getTotalJobsCount = getTotalJobsCount;
// Upload job logo
const uploadJobLogo = async (jobId, file) => {
    // File is already uploaded to Cloudinary by multer middleware
    // The file object contains the Cloudinary response
    const logoUrl = file.path; // Cloudinary URL
    // Update job with logo URL
    const updatedJob = await job_model_1.Job.findByIdAndUpdate(jobId, { companyLogoUrl: logoUrl }, { new: true });
    if (!updatedJob) {
        throw new Error("Job not found");
    }
    return {
        job: updatedJob,
        logoUrl: logoUrl
    };
};
exports.uploadJobLogo = uploadJobLogo;
//# sourceMappingURL=job.service.js.map