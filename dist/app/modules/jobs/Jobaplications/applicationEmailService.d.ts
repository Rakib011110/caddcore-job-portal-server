import { EmailEventType, ApplicationStatusType } from './Jobaplications.interfaces';
interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
}
export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
    attempts: number;
}
export declare const sendEmailWithRetry: (to: string, subject: string, html: string, retryConfig?: RetryConfig) => Promise<EmailResult>;
export declare const sendEmailAsync: (to: string, subject: string, html: string, onComplete?: (result: EmailResult) => void) => void;
export interface ApplicationEmailData {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    companyName: string;
    applicationId: string;
    timestamp: Date;
    interviewDate?: Date | undefined;
    interviewTime?: string | undefined;
    duration?: number | undefined;
    isOnline?: boolean | undefined;
    meetingLink?: string | undefined;
    meetingPlatform?: string | undefined;
    location?: string | undefined;
    roomNumber?: string | undefined;
    contactPerson?: string | undefined;
    contactPhone?: string | undefined;
    instructions?: string | undefined;
    salary?: number | undefined;
    currency?: string | undefined;
    joiningDate?: Date | undefined;
    feedback?: string | undefined;
    previousDate?: Date | undefined;
    previousTime?: string | undefined;
    reason?: string | undefined;
}
export declare const sendApplicationStatusEmail: (status: ApplicationStatusType, data: ApplicationEmailData) => Promise<EmailResult>;
export declare const sendInterviewRescheduledEmail: (data: ApplicationEmailData) => Promise<EmailResult>;
export declare const ApplicationEmailService: {
    sendEmailWithRetry: (to: string, subject: string, html: string, retryConfig?: RetryConfig) => Promise<EmailResult>;
    sendEmailAsync: (to: string, subject: string, html: string, onComplete?: (result: EmailResult) => void) => void;
    sendApplicationStatusEmail: (status: ApplicationStatusType, data: ApplicationEmailData) => Promise<EmailResult>;
    sendInterviewRescheduledEmail: (data: ApplicationEmailData) => Promise<EmailResult>;
    getEmailEventForStatus: (status: ApplicationStatusType) => EmailEventType | null;
};
export {};
//# sourceMappingURL=applicationEmailService.d.ts.map