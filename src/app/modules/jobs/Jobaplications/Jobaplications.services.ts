import mongoose from "mongoose";
import { 
  IJobApplication, 
  IStatusUpdatePayload,
  IScheduleInterviewPayload,
  ApplicationStatusType,
  IInterviewSchedule,
  InterviewStatus
} from "./Jobaplications.interfaces";
import { JobApplication } from "./Jobaplications.model";
import { Job } from "../job.model";
import { User } from "../../User/user.model";
import { 
  ApplicationEmailService, 
  ApplicationEmailData,
  EmailResult 
} from "./applicationEmailService";
import { NotificationService } from "../../Notification/notification.service";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION SERVICE - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Enterprise-level application management with:
 * - Complete status history tracking
 * - Event-driven email notifications
 * - Interview scheduling with reschedule support
 * - Non-blocking email sending
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: GET USER AND JOB DATA FOR EMAIL
// ─────────────────────────────────────────────────────────────────────────────

const getEmailDataFromApplication = async (
  application: any
): Promise<ApplicationEmailData | null> => {
  try {
    // Populate if not already populated
    const populated = application.jobId?.title 
      ? application 
      : await JobApplication.findById(application._id)
          .populate('jobId', 'title companyName')
          .populate('userId', 'name email');
    
    if (!populated?.userId?.email || !populated?.jobId?.title) {
      console.error('Missing required data for email');
      return null;
    }
    
    return {
      candidateName: populated.userId.name,
      candidateEmail: populated.userId.email,
      jobTitle: populated.jobId.title,
      companyName: populated.jobId.companyName,
      applicationId: populated._id.toString(),
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error getting email data:', error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY TO JOB
// ─────────────────────────────────────────────────────────────────────────────

export const applyToJob = async (
  payload: Partial<IJobApplication>,
  sendNotification: boolean = true
): Promise<any> => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Create application with initial status history
    const applicationData = {
      ...payload,
      applicationStatus: 'Pending' as ApplicationStatusType,
      statusHistory: [{
        status: 'Pending' as ApplicationStatusType,
        changedAt: new Date(),
        notes: 'Application submitted',
        notificationSent: false,
      }],
      appliedAt: new Date(),
    };
    
    const [result] = await JobApplication.create([applicationData], { session });
    
    if (!result || !result._id) {
      throw new Error('Failed to create application');
    }
    
    // Populate for response and email
    const populatedResult = await JobApplication.findById(result._id)
      .populate({
        path: "jobId",
        model: "Job",
        select: "title companyName jobType location salary"
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name email mobileNumber profilePhoto"
      })
      .session(session);
    
    await session.commitTransaction();
    
    // Send email notification (non-blocking)
    if (sendNotification && populatedResult) {
      const emailData = await getEmailDataFromApplication(populatedResult);
      if (emailData) {
        // Fire and forget - don't block the response
        ApplicationEmailService.sendApplicationStatusEmail('Pending', emailData)
          .then(async (emailResult) => {
            // Update notification status in database
            await JobApplication.updateOne(
              { _id: result._id, 'statusHistory.status': 'Pending' },
              { 
                $set: { 
                  'statusHistory.$.notificationSent': emailResult.success,
                  'statusHistory.$.notificationError': emailResult.error || undefined
                }
              }
            );
          })
          .catch(console.error);
      }
    }
    
    return populatedResult;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE APPLICATION STATUS (WITH HISTORY AND EMAIL)
// ─────────────────────────────────────────────────────────────────────────────

export const updateApplicationStatus = async (
  payload: IStatusUpdatePayload
): Promise<any> => {
  const { applicationId, newStatus, notes, changedBy, sendNotification = true } = payload;
  
  // Create new history entry
  const historyEntry = {
    status: newStatus,
    changedAt: new Date(),
    changedBy: changedBy ? new mongoose.Types.ObjectId(changedBy) : undefined,
    notes,
    notificationSent: false,
  };
  
  // Update application with new status and add to history
  const result = await JobApplication.findByIdAndUpdate(
    applicationId,
    {
      applicationStatus: newStatus,
      $push: { statusHistory: historyEntry },
      lastActivityAt: new Date(),
    },
    { new: true, runValidators: true }
  ).populate([
    {
      path: "jobId",
      model: "Job",
      select: "title companyName"
    },
    {
      path: "userId",
      model: "User",
      select: "name email"
    }
  ]);
  
  if (!result) {
    throw new Error('Application not found');
  }
  
  // Send email notification (non-blocking)
  if (sendNotification) {
    const emailData = await getEmailDataFromApplication(result);
    if (emailData) {
      ApplicationEmailService.sendApplicationStatusEmail(newStatus, emailData)
        .then(async (emailResult) => {
          // Update the notification status in the last history entry
          const historyIndex = result.statusHistory.length - 1;
          await JobApplication.updateOne(
            { _id: applicationId },
            { 
              $set: { 
                [`statusHistory.${historyIndex}.notificationSent`]: emailResult.success,
                [`statusHistory.${historyIndex}.notificationError`]: emailResult.error || null
              }
            }
          );
        })
        .catch(console.error);
    }
    
    // Create UI notification for the applicant (non-blocking) - ALL status changes
    const populatedResult = result as any;
    const userId = populatedResult.userId?._id || populatedResult.userId;
    const jobTitle = populatedResult.jobId?.title || 'Job';
    const jobId = populatedResult.jobId?._id || populatedResult.jobId;
    
    if (userId) {
      // Status emoji and message mapping
      const statusMessages: Record<string, { emoji: string; title: string; message: string }> = {
        'Pending': { emoji: '📝', title: 'Application Submitted', message: `Your application for "${jobTitle}" has been submitted.` },
        'Reviewed': { emoji: '👀', title: 'Application Viewed', message: `Your application for "${jobTitle}" has been reviewed.` },
        'Shortlisted': { emoji: '⭐', title: 'You\'ve Been Shortlisted!', message: `Great news! You've been shortlisted for "${jobTitle}".` },
        'Interview Scheduled': { emoji: '📅', title: 'Interview Scheduled', message: `An interview has been scheduled for "${jobTitle}".` },
        'Interview Completed': { emoji: '✅', title: 'Interview Completed', message: `Your interview for "${jobTitle}" has been completed.` },
        'Selected': { emoji: '🎯', title: 'Congratulations! You\'ve Been Selected', message: `You've been selected for "${jobTitle}"! An offer will follow soon.` },
        'Offer Extended': { emoji: '📨', title: 'Job Offer Received!', message: `Exciting news! You've received a job offer for "${jobTitle}".` },
        'Offer Accepted': { emoji: '🎉', title: 'Welcome Aboard!', message: `Congratulations! You've accepted the offer for "${jobTitle}". Welcome to the team!` },
        'Offer Declined': { emoji: '📋', title: 'Offer Status Update', message: `You've declined the offer for "${jobTitle}".` },
        'Rejected': { emoji: '❌', title: 'Application Update', message: `Your application for "${jobTitle}" was not selected this time.` },
        'Withdrawn': { emoji: '🔙', title: 'Application Withdrawn', message: `Your application for "${jobTitle}" has been withdrawn.` },
      };
      
      const statusInfo = statusMessages[newStatus] || {
        emoji: '📋',
        title: `Application Status: ${newStatus}`,
        message: `Your application for "${jobTitle}" status changed to ${newStatus}.`
      };
      
      // Create notification using generic create method
      NotificationService.create({
        userId: userId.toString(),
        type: 'APPLICATION_VIEWED', // Generic application type
        title: `${statusInfo.emoji} ${statusInfo.title}`,
        message: statusInfo.message,
        data: {
          applicationId,
          jobId: jobId?.toString(),
          status: newStatus,
        },
        link: `/user-profile/applications`,
        priority: newStatus === 'Selected' ? 'HIGH' : newStatus === 'Rejected' ? 'MEDIUM' : 'LOW',
      }).catch(console.error);
    }
  }
  
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const scheduleInterview = async (
  payload: IScheduleInterviewPayload
): Promise<any> => {
  const {
    applicationId,
    type,
    scheduledDate,
    scheduledTime,
    duration = 60,
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
    scheduledBy,
    sendNotification = true,
  } = payload;
  
  // Create interview schedule object
  const interview: IInterviewSchedule = {
    type,
    status: 'Scheduled',
    scheduledDate: new Date(scheduledDate),
    scheduledTime,
    duration,
    timezone: 'Asia/Dhaka',
    isOnline,
    meetingLink,
    meetingPlatform: meetingPlatform as any,
    meetingId,
    meetingPassword,
    location,
    roomNumber,
    contactPerson,
    contactPhone,
    interviewers,
    instructions,
    rescheduleHistory: [],
  };
  
  // Create status history entry
  const historyEntry = {
    status: 'Interview Scheduled' as ApplicationStatusType,
    changedAt: new Date(),
    changedBy: scheduledBy ? new mongoose.Types.ObjectId(scheduledBy) : undefined,
    notes: `${type} interview scheduled for ${scheduledDate}`,
    notificationSent: false,
  };
  
  // Update application
  const result = await JobApplication.findByIdAndUpdate(
    applicationId,
    {
      applicationStatus: 'Interview Scheduled',
      currentInterview: interview,
      $push: { 
        interviews: interview,
        statusHistory: historyEntry 
      },
      lastActivityAt: new Date(),
    },
    { new: true, runValidators: true }
  ).populate([
    {
      path: "jobId",
      model: "Job",
      select: "title companyName"
    },
    {
      path: "userId",
      model: "User",
      select: "name email"
    }
  ]);
  
  if (!result) {
    throw new Error('Application not found');
  }
  
  // Send email notification (non-blocking)
  if (sendNotification) {
    const emailData = await getEmailDataFromApplication(result);
    if (emailData) {
      // Add interview details to email data
      const interviewEmailData: ApplicationEmailData = {
        ...emailData,
        interviewDate: new Date(scheduledDate),
        interviewTime: scheduledTime,
        duration,
        isOnline,
        meetingLink,
        meetingPlatform,
        location,
        roomNumber,
        contactPerson,
        contactPhone,
        instructions,
      };
      
      ApplicationEmailService.sendApplicationStatusEmail('Interview Scheduled', interviewEmailData)
        .then(async (emailResult) => {
          const historyIndex = result.statusHistory.length - 1;
          await JobApplication.updateOne(
            { _id: applicationId },
            { 
              $set: { 
                [`statusHistory.${historyIndex}.notificationSent`]: emailResult.success,
                [`statusHistory.${historyIndex}.notificationError`]: emailResult.error || null
              }
            }
          );
        })
        .catch(console.error);
    }
  }
  
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// RESCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const rescheduleInterview = async (
  applicationId: string,
  interviewId: string,
  newDate: Date,
  newTime: string,
  reason: string,
  rescheduledBy?: string,
  sendNotification: boolean = true
): Promise<any> => {
  // Get current application
  const application = await JobApplication.findById(applicationId)
    .populate('jobId', 'title companyName')
    .populate('userId', 'name email');
  
  if (!application) {
    throw new Error('Application not found');
  }
  
  // Find the interview to reschedule
  const interview = application.interviews?.find(
    (i: any) => i._id.toString() === interviewId
  );
  
  if (!interview) {
    throw new Error('Interview not found');
  }
  
  const previousDate = interview.scheduledDate;
  const previousTime = interview.scheduledTime;
  
  // Add to reschedule history
  const rescheduleEntry = {
    previousDate,
    previousTime,
    reason,
    rescheduledBy: rescheduledBy ? new mongoose.Types.ObjectId(rescheduledBy) : undefined,
    rescheduledAt: new Date(),
  };
  
  // Update the interview
  const result = await JobApplication.findOneAndUpdate(
    { _id: applicationId, 'interviews._id': interviewId },
    {
      $set: {
        'interviews.$.scheduledDate': newDate,
        'interviews.$.scheduledTime': newTime,
        'interviews.$.status': 'Rescheduled',
        'currentInterview.scheduledDate': newDate,
        'currentInterview.scheduledTime': newTime,
        'currentInterview.status': 'Rescheduled',
        lastActivityAt: new Date(),
      },
      $push: {
        'interviews.$.rescheduleHistory': rescheduleEntry,
        'currentInterview.rescheduleHistory': rescheduleEntry,
        statusHistory: {
          status: 'Interview Scheduled',
          changedAt: new Date(),
          changedBy: rescheduledBy ? new mongoose.Types.ObjectId(rescheduledBy) : undefined,
          notes: `Interview rescheduled from ${previousDate} to ${newDate}. Reason: ${reason}`,
          notificationSent: false,
        }
      }
    },
    { new: true }
  ).populate([
    { path: "jobId", model: "Job", select: "title companyName" },
    { path: "userId", model: "User", select: "name email" }
  ]);
  
  // Send rescheduled email
  if (sendNotification && result) {
    const emailData = await getEmailDataFromApplication(result);
    if (emailData) {
      const rescheduleEmailData: ApplicationEmailData = {
        ...emailData,
        previousDate,
        previousTime,
        interviewDate: newDate,
        interviewTime: newTime,
        reason,
        isOnline: interview.isOnline,
        meetingLink: interview.meetingLink,
        location: interview.location,
      };
      
      ApplicationEmailService.sendInterviewRescheduledEmail(rescheduleEmailData)
        .catch(console.error);
    }
  }
  
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const cancelInterview = async (
  applicationId: string,
  interviewId: string,
  reason: string,
  cancelledBy?: string
): Promise<any> => {
  const result = await JobApplication.findOneAndUpdate(
    { _id: applicationId, 'interviews._id': interviewId },
    {
      $set: {
        'interviews.$.status': 'Cancelled' as InterviewStatus,
        'currentInterview.status': 'Cancelled',
        lastActivityAt: new Date(),
      },
      $push: {
        statusHistory: {
          status: 'Reviewed' as ApplicationStatusType,  // Revert to reviewed
          changedAt: new Date(),
          changedBy: cancelledBy ? new mongoose.Types.ObjectId(cancelledBy) : undefined,
          notes: `Interview cancelled. Reason: ${reason}`,
          notificationSent: false,
        }
      }
    },
    { new: true }
  );
  
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT INTERVIEW FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

export const submitInterviewFeedback = async (
  applicationId: string,
  interviewId: string,
  feedback: {
    rating?: number;
    strengths?: string[];
    improvements?: string[];
    recommendation?: "Hire" | "Reject" | "Next Round" | "Hold";
    comments?: string;
  },
  submittedBy: string
): Promise<any> => {
  const feedbackData = {
    ...feedback,
    submittedBy: new mongoose.Types.ObjectId(submittedBy),
    submittedAt: new Date(),
  };
  
  const result = await JobApplication.findOneAndUpdate(
    { _id: applicationId, 'interviews._id': interviewId },
    {
      $set: {
        'interviews.$.feedback': feedbackData,
        'interviews.$.status': 'Completed' as InterviewStatus,
        lastActivityAt: new Date(),
      },
      $push: {
        statusHistory: {
          status: 'Interview Completed' as ApplicationStatusType,
          changedAt: new Date(),
          changedBy: new mongoose.Types.ObjectId(submittedBy),
          notes: `Interview completed. Recommendation: ${feedback.recommendation}`,
          notificationSent: false,
        }
      }
    },
    { new: true }
  );
  
  // Update application status to Interview Completed
  if (result) {
    result.applicationStatus = 'Interview Completed';
    await result.save();
  }
  
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET APPLICATION WITH FULL TIMELINE
// ─────────────────────────────────────────────────────────────────────────────

export const getApplicationWithTimeline = async (id: string): Promise<any> => {
  const result = await JobApplication.findById(id)
    .populate({
      path: "jobId",
      model: "Job",
      select: "title companyName jobType location salary description"
    })
    .populate({
      path: "userId",
      model: "User",
      select: "name email mobileNumber profilePhoto headline currentJobTitle"
    })
    .populate({
      path: "statusHistory.changedBy",
      model: "User",
      select: "name"
    });
  
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL APPLICATIONS (EXISTING METHODS - ENHANCED)
// ─────────────────────────────────────────────────────────────────────────────

export const getApplicationsByJob = async (jobId: string) => {
  return JobApplication.find({ jobId })
    .populate({
      path: "jobId",
      model: "Job",
      select: "title companyName jobType location salary"
    })
    .populate({
      path: "userId",
      model: "User",
      select: "name email mobileNumber profilePhoto headline currentJobTitle cvUrl"
    })
    .sort({ appliedAt: -1 });
};

export const getAllApplications = async (filters?: { 
  companyId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  let query: any = {};
  
  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;
  
  // Filter by status if provided
  if (filters?.status) {
    query.applicationStatus = filters.status;
  }
  
  // If companyId is provided, first get jobs belonging to this company
  // then filter applications for those jobs only
  if (filters?.companyId) {
    const companyJobs = await Job.find({ company: filters.companyId }).select("_id");
    const jobIds = companyJobs.map((job: any) => job._id);
    query.jobId = { $in: jobIds };
  }
  
  // Get total count for pagination
  const total = await JobApplication.countDocuments(query);
  
  // Get paginated results
  const data = await JobApplication.find(query)
    .populate({
      path: "jobId",
      model: "Job",
      select: "title companyName jobType location salary company"
    })
    .populate({
      path: "userId",
      model: "User",
      select: "name email mobileNumber profilePhoto"
    })
    .sort({ appliedAt: -1 })
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

export const getApplicationById = async (id: string) => {
  return getApplicationWithTimeline(id);
};

export const addApplicationNotes = async (id: string, notes: string) => {
  return JobApplication.findByIdAndUpdate(
    id,
    { 
      internalNotes: notes,
      lastActivityAt: new Date(),
    },
    { new: true }
  ).populate([
    { path: "jobId", model: "Job", select: "title" },
    { path: "userId", model: "User", select: "name email" }
  ]);
};

export const deleteApplication = async (id: string) => {
  return JobApplication.findByIdAndDelete(id);
};

export const getApplicationCountByStatus = async (jobId: string) => {
  return JobApplication.aggregate([
    { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
    { $group: { _id: "$applicationStatus", count: { $sum: 1 } } },
  ]);
};

export const getTotalApplicationsForJob = async (jobId: string) => {
  return JobApplication.countDocuments({ jobId });
};

export const getApplicationsByUserId = async (userId: string) => {
  return JobApplication.find({ userId })
    .populate({
      path: "jobId",
      model: "Job",
      select: "title companyName jobType location salary description"
    })
    .sort({ appliedAt: -1 });
};

export const searchApplications = async (query: any) => {
  const searchQuery: any = {};
  
  if (query.jobId) searchQuery.jobId = query.jobId;
  if (query.userId) searchQuery.userId = query.userId;
  if (query.applicationStatus) searchQuery.applicationStatus = query.applicationStatus;
  
  return JobApplication.find(searchQuery)
    .populate({
      path: "jobId",
      model: "Job",
      select: "title companyName jobType location"
    })
    .populate({
      path: "userId",
      model: "User",
      select: "name email mobileNumber"
    })
    .sort({ appliedAt: -1 });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET UPCOMING INTERVIEWS
// ─────────────────────────────────────────────────────────────────────────────

export const getUpcomingInterviews = async (days: number = 7) => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return JobApplication.find({
    applicationStatus: 'Interview Scheduled',
    'currentInterview.scheduledDate': {
      $gte: now,
      $lte: futureDate,
    },
    'currentInterview.status': 'Scheduled',
  })
  .populate({
    path: "jobId",
    model: "Job",
    select: "title companyName"
  })
  .populate({
    path: "userId",
    model: "User",
    select: "name email mobileNumber profilePhoto"
  })
  .sort({ 'currentInterview.scheduledDate': 1 });
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const ApplicationService = {
  applyToJob,
  updateApplicationStatus,
  scheduleInterview,
  rescheduleInterview,
  cancelInterview,
  submitInterviewFeedback,
  getApplicationWithTimeline,
  getApplicationsByJob,
  getAllApplications,
  getApplicationById,
  addApplicationNotes,
  deleteApplication,
  getApplicationCountByStatus,
  getTotalApplicationsForJob,
  getApplicationsByUserId,
  searchApplications,
  getUpcomingInterviews,
};