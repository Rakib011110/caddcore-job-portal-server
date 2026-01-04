import { ObjectId } from "mongoose";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION INTERFACES - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Enterprise-level application tracking with full status history and interview scheduling
 */

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION STATUS TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ApplicationStatusType = 
  | "Pending"           // Initial state when application submitted
  | "Reviewed"          // HR has viewed the application
  | "Shortlisted"       // Candidate shortlisted for further process
  | "Interview Scheduled"  // Interview has been scheduled
  | "Interview Completed"  // Interview has been completed
  | "Selected"          // Candidate selected for the position
  | "Rejected"          // Application rejected
  | "Offer Extended"    // Job offer sent to candidate
  | "Offer Accepted"    // Candidate accepted the offer
  | "Offer Declined"    // Candidate declined the offer
  | "Withdrawn";        // Candidate withdrew application

// ─────────────────────────────────────────────────────────────────────────────
// STATUS HISTORY TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export interface IStatusHistoryEntry {
  status: ApplicationStatusType;
  changedAt: Date;
  changedBy?: ObjectId | undefined;  // Admin/HR who made the change
  notes?: string | undefined;        // Optional notes for the status change
  notificationSent?: boolean | undefined;  // Track if email notification was sent
  notificationError?: string | undefined;  // Store error if notification failed
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW SCHEDULING
// ─────────────────────────────────────────────────────────────────────────────

export type InterviewType = "Online" | "Offline" | "Phone" | "Technical" | "HR" | "Final";
export type InterviewStatus = "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "No Show";

export interface IInterviewSchedule {
  _id?: string | undefined;
  type: InterviewType;
  status: InterviewStatus;
  
  // Scheduling Details
  scheduledDate: Date;
  scheduledTime: string;        // "10:00 AM" format
  duration: number;             // Duration in minutes
  timezone?: string | undefined;            // "Asia/Dhaka"
  
  // Online Meeting Details
  isOnline: boolean;
  meetingLink?: string | undefined;         // Zoom/Google Meet/Teams link
  meetingPlatform?: "Zoom" | "Google Meet" | "Microsoft Teams" | "Other" | undefined;
  meetingId?: string | undefined;
  meetingPassword?: string | undefined;
  
  // Offline Meeting Details
  location?: string | undefined;            // Physical address
  roomNumber?: string | undefined;
  contactPerson?: string | undefined;
  contactPhone?: string | undefined;
  
  // Interviewers
  interviewers?: Array<{
    name: string;
    email?: string | undefined;
    designation?: string | undefined;
  }> | undefined;
  
  // Notes & Instructions
  instructions?: string | undefined;        // Pre-interview instructions for candidate
  internalNotes?: string | undefined;       // Internal notes for HR
  
  // Feedback after interview
  feedback?: {
    rating?: number | undefined;            // 1-5 rating
    strengths?: string[] | undefined;
    improvements?: string[] | undefined;
    recommendation?: "Hire" | "Reject" | "Next Round" | "Hold" | undefined;
    comments?: string | undefined;
    submittedBy?: ObjectId | undefined;
    submittedAt?: Date | undefined;
  } | undefined;
  
  // History for rescheduling
  rescheduleHistory?: Array<{
    previousDate: Date;
    previousTime: string;
    reason: string;
    rescheduledBy?: ObjectId | undefined;
    rescheduledAt: Date;
  }> | undefined;
  
  // Timestamps
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APPLICATION INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface IJobApplication {
  _id?: string | undefined;
  
  // Job and User Reference
  jobId: ObjectId;
  userId: ObjectId;
  
  // Current Application Status
  applicationStatus: ApplicationStatusType;
  
  // Status History - Track all status changes
  statusHistory: IStatusHistoryEntry[];
  
  // Interview Scheduling
  interviews?: IInterviewSchedule[] | undefined;
  currentInterview?: IInterviewSchedule | undefined;  // Currently active/upcoming interview
  
  // Recruiter Notes
  internalNotes?: string | undefined;
  
  // Applicant Cover Letter
  coverLetter?: string | undefined;
  
  // Evaluation Scores (can be filled by multiple evaluators)
  evaluations?: Array<{
    evaluatedBy: ObjectId;
    evaluatedAt: Date;
    scores?: {
      technicalSkills?: number | undefined;    // 1-10
      communication?: number | undefined;       // 1-10
      experience?: number | undefined;          // 1-10
      cultureFit?: number | undefined;          // 1-10
      overall?: number | undefined;             // 1-10
    } | undefined;
    recommendation?: "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire" | undefined;
    comments?: string | undefined;
  }> | undefined;
  
  // Offer Details (if selected)
  offerDetails?: {
    salary?: number | undefined;
    currency?: string | undefined;
    joiningDate?: Date | undefined;
    offerLetterUrl?: string | undefined;
    offerSentAt?: Date | undefined;
    offerExpiresAt?: Date | undefined;
    responseReceivedAt?: Date | undefined;
    negotiationNotes?: string | undefined;
  } | undefined;
  
  // Additional Metadata
  source?: string | undefined;              // Where did the candidate find this job
  referralCode?: string | undefined;        // If referred by someone
  resumeVersion?: number | undefined;       // Track which version of resume was submitted
  
  // Timestamps
  appliedAt?: Date | undefined;
  lastActivityAt?: Date | undefined;        // Last action on this application
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS UPDATE DTO
// ─────────────────────────────────────────────────────────────────────────────

export interface IStatusUpdatePayload {
  applicationId: string;
  newStatus: ApplicationStatusType;
  notes?: string;
  changedBy?: string;           // User ID of admin/HR
  sendNotification?: boolean;   // Whether to send email notification
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW SCHEDULE DTO
// ─────────────────────────────────────────────────────────────────────────────

export interface IScheduleInterviewPayload {
  applicationId: string;
  type: InterviewType;
  scheduledDate: Date;
  scheduledTime: string;
  duration?: number;
  isOnline: boolean;
  
  // Online details
  meetingLink?: string;
  meetingPlatform?: string;
  meetingId?: string;
  meetingPassword?: string;
  
  // Offline details
  location?: string;
  roomNumber?: string;
  contactPerson?: string;
  contactPhone?: string;
  
  // Additional
  interviewers?: Array<{ name: string; email?: string; designation?: string }>;
  instructions?: string;
  scheduledBy?: string;         // User ID of admin/HR
  sendNotification?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL NOTIFICATION EVENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EmailEventType = 
  | "APPLICATION_RECEIVED"
  | "APPLICATION_REVIEWED"
  | "APPLICATION_SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_REMINDER"
  | "INTERVIEW_RESCHEDULED"
  | "INTERVIEW_CANCELLED"
  | "APPLICATION_SELECTED"
  | "OFFER_EXTENDED"
  | "APPLICATION_REJECTED";

export interface IEmailEvent {
  type: EmailEventType;
  applicationId: string;
  recipientEmail: string;
  recipientName: string;
  data: Record<string, any>;    // Dynamic data for email template
  priority?: "high" | "normal" | "low";
  retryCount?: number;
  maxRetries?: number;
  scheduledFor?: Date;          // For scheduled emails like reminders
}
