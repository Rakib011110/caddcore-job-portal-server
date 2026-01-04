import { TJobs } from "./job.interface";
import { Job } from "./job.model";
import { triggerJobAlerts } from "../../utils/jobAlertService";

// Create a new job
export const createJob = async (payload: TJobs) => {
  const result = await Job.create(payload);
  
  // Trigger job alerts in background (non-blocking)
  // This will find matching users and send them email notifications
  if (result && result.isActive) {
    triggerJobAlerts(result.toObject());
  }
  
  return result;
};

// Get all jobs with filters and pagination
export const getAllJobs = async (filters?: any) => {
  const query: any = {};
  
  // Pagination
  const page = parseInt(filters?.page) || 1;
  const limit = parseInt(filters?.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Only show active jobs in public listing (when no admin/company context)
  if (filters?.isActive !== undefined) {
    query.isActive = filters.isActive;
  } else if (!filters?.companyId && !filters?.showAll) {
    // Default: only show active jobs for public
    query.isActive = true;
  }
  
  // Role-based filtering: Company users see only their own jobs
  if (filters?.companyId) {
    query.company = filters.companyId;
  }
  
  if (filters?.category) query.category = filters.category;
  if (filters?.subcategory) query.subcategory = filters.subcategory;
  if (filters?.categoryRef) query.categoryRef = filters.categoryRef;
  if (filters?.subcategoryRef) query.subcategoryRef = filters.subcategoryRef;
  if (filters?.jobType) query.jobType = filters.jobType;
  if (filters?.location) query.location = { $regex: filters.location, $options: 'i' };
  if (filters?.experience) query.experience = filters.experience;
  if (filters?.locationType) query.locationType = filters.locationType;
  if (filters?.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { companyName: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  // Get total count for pagination
  const total = await Job.countDocuments(query);
  
  // Get paginated results
  const data = await Job.find(query)
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

// Get single job by slug
export const getSingleJob = async (slug: string) => {
  const result = await Job.findOne({ slug });
  return result;
};

// Get single job by ID
export const getSingleJobById = async (id: string) => {
  const result = await Job.findById(id);
  return result;
};

// Update job
export const updateJob = async (id: string, payload: Partial<TJobs>) => {
  const result = await Job.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return result;
};

// Delete job
export const deleteJob = async (id: string) => {
  const result = await Job.findByIdAndDelete(id);
  return result;
};

// Get jobs by company
export const getJobsByCompany = async (companyName: string) => {
  const result = await Job.find({ companyName, isActive: true });
  return result;
};

// Get featured jobs
export const getFeaturedJobs = async (limit: number = 5) => {
  const result = await Job.find({ isFeatured: true, isActive: true }).limit(limit).sort({ datePosted: -1 });
  return result;
};

// Get jobs count by category
export const getJobsCountByCategory = async () => {
  const result = await Job.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return result;
};

// Get total active jobs count
export const getTotalJobsCount = async () => {
  const count = await Job.countDocuments({ isActive: true });
  return count;
};

// Upload job logo
export const uploadJobLogo = async (jobId: string, file: any) => {
  // File is already uploaded to Cloudinary by multer middleware
  // The file object contains the Cloudinary response
  const logoUrl = file.path; // Cloudinary URL

  // Update job with logo URL
  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    { companyLogoUrl: logoUrl },
    { new: true }
  );

  if (!updatedJob) {
    throw new Error("Job not found");
  }

  return {
    job: updatedJob,
    logoUrl: logoUrl
  };
};
