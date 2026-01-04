import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ApplicationService } from "./Jobaplications.services";
import { IStatusUpdatePayload, IScheduleInterviewPayload } from "./Jobaplications.interfaces";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION CONTROLLER - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Complete CRUD with interview scheduling and status management
 */

// ─────────────────────────────────────────────────────────────────────────────
// APPLY TO JOB
// ─────────────────────────────────────────────────────────────────────────────

export const applyToJob = catchAsync(async (req: Request, res: Response) => {
  const { jobId, userId, sendNotification = true } = req.body;

  if (!jobId || !userId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "jobId and userId are required",
      data: null,
    });
  }

  const result = await ApplicationService.applyToJob(
    { jobId, userId },
    sendNotification
  );
  
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Application submitted successfully",
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE APPLICATION STATUS
// ─────────────────────────────────────────────────────────────────────────────

export const updateApplicationStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { applicationStatus, notes, sendNotification = true } = req.body;
  const adminId = (req as any).user?._id;

  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID is required",
      data: null,
    });
  }

  const payload: IStatusUpdatePayload = {
    applicationId: id,
    newStatus: applicationStatus,
    notes,
    changedBy: adminId,
    sendNotification,
  };

  const result = await ApplicationService.updateApplicationStatus(payload);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Application status updated to ${applicationStatus}`,
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const scheduleInterview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = (req as any).user?._id;
  
  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID is required",
      data: null,
    });
  }
  
  const {
    type,
    scheduledDate,
    scheduledTime,
    duration,
    isOnline,
    meetingLink,
    meetingPlatform,
    meetingId,
    meetingPassword,
    location,
    roomNumber,
    contactPerson,
    contactPhone,
    interviewers,
    instructions,
    sendNotification = true,
  } = req.body;

  if (!type || !scheduledDate || !scheduledTime || isOnline === undefined) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "type, scheduledDate, scheduledTime, and isOnline are required",
      data: null,
    });
  }

  const payload: IScheduleInterviewPayload = {
    applicationId: id,
    type,
    scheduledDate: new Date(scheduledDate),
    scheduledTime,
    duration,
    isOnline,
    meetingLink,
    meetingPlatform,
    meetingId,
    meetingPassword,
    location,
    roomNumber,
    contactPerson,
    contactPhone,
    interviewers,
    instructions,
    scheduledBy: adminId,
    sendNotification,
  };

  const result = await ApplicationService.scheduleInterview(payload);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview scheduled successfully",
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const rescheduleInterview = catchAsync(async (req: Request, res: Response) => {
  const { id, interviewId } = req.params;
  const { newDate, newTime, reason, sendNotification = true } = req.body;
  const adminId = (req as any).user?._id;

  if (!id || !interviewId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID and Interview ID are required",
      data: null,
    });
  }

  if (!newDate || !newTime || !reason) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "newDate, newTime, and reason are required",
      data: null,
    });
  }

  const result = await ApplicationService.rescheduleInterview(
    id,
    interviewId,
    new Date(newDate),
    newTime,
    reason,
    adminId,
    sendNotification
  );
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview rescheduled successfully",
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const cancelInterview = catchAsync(async (req: Request, res: Response) => {
  const { id, interviewId } = req.params;
  const { reason } = req.body;
  const adminId = (req as any).user?._id;

  if (!id || !interviewId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID and Interview ID are required",
      data: null,
    });
  }

  if (!reason) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "reason is required",
      data: null,
    });
  }

  const result = await ApplicationService.cancelInterview(
    id,
    interviewId,
    reason,
    adminId
  );
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview cancelled successfully",
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT INTERVIEW FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

export const submitInterviewFeedback = catchAsync(async (req: Request, res: Response) => {
  const { id, interviewId } = req.params;
  const { rating, strengths, improvements, recommendation, comments } = req.body;
  const adminId = (req as any).user?._id;

  if (!id || !interviewId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID and Interview ID are required",
      data: null,
    });
  }

  if (!adminId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Authentication required",
      data: null,
    });
  }

  const result = await ApplicationService.submitInterviewFeedback(
    id,
    interviewId,
    { rating, strengths, improvements, recommendation, comments },
    adminId
  );
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview feedback submitted successfully",
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET APPLICATION WITH TIMELINE
// ─────────────────────────────────────────────────────────────────────────────

export const getApplicationWithTimeline = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID is required",
      data: null,
    });
  }
  
  const result = await ApplicationService.getApplicationWithTimeline(id);
  
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Application not found",
      data: null,
    });
  }
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Application with timeline fetched successfully",
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET UPCOMING INTERVIEWS
// ─────────────────────────────────────────────────────────────────────────────

export const getUpcomingInterviews = catchAsync(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const result = await ApplicationService.getUpcomingInterviews(days);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Upcoming interviews fetched successfully",
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING CONTROLLERS (ENHANCED)
// ─────────────────────────────────────────────────────────────────────────────

export const getApplicationsByJob = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  if (!jobId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Job ID is required",
      data: null,
    });
  }
  
  const result = await ApplicationService.getApplicationsByJob(jobId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Applications fetched successfully",
    data: result,
  });
});

export const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  // Extract companyId from query params for role-based filtering
  const { companyId } = req.query;
  const filters = companyId ? { companyId: companyId as string } : undefined;
  
  const result = await ApplicationService.getAllApplications(filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All applications fetched successfully",
    data: result,
  });
});

export const getApplicationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID is required",
      data: null,
    });
  }
  
  const result = await ApplicationService.getApplicationById(id);
  
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Application not found",
      data: null,
    });
  }
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Application fetched successfully",
    data: result,
  });
});

export const addApplicationNotes = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { internalNotes } = req.body;
  
  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID is required",
      data: null,
    });
  }
  
  const result = await ApplicationService.addApplicationNotes(id, internalNotes);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notes added successfully",
    data: result,
  });
});

export const deleteApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Application ID is required",
      data: null,
    });
  }
  
  const result = await ApplicationService.deleteApplication(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Application deleted successfully",
    data: result,
  });
});

export const getApplicationCountByStatus = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  if (!jobId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Job ID is required",
      data: null,
    });
  }
  
  const result = await ApplicationService.getApplicationCountByStatus(jobId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Application count by status fetched successfully",
    data: result,
  });
});

export const getTotalApplicationsForJob = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  if (!jobId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Job ID is required",
      data: null,
    });
  }
  
  const count = await ApplicationService.getTotalApplicationsForJob(jobId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Total applications count fetched successfully",
    data: { count },
  });
});

export const getApplicationsByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "User ID is required",
      data: null,
    });
  }
  
  const result = await ApplicationService.getApplicationsByUserId(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Applications fetched successfully",
    data: result,
  });
});

export const searchApplications = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ApplicationService.searchApplications(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Applications fetched successfully",
    data: result,
  });
});

export const getMyApplications = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Authentication required",
      data: null,
    });
  }
  
  const result = await ApplicationService.getApplicationsByUserId(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My applications fetched successfully",
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

export const ApplicationController = {
  applyToJob,
  updateApplicationStatus,
  scheduleInterview,
  rescheduleInterview,
  cancelInterview,
  submitInterviewFeedback,
  getApplicationWithTimeline,
  getUpcomingInterviews,
  getApplicationsByJob,
  getAllApplications,
  getApplicationById,
  addApplicationNotes,
  deleteApplication,
  getApplicationCountByStatus,
  getTotalApplicationsForJob,
  getApplicationsByUserId,
  searchApplications,
  getMyApplications,
};