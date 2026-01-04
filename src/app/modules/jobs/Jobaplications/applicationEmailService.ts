import nodemailer from 'nodemailer';
import config from '../../../../config';
import { 
  IEmailEvent, 
  EmailEventType, 
  ApplicationStatusType 
} from './Jobaplications.interfaces';
import { ApplicationEmailTemplates } from './applicationEmailTemplates';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION EMAIL SERVICE - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Event-driven, failure-safe email notification service
 * - Retry mechanism with exponential backoff
 * - Queue-ready architecture for future scaling
 * - Non-blocking email sending
 * - Comprehensive error handling
 */

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL TRANSPORTER SINGLETON
// ─────────────────────────────────────────────────────────────────────────────

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email_host,
      port: Number(config.email_port),
      secure: false, // TLS
      auth: {
        user: config.email_user,
        pass: config.email_pass,
      },
      // Connection pool for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // Timeouts
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
    });
  }
  return transporter;
};

// ─────────────────────────────────────────────────────────────────────────────
// RETRY CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

// ─────────────────────────────────────────────────────────────────────────────
// SLEEP UTILITY
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// EXPONENTIAL BACKOFF DELAY
// ─────────────────────────────────────────────────────────────────────────────

const getBackoffDelay = (attempt: number, config: RetryConfig): number => {
  const delay = Math.min(
    config.baseDelayMs * Math.pow(2, attempt),
    config.maxDelayMs
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL RESULT INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  attempts: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND EMAIL WITH RETRY
// ─────────────────────────────────────────────────────────────────────────────

export const sendEmailWithRetry = async (
  to: string,
  subject: string,
  html: string,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<EmailResult> => {
  const transport = getTransporter();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = await transport.sendMail({
        from: config.email_from,
        to,
        subject,
        html,
      });
      
      console.log(`✅ Email sent successfully to ${to} (attempt ${attempt + 1})`);
      
      return {
        success: true,
        messageId: result.messageId,
        attempts: attempt + 1,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Email attempt ${attempt + 1} failed for ${to}:`, error.message);
      
      if (attempt < retryConfig.maxRetries) {
        const delay = getBackoffDelay(attempt, retryConfig);
        console.log(`⏳ Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
  }
  
  console.error(`❌ All email attempts failed for ${to}`);
  
  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    attempts: retryConfig.maxRetries + 1,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// NON-BLOCKING EMAIL SEND (Fire and Forget with Logging)
// ─────────────────────────────────────────────────────────────────────────────

export const sendEmailAsync = (
  to: string,
  subject: string,
  html: string,
  onComplete?: (result: EmailResult) => void
): void => {
  // Fire and forget - don't await
  sendEmailWithRetry(to, subject, html)
    .then(result => {
      if (onComplete) {
        onComplete(result);
      }
    })
    .catch(error => {
      console.error('Unexpected email error:', error);
      if (onComplete) {
        onComplete({
          success: false,
          error: error.message,
          attempts: 1,
        });
      }
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS TO EMAIL EVENT MAPPING
// ─────────────────────────────────────────────────────────────────────────────

const getEmailEventForStatus = (status: ApplicationStatusType): EmailEventType | null => {
  const mapping: Partial<Record<ApplicationStatusType, EmailEventType>> = {
    'Pending': 'APPLICATION_RECEIVED',
    'Reviewed': 'APPLICATION_REVIEWED',
    'Shortlisted': 'APPLICATION_SHORTLISTED',
    'Interview Scheduled': 'INTERVIEW_SCHEDULED',
    'Selected': 'APPLICATION_SELECTED',
    'Rejected': 'APPLICATION_REJECTED',
    'Offer Extended': 'OFFER_EXTENDED',
  };
  
  return mapping[status] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND APPLICATION STATUS EMAIL
// ─────────────────────────────────────────────────────────────────────────────

export interface ApplicationEmailData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  applicationId: string;
  timestamp: Date;
  // Status specific data
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
  // For reschedule
  previousDate?: Date | undefined;
  previousTime?: string | undefined;
  reason?: string | undefined;
}

export const sendApplicationStatusEmail = async (
  status: ApplicationStatusType,
  data: ApplicationEmailData
): Promise<EmailResult> => {
  const dashboardUrl = `${config.client_url}/user-profile/applications`;
  
  let subject: string;
  let html: string;
  
  switch (status) {
    case 'Pending':
      subject = `Application Received - ${data.jobTitle} at ${data.companyName}`;
      html = ApplicationEmailTemplates.applicationReceived({
        candidateName: data.candidateName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        applicationId: data.applicationId,
        appliedAt: data.timestamp,
        dashboardUrl,
      });
      break;
      
    case 'Reviewed':
      subject = `Application Reviewed - ${data.jobTitle} at ${data.companyName}`;
      html = ApplicationEmailTemplates.applicationReviewed({
        candidateName: data.candidateName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        reviewedAt: data.timestamp,
        dashboardUrl,
      });
      break;
      
    case 'Shortlisted':
      subject = `🎉 Congratulations! You're Shortlisted - ${data.jobTitle}`;
      html = ApplicationEmailTemplates.applicationShortlisted({
        candidateName: data.candidateName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        shortlistedAt: data.timestamp,
        dashboardUrl,
      });
      break;
      
    case 'Interview Scheduled':
      subject = `📅 Interview Scheduled - ${data.jobTitle} at ${data.companyName}`;
      html = ApplicationEmailTemplates.interviewScheduled({
        candidateName: data.candidateName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        interviewDate: data.interviewDate!,
        interviewTime: data.interviewTime!,
        duration: data.duration || 60,
        isOnline: data.isOnline!,
        meetingLink: data.meetingLink,
        meetingPlatform: data.meetingPlatform,
        location: data.location,
        roomNumber: data.roomNumber,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        instructions: data.instructions,
        dashboardUrl,
      });
      break;
      
    case 'Selected':
    case 'Offer Extended':
      subject = `🎊 Congratulations! You're Selected - ${data.jobTitle}`;
      html = ApplicationEmailTemplates.applicationSelected({
        candidateName: data.candidateName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        selectedAt: data.timestamp,
        salary: data.salary,
        currency: data.currency,
        joiningDate: data.joiningDate,
        dashboardUrl,
      });
      break;
      
    case 'Rejected':
      subject = `Application Update - ${data.jobTitle} at ${data.companyName}`;
      html = ApplicationEmailTemplates.applicationRejected({
        candidateName: data.candidateName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        rejectedAt: data.timestamp,
        feedback: data.feedback,
        dashboardUrl,
      });
      break;
      
    default:
      console.log(`No email template for status: ${status}`);
      return {
        success: true,
        attempts: 0,
      };
  }
  
  return sendEmailWithRetry(data.candidateEmail, subject, html);
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND INTERVIEW RESCHEDULED EMAIL
// ─────────────────────────────────────────────────────────────────────────────

export const sendInterviewRescheduledEmail = async (
  data: ApplicationEmailData
): Promise<EmailResult> => {
  const dashboardUrl = `${config.client_url}/user-profile/applications`;
  
  const subject = `🔄 Interview Rescheduled - ${data.jobTitle} at ${data.companyName}`;
  const html = ApplicationEmailTemplates.interviewRescheduled({
    candidateName: data.candidateName,
    jobTitle: data.jobTitle,
    companyName: data.companyName,
    previousDate: data.previousDate!,
    previousTime: data.previousTime!,
    newDate: data.interviewDate!,
    newTime: data.interviewTime!,
    reason: data.reason,
    isOnline: data.isOnline!,
    meetingLink: data.meetingLink,
    location: data.location,
    dashboardUrl,
  });
  
  return sendEmailWithRetry(data.candidateEmail, subject, html);
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SERVICE EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const ApplicationEmailService = {
  sendEmailWithRetry,
  sendEmailAsync,
  sendApplicationStatusEmail,
  sendInterviewRescheduledEmail,
  getEmailEventForStatus,
};
