"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationEmailService = exports.sendInterviewRescheduledEmail = exports.sendApplicationStatusEmail = exports.sendEmailAsync = exports.sendEmailWithRetry = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../../../config"));
const applicationEmailTemplates_1 = require("./applicationEmailTemplates");
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
let transporter = null;
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: config_1.default.email_host,
            port: Number(config_1.default.email_port),
            secure: false, // TLS
            auth: {
                user: config_1.default.email_user,
                pass: config_1.default.email_pass,
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
const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
};
// ─────────────────────────────────────────────────────────────────────────────
// SLEEP UTILITY
// ─────────────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// ─────────────────────────────────────────────────────────────────────────────
// EXPONENTIAL BACKOFF DELAY
// ─────────────────────────────────────────────────────────────────────────────
const getBackoffDelay = (attempt, config) => {
    const delay = Math.min(config.baseDelayMs * Math.pow(2, attempt), config.maxDelayMs);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
};
// ─────────────────────────────────────────────────────────────────────────────
// SEND EMAIL WITH RETRY
// ─────────────────────────────────────────────────────────────────────────────
const sendEmailWithRetry = async (to, subject, html, retryConfig = DEFAULT_RETRY_CONFIG) => {
    const transport = getTransporter();
    let lastError = null;
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
            const result = await transport.sendMail({
                from: config_1.default.email_from,
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
        }
        catch (error) {
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
exports.sendEmailWithRetry = sendEmailWithRetry;
// ─────────────────────────────────────────────────────────────────────────────
// NON-BLOCKING EMAIL SEND (Fire and Forget with Logging)
// ─────────────────────────────────────────────────────────────────────────────
const sendEmailAsync = (to, subject, html, onComplete) => {
    // Fire and forget - don't await
    (0, exports.sendEmailWithRetry)(to, subject, html)
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
exports.sendEmailAsync = sendEmailAsync;
// ─────────────────────────────────────────────────────────────────────────────
// STATUS TO EMAIL EVENT MAPPING
// ─────────────────────────────────────────────────────────────────────────────
const getEmailEventForStatus = (status) => {
    const mapping = {
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
const sendApplicationStatusEmail = async (status, data) => {
    const dashboardUrl = `${config_1.default.client_url}/user-profile/applications`;
    let subject;
    let html;
    switch (status) {
        case 'Pending':
            subject = `Application Received - ${data.jobTitle} at ${data.companyName}`;
            html = applicationEmailTemplates_1.ApplicationEmailTemplates.applicationReceived({
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
            html = applicationEmailTemplates_1.ApplicationEmailTemplates.applicationReviewed({
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                companyName: data.companyName,
                reviewedAt: data.timestamp,
                dashboardUrl,
            });
            break;
        case 'Shortlisted':
            subject = `🎉 Congratulations! You're Shortlisted - ${data.jobTitle}`;
            html = applicationEmailTemplates_1.ApplicationEmailTemplates.applicationShortlisted({
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                companyName: data.companyName,
                shortlistedAt: data.timestamp,
                dashboardUrl,
            });
            break;
        case 'Interview Scheduled':
            subject = `📅 Interview Scheduled - ${data.jobTitle} at ${data.companyName}`;
            html = applicationEmailTemplates_1.ApplicationEmailTemplates.interviewScheduled({
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                companyName: data.companyName,
                interviewDate: data.interviewDate,
                interviewTime: data.interviewTime,
                duration: data.duration || 60,
                isOnline: data.isOnline,
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
            html = applicationEmailTemplates_1.ApplicationEmailTemplates.applicationSelected({
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
            html = applicationEmailTemplates_1.ApplicationEmailTemplates.applicationRejected({
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
    return (0, exports.sendEmailWithRetry)(data.candidateEmail, subject, html);
};
exports.sendApplicationStatusEmail = sendApplicationStatusEmail;
// ─────────────────────────────────────────────────────────────────────────────
// SEND INTERVIEW RESCHEDULED EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const sendInterviewRescheduledEmail = async (data) => {
    const dashboardUrl = `${config_1.default.client_url}/user-profile/applications`;
    const subject = `🔄 Interview Rescheduled - ${data.jobTitle} at ${data.companyName}`;
    const html = applicationEmailTemplates_1.ApplicationEmailTemplates.interviewRescheduled({
        candidateName: data.candidateName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        previousDate: data.previousDate,
        previousTime: data.previousTime,
        newDate: data.interviewDate,
        newTime: data.interviewTime,
        reason: data.reason,
        isOnline: data.isOnline,
        meetingLink: data.meetingLink,
        location: data.location,
        dashboardUrl,
    });
    return (0, exports.sendEmailWithRetry)(data.candidateEmail, subject, html);
};
exports.sendInterviewRescheduledEmail = sendInterviewRescheduledEmail;
// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SERVICE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
exports.ApplicationEmailService = {
    sendEmailWithRetry: exports.sendEmailWithRetry,
    sendEmailAsync: exports.sendEmailAsync,
    sendApplicationStatusEmail: exports.sendApplicationStatusEmail,
    sendInterviewRescheduledEmail: exports.sendInterviewRescheduledEmail,
    getEmailEventForStatus,
};
//# sourceMappingURL=applicationEmailService.js.map