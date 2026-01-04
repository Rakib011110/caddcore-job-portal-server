import { ObjectId } from "mongoose";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION INTERFACES - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Enterprise-level application tracking with full status history and interview scheduling
 */
export type ApplicationStatusType = "Pending" | "Reviewed" | "Shortlisted" | "Interview Scheduled" | "Interview Completed" | "Selected" | "Rejected" | "Offer Extended" | "Offer Accepted" | "Offer Declined" | "Withdrawn";
export interface IStatusHistoryEntry {
    status: ApplicationStatusType;
    changedAt: Date;
    changedBy?: ObjectId | undefined;
    notes?: string | undefined;
    notificationSent?: boolean | undefined;
    notificationError?: string | undefined;
}
export type InterviewType = "Online" | "Offline" | "Phone" | "Technical" | "HR" | "Final";
export type InterviewStatus = "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "No Show";
export interface IInterviewSchedule {
    _id?: string | undefined;
    type: InterviewType;
    status: InterviewStatus;
    scheduledDate: Date;
    scheduledTime: string;
    duration: number;
    timezone?: string | undefined;
    isOnline: boolean;
    meetingLink?: string | undefined;
    meetingPlatform?: "Zoom" | "Google Meet" | "Microsoft Teams" | "Other" | undefined;
    meetingId?: string | undefined;
    meetingPassword?: string | undefined;
    location?: string | undefined;
    roomNumber?: string | undefined;
    contactPerson?: string | undefined;
    contactPhone?: string | undefined;
    interviewers?: Array<{
        name: string;
        email?: string | undefined;
        designation?: string | undefined;
    }> | undefined;
    instructions?: string | undefined;
    internalNotes?: string | undefined;
    feedback?: {
        rating?: number | undefined;
        strengths?: string[] | undefined;
        improvements?: string[] | undefined;
        recommendation?: "Hire" | "Reject" | "Next Round" | "Hold" | undefined;
        comments?: string | undefined;
        submittedBy?: ObjectId | undefined;
        submittedAt?: Date | undefined;
    } | undefined;
    rescheduleHistory?: Array<{
        previousDate: Date;
        previousTime: string;
        reason: string;
        rescheduledBy?: ObjectId | undefined;
        rescheduledAt: Date;
    }> | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
export interface IJobApplication {
    _id?: string | undefined;
    jobId: ObjectId;
    userId: ObjectId;
    applicationStatus: ApplicationStatusType;
    statusHistory: IStatusHistoryEntry[];
    interviews?: IInterviewSchedule[] | undefined;
    currentInterview?: IInterviewSchedule | undefined;
    internalNotes?: string | undefined;
    coverLetter?: string | undefined;
    evaluations?: Array<{
        evaluatedBy: ObjectId;
        evaluatedAt: Date;
        scores?: {
            technicalSkills?: number | undefined;
            communication?: number | undefined;
            experience?: number | undefined;
            cultureFit?: number | undefined;
            overall?: number | undefined;
        } | undefined;
        recommendation?: "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire" | undefined;
        comments?: string | undefined;
    }> | undefined;
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
    source?: string | undefined;
    referralCode?: string | undefined;
    resumeVersion?: number | undefined;
    appliedAt?: Date | undefined;
    lastActivityAt?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
export interface IStatusUpdatePayload {
    applicationId: string;
    newStatus: ApplicationStatusType;
    notes?: string;
    changedBy?: string;
    sendNotification?: boolean;
}
export interface IScheduleInterviewPayload {
    applicationId: string;
    type: InterviewType;
    scheduledDate: Date;
    scheduledTime: string;
    duration?: number;
    isOnline: boolean;
    meetingLink?: string;
    meetingPlatform?: string;
    meetingId?: string;
    meetingPassword?: string;
    location?: string;
    roomNumber?: string;
    contactPerson?: string;
    contactPhone?: string;
    interviewers?: Array<{
        name: string;
        email?: string;
        designation?: string;
    }>;
    instructions?: string;
    scheduledBy?: string;
    sendNotification?: boolean;
}
export type EmailEventType = "APPLICATION_RECEIVED" | "APPLICATION_REVIEWED" | "APPLICATION_SHORTLISTED" | "INTERVIEW_SCHEDULED" | "INTERVIEW_REMINDER" | "INTERVIEW_RESCHEDULED" | "INTERVIEW_CANCELLED" | "APPLICATION_SELECTED" | "OFFER_EXTENDED" | "APPLICATION_REJECTED";
export interface IEmailEvent {
    type: EmailEventType;
    applicationId: string;
    recipientEmail: string;
    recipientName: string;
    data: Record<string, any>;
    priority?: "high" | "normal" | "low";
    retryCount?: number;
    maxRetries?: number;
    scheduledFor?: Date;
}
//# sourceMappingURL=Jobaplications.interfaces.d.ts.map