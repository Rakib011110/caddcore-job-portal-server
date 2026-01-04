import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import * as JobService from "./job.service";
import { checkJobOwnership } from "../../utils/authorization";

// Create a new job
export const createJob = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.createJob(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Job created successfully",
    data: result,
  });
});

// Get all jobs with optional filters
export const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await JobService.getAllJobs(filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All jobs fetched successfully",
    data: result,
  });
});

// Get single job by slug
export const getSingleJob = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.getSingleJob(req.params.slug as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job fetched successfully",
    data: result,
  });
});

// Get single job by ID
export const getSingleJobById = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.getSingleJobById(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job fetched successfully",
    data: result,
  });
});

// Update job (with authorization check)
export const updateJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  
  // Check if user has permission to update this job (also validates jobId exists)
  await checkJobOwnership(jobId, req.user);
  
  const result = await JobService.updateJob(jobId as string, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job updated successfully",
    data: result,
  });
});

// Delete job (with authorization check)
export const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  
  // Check if user has permission to delete this job (also validates jobId exists)
  await checkJobOwnership(jobId, req.user);
  
  const result = await JobService.deleteJob(jobId as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job deleted successfully",
    data: result,
  });
});

// Get jobs by company
export const getJobsByCompany = catchAsync(async (req: Request, res: Response) => {
  const { companyName } = req.params;
  const result = await JobService.getJobsByCompany(companyName as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Company jobs fetched successfully",
    data: result,
  });
});

// Get featured jobs
export const getFeaturedJobs = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
  const result = await JobService.getFeaturedJobs(limit);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Featured jobs fetched successfully",
    data: result,
  });
});

// Get jobs count by category
export const getJobsCountByCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.getJobsCountByCategory();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Jobs count by category fetched successfully",
    data: result,
  });
});

// Get total active jobs count
export const getTotalJobsCount = catchAsync(async (req: Request, res: Response) => {
  const count = await JobService.getTotalJobsCount();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Total jobs count fetched successfully",
    data: { count },
  });
});

// Upload job logo (with authorization check)
export const uploadJobLogo = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.jobId;

  if (!jobId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Job ID is required",
      data: null,
    });
  }
  
  // Check if user has permission to modify this job
  await checkJobOwnership(jobId, req.user);

  if (!req.file) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "No file uploaded",
      data: null,
    });
  }

  const result = await JobService.uploadJobLogo(jobId, req.file);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job logo uploaded successfully",
    data: result,
  });
});