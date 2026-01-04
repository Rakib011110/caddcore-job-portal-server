/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION EMAIL TEMPLATES - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Professional, responsive email templates for all application status updates
 */
export declare const applicationReceivedTemplate: (data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationId: string;
    appliedAt: Date;
    dashboardUrl: string;
}) => string;
export declare const applicationReviewedTemplate: (data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    reviewedAt: Date;
    dashboardUrl: string;
}) => string;
export declare const applicationShortlistedTemplate: (data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    shortlistedAt: Date;
    dashboardUrl: string;
}) => string;
export declare const interviewScheduledTemplate: (data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    interviewDate: Date;
    interviewTime: string;
    duration: number;
    isOnline: boolean;
    meetingLink?: string | undefined;
    meetingPlatform?: string | undefined;
    location?: string | undefined;
    roomNumber?: string | undefined;
    contactPerson?: string | undefined;
    contactPhone?: string | undefined;
    instructions?: string | undefined;
    dashboardUrl: string;
}) => string;
export declare const interviewRescheduledTemplate: (data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    previousDate: Date;
    previousTime: string;
    newDate: Date;
    newTime: string;
    reason?: string | undefined;
    isOnline: boolean;
    meetingLink?: string | undefined;
    location?: string | undefined;
    dashboardUrl: string;
}) => string;
export declare const applicationSelectedTemplate: (data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    selectedAt: Date;
    salary?: number | undefined;
    currency?: string | undefined;
    joiningDate?: Date | undefined;
    dashboardUrl: string;
}) => string;
export declare const applicationRejectedTemplate: (data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    rejectedAt: Date;
    feedback?: string | undefined;
    dashboardUrl: string;
}) => string;
export declare const ApplicationEmailTemplates: {
    applicationReceived: (data: {
        candidateName: string;
        jobTitle: string;
        companyName: string;
        applicationId: string;
        appliedAt: Date;
        dashboardUrl: string;
    }) => string;
    applicationReviewed: (data: {
        candidateName: string;
        jobTitle: string;
        companyName: string;
        reviewedAt: Date;
        dashboardUrl: string;
    }) => string;
    applicationShortlisted: (data: {
        candidateName: string;
        jobTitle: string;
        companyName: string;
        shortlistedAt: Date;
        dashboardUrl: string;
    }) => string;
    interviewScheduled: (data: {
        candidateName: string;
        jobTitle: string;
        companyName: string;
        interviewDate: Date;
        interviewTime: string;
        duration: number;
        isOnline: boolean;
        meetingLink?: string | undefined;
        meetingPlatform?: string | undefined;
        location?: string | undefined;
        roomNumber?: string | undefined;
        contactPerson?: string | undefined;
        contactPhone?: string | undefined;
        instructions?: string | undefined;
        dashboardUrl: string;
    }) => string;
    interviewRescheduled: (data: {
        candidateName: string;
        jobTitle: string;
        companyName: string;
        previousDate: Date;
        previousTime: string;
        newDate: Date;
        newTime: string;
        reason?: string | undefined;
        isOnline: boolean;
        meetingLink?: string | undefined;
        location?: string | undefined;
        dashboardUrl: string;
    }) => string;
    applicationSelected: (data: {
        candidateName: string;
        jobTitle: string;
        companyName: string;
        selectedAt: Date;
        salary?: number | undefined;
        currency?: string | undefined;
        joiningDate?: Date | undefined;
        dashboardUrl: string;
    }) => string;
    applicationRejected: (data: {
        candidateName: string;
        jobTitle: string;
        companyName: string;
        rejectedAt: Date;
        feedback?: string | undefined;
        dashboardUrl: string;
    }) => string;
};
//# sourceMappingURL=applicationEmailTemplates.d.ts.map