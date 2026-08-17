import { ObjectId } from "mongoose";
import { IResumeSnapshot } from "../../Resume/resume.snapshot";
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
    /**
     * Post-hire tracking, filled in by the placement cell rather than by the
     * hiring flow. `offerDetails` says what was promised at selection; this says
     * what actually held afterwards. Placement-rate reporting reads `verified`,
     * which only an admin action can set to true.
     */
    placement?: {
        source?: string | undefined;
        recruitmentContact?: string | undefined;
        employmentStatus?: "Working" | "Resigned" | "Terminated" | "Promoted" | "Switched" | "Unknown" | undefined;
        sixMonthFollowUpDate?: Date | undefined;
        sixMonthFollowUpStatus?: "Pending" | "Contacted" | "Confirmed Working" | "Left Job" | "Unreachable" | undefined;
        verified?: boolean | undefined;
        verifiedAt?: Date | undefined;
        verifiedBy?: ObjectId | undefined;
        notes?: string | undefined;
        /** Stamped when the automated six-month email was sent, so it sends once. */
        sixMonthEmailSentAt?: Date | undefined;
        /** The candidate answered via the emailed link, not via a phone call. */
        respondedBySelf?: boolean | undefined;
        respondedAt?: Date | undefined;
    } | undefined;
    /** How this application reached us. */
    applicationMethod?: "Portal" | "Email" | "Referral" | "Walk-in" | "Campus Drive" | "Other" | undefined;
    /** Placement-cell follow-up on an application that is still open. */
    followUpDate?: Date | undefined;
    followUpStatus?: "Not Required" | "Pending" | "Done" | "No Response" | undefined;
    source?: string | undefined;
    referralCode?: string | undefined;
    resumeId?: ObjectId | string | undefined;
    resumeVersion?: number | undefined;
    /**
     * Immutable copy of the approved CV, taken at apply time.
     *
     * Read this - not `resumeId` - when showing a recruiter what the candidate
     * submitted. The resume document behind `resumeId` keeps changing; this does
     * not. See `Resume/resume.snapshot.ts`.
     */
    resumeSnapshot?: IResumeSnapshot | undefined;
    /** Template the snapshot was approved in */
    resumeTemplate?: string | undefined;
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