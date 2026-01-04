/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION EMAIL TEMPLATES - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Professional, responsive email templates for all application status updates
 */

import { formatDate } from '../../../../config/timezone.config';

// ─────────────────────────────────────────────────────────────────────────────
// BASE EMAIL STYLES
// ─────────────────────────────────────────────────────────────────────────────

const baseStyles = `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background-color: #f3f4f6;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  }
  .header {
    padding: 32px 24px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
  }
  .header p {
    margin: 8px 0 0;
    font-size: 14px;
    opacity: 0.9;
    color: #ffffff;
  }
  .content {
    padding: 32px 24px;
  }
  .greeting {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }
  .message {
    font-size: 15px;
    color: #4b5563;
    margin-bottom: 24px;
    line-height: 1.7;
  }
  .info-box {
    background-color: #f9fafb;
    border-radius: 8px;
    padding: 20px;
    margin: 24px 0;
    border-left: 4px solid;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }
  .info-value {
    font-size: 14px;
    color: #1f2937;
    font-weight: 600;
  }
  .button {
    display: inline-block;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
    text-align: center;
    transition: all 0.2s;
  }
  .button-primary {
    background-color: #2563eb;
    color: #ffffff;
  }
  .timeline {
    margin: 24px 0;
  }
  .timeline-item {
    display: flex;
    align-items: flex-start;
    padding: 16px 0;
    border-left: 2px solid #e5e7eb;
    padding-left: 24px;
    position: relative;
  }
  .timeline-item::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 20px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #2563eb;
  }
  .timeline-item.completed::before {
    background-color: #10b981;
  }
  .timeline-item.current::before {
    background-color: #f59e0b;
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
  }
  .footer {
    background-color: #f9fafb;
    padding: 24px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  .footer p {
    margin: 4px 0;
    font-size: 13px;
    color: #6b7280;
  }
  .footer a {
    color: #2563eb;
    text-decoration: none;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: APPLICATION RECEIVED
// ─────────────────────────────────────────────────────────────────────────────

export const applicationReceivedTemplate = (data: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  applicationId: string;
  appliedAt: Date;
  dashboardUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
      <h1>✅ Application Received</h1>
      <p>Thank you for applying!</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${data.candidateName},</p>
      
      <p class="message">
        Thank you for applying for the <strong>${data.jobTitle}</strong> position at 
        <strong>${data.companyName}</strong>. We have successfully received your application.
      </p>
      
      <div class="info-box" style="border-left-color: #2563eb;">
        <div class="info-row">
          <span class="info-label">Position</span>
          <span class="info-value">${data.jobTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Company</span>
          <span class="info-value">${data.companyName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Applied On</span>
          <span class="info-value">${formatDate(data.appliedAt)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Application ID</span>
          <span class="info-value">#${data.applicationId.slice(-8).toUpperCase()}</span>
        </div>
      </div>
      
      <p class="message">
        Our team will review your application and get back to you soon. 
        You can track your application status anytime from your dashboard.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboardUrl}" class="button button-primary" style="color: #ffffff;">
          View Application Status
        </a>
      </div>
      
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 24px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>💡 Tip:</strong> Keep your profile updated with your latest experience 
          and skills to improve your chances.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>CADDCORE Job Portal</strong></p>
      <p>If you have any questions, please contact our support team.</p>
      <p>© ${new Date().getFullYear()} CADDCORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: APPLICATION REVIEWED
// ─────────────────────────────────────────────────────────────────────────────

export const applicationReviewedTemplate = (data: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  reviewedAt: Date;
  dashboardUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Reviewed</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);">
      <h1>👀 Application Reviewed</h1>
      <p>Good news! Your application has been reviewed.</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${data.candidateName},</p>
      
      <p class="message">
        We wanted to let you know that your application for <strong>${data.jobTitle}</strong> 
        at <strong>${data.companyName}</strong> has been reviewed by our hiring team.
      </p>
      
      <div class="info-box" style="border-left-color: #0891b2;">
        <div class="info-row">
          <span class="info-label">Position</span>
          <span class="info-value">${data.jobTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value" style="color: #0891b2;">Under Review</span>
        </div>
        <div class="info-row">
          <span class="info-label">Reviewed On</span>
          <span class="info-value">${formatDate(data.reviewedAt)}</span>
        </div>
      </div>
      
      <p class="message">
        Our team is carefully evaluating all candidates. We will update you on the 
        next steps in the coming days. Thank you for your patience.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboardUrl}" class="button button-primary" style="color: #ffffff;">
          Track Your Application
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>CADDCORE Job Portal</strong></p>
      <p>© ${new Date().getFullYear()} CADDCORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: SHORTLISTED
// ─────────────────────────────────────────────────────────────────────────────

export const applicationShortlistedTemplate = (data: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  shortlistedAt: Date;
  dashboardUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Shortlisted!</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #059669 0%, #047857 100%);">
      <h1>🎉 Congratulations!</h1>
      <p>You've been shortlisted for the next round!</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${data.candidateName},</p>
      
      <p class="message">
        Great news! We are pleased to inform you that you have been <strong>shortlisted</strong> 
        for the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>.
      </p>
      
      <div class="info-box" style="border-left-color: #059669; background-color: #ecfdf5;">
        <div class="info-row">
          <span class="info-label">Position</span>
          <span class="info-value">${data.jobTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value" style="color: #059669;">✓ Shortlisted</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">${formatDate(data.shortlistedAt)}</span>
        </div>
      </div>
      
      <p class="message">
        Your profile and qualifications have impressed our team. We will contact you 
        soon to schedule an interview. Please ensure your contact information is up to date.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboardUrl}" class="button button-primary" style="color: #ffffff; background-color: #059669;">
          View Details
        </a>
      </div>
      
      <div style="background-color: #d1fae5; border-radius: 8px; padding: 16px; margin-top: 24px;">
        <p style="margin: 0; font-size: 14px; color: #065f46;">
          <strong>📞 Next Steps:</strong> Our team will reach out to schedule your interview. 
          Keep your phone accessible and check your email regularly.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>CADDCORE Job Portal</strong></p>
      <p>© ${new Date().getFullYear()} CADDCORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: INTERVIEW SCHEDULED
// ─────────────────────────────────────────────────────────────────────────────

export const interviewScheduledTemplate = (data: {
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
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Scheduled</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);">
      <h1>📅 Interview Scheduled</h1>
      <p>Your interview has been confirmed!</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${data.candidateName},</p>
      
      <p class="message">
        We are excited to meet you! Your interview for the <strong>${data.jobTitle}</strong> 
        position at <strong>${data.companyName}</strong> has been scheduled.
      </p>
      
      <div class="info-box" style="border-left-color: #7c3aed; background-color: #f5f3ff;">
        <div class="info-row">
          <span class="info-label">📅 Date</span>
          <span class="info-value">${formatDate(data.interviewDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Time</span>
          <span class="info-value">${data.interviewTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏱️ Duration</span>
          <span class="info-value">${data.duration} minutes</span>
        </div>
        <div class="info-row">
          <span class="info-label">📍 Type</span>
          <span class="info-value">${data.isOnline ? 'Online Interview' : 'In-Person Interview'}</span>
        </div>
      </div>
      
      ${data.isOnline ? `
        <div style="background-color: #ede9fe; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; color: #5b21b6; font-size: 16px;">🖥️ Online Meeting Details</h3>
          <p style="margin: 8px 0; font-size: 14px; color: #4c1d95;">
            <strong>Platform:</strong> ${data.meetingPlatform || 'Video Call'}
          </p>
          ${data.meetingLink ? `
            <p style="margin: 8px 0; font-size: 14px; color: #4c1d95;">
              <strong>Meeting Link:</strong><br>
              <a href="${data.meetingLink}" style="color: #7c3aed; word-break: break-all;">${data.meetingLink}</a>
            </p>
          ` : ''}
          <div style="text-align: center; margin-top: 16px;">
            <a href="${data.meetingLink}" class="button" style="background-color: #7c3aed; color: #ffffff; display: inline-block;">
              Join Meeting
            </a>
          </div>
        </div>
      ` : `
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; color: #92400e; font-size: 16px;">🏢 Venue Details</h3>
          <p style="margin: 8px 0; font-size: 14px; color: #78350f;">
            <strong>Location:</strong> ${data.location || 'To be confirmed'}
          </p>
          ${data.roomNumber ? `
            <p style="margin: 8px 0; font-size: 14px; color: #78350f;">
              <strong>Room:</strong> ${data.roomNumber}
            </p>
          ` : ''}
          ${data.contactPerson ? `
            <p style="margin: 8px 0; font-size: 14px; color: #78350f;">
              <strong>Contact Person:</strong> ${data.contactPerson}
              ${data.contactPhone ? ` (📞 ${data.contactPhone})` : ''}
            </p>
          ` : ''}
        </div>
      `}
      
      ${data.instructions ? `
        <div style="background-color: #dbeafe; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h4 style="margin: 0 0 8px; color: #1e40af; font-size: 14px;">📝 Instructions</h4>
          <p style="margin: 0; font-size: 14px; color: #1e3a8a; white-space: pre-line;">${data.instructions}</p>
        </div>
      ` : ''}
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h4 style="margin: 0 0 12px; color: #166534; font-size: 14px;">✅ Interview Tips</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #15803d;">
          <li>Be ready 10-15 minutes before the scheduled time</li>
          <li>Test your internet connection and camera/mic (for online)</li>
          <li>Research about the company and role</li>
          <li>Prepare questions to ask the interviewer</li>
          <li>Keep your resume and portfolio handy</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboardUrl}" class="button button-primary" style="color: #ffffff;">
          View Full Details
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>CADDCORE Job Portal</strong></p>
      <p>If you need to reschedule, please contact us at least 24 hours before.</p>
      <p>© ${new Date().getFullYear()} CADDCORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: INTERVIEW RESCHEDULED
// ─────────────────────────────────────────────────────────────────────────────

export const interviewRescheduledTemplate = (data: {
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
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Rescheduled</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
      <h1>🔄 Interview Rescheduled</h1>
      <p>Your interview has been rescheduled to a new time.</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${data.candidateName},</p>
      
      <p class="message">
        Your interview for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> 
        has been rescheduled. Please note the new date and time below.
      </p>
      
      <div style="display: flex; gap: 16px; margin: 24px 0;">
        <div style="flex: 1; background-color: #fef2f2; border-radius: 8px; padding: 16px; text-decoration: line-through; opacity: 0.7;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #991b1b; font-weight: 600;">PREVIOUS</p>
          <p style="margin: 0; font-size: 14px; color: #7f1d1d;">${formatDate(data.previousDate)}</p>
          <p style="margin: 0; font-size: 14px; color: #7f1d1d;">${data.previousTime}</p>
        </div>
        <div style="display: flex; align-items: center; font-size: 24px;">→</div>
        <div style="flex: 1; background-color: #ecfdf5; border-radius: 8px; padding: 16px; border: 2px solid #10b981;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #047857; font-weight: 600;">NEW</p>
          <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 600;">${formatDate(data.newDate)}</p>
          <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 600;">${data.newTime}</p>
        </div>
      </div>
      
      ${data.reason ? `
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Reason:</strong> ${data.reason}
          </p>
        </div>
      ` : ''}
      
      <p class="message">
        We apologize for any inconvenience this may cause. If the new time doesn't work for you, 
        please contact us to find an alternative.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboardUrl}" class="button button-primary" style="color: #ffffff;">
          View Updated Details
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>CADDCORE Job Portal</strong></p>
      <p>© ${new Date().getFullYear()} CADDCORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: SELECTED / OFFER
// ─────────────────────────────────────────────────────────────────────────────

export const applicationSelectedTemplate = (data: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  selectedAt: Date;
  salary?: number | undefined;
  currency?: string | undefined;
  joiningDate?: Date | undefined;
  dashboardUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations - You're Selected!</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
      <h1>🎊 Congratulations!</h1>
      <p>You've been selected for the position!</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${data.candidateName},</p>
      
      <p class="message">
        We are thrilled to inform you that you have been <strong>SELECTED</strong> for the 
        <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>!
      </p>
      
      <div style="background-color: #dcfce7; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
        <h2 style="margin: 0 0 8px; color: #166534; font-size: 20px;">Welcome to the Team!</h2>
        <p style="margin: 0; color: #15803d; font-size: 14px;">
          We're excited to have you join ${data.companyName}
        </p>
      </div>
      
      <div class="info-box" style="border-left-color: #16a34a; background-color: #f0fdf4;">
        <div class="info-row">
          <span class="info-label">Position</span>
          <span class="info-value">${data.jobTitle}</span>
        </div>
        ${data.salary ? `
          <div class="info-row">
            <span class="info-label">Salary</span>
            <span class="info-value">${data.currency || 'BDT'} ${data.salary.toLocaleString()}</span>
          </div>
        ` : ''}
        ${data.joiningDate ? `
          <div class="info-row">
            <span class="info-label">Expected Joining</span>
            <span class="info-value">${formatDate(data.joiningDate)}</span>
          </div>
        ` : ''}
      </div>
      
      <p class="message">
        Our HR team will contact you soon with the offer letter and onboarding details. 
        We look forward to working with you!
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboardUrl}" class="button" style="background-color: #16a34a; color: #ffffff;">
          View Offer Details
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>CADDCORE Job Portal</strong></p>
      <p>Welcome aboard! We're excited to have you join us.</p>
      <p>© ${new Date().getFullYear()} CADDCORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: REJECTED
// ─────────────────────────────────────────────────────────────────────────────

export const applicationRejectedTemplate = (data: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  rejectedAt: Date;
  feedback?: string | undefined;
  dashboardUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">
      <h1>Application Update</h1>
      <p>Thank you for your interest in joining us</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${data.candidateName},</p>
      
      <p class="message">
        Thank you for taking the time to apply for the <strong>${data.jobTitle}</strong> 
        position at <strong>${data.companyName}</strong>.
      </p>
      
      <p class="message">
        After careful consideration, we regret to inform you that we have decided to 
        move forward with other candidates whose experience more closely aligns with 
        our current requirements.
      </p>
      
      ${data.feedback ? `
        <div class="info-box" style="border-left-color: #6b7280;">
          <h4 style="margin: 0 0 8px; color: #374151; font-size: 14px;">Feedback</h4>
          <p style="margin: 0; font-size: 14px; color: #4b5563;">${data.feedback}</p>
        </div>
      ` : ''}
      
      <div style="background-color: #dbeafe; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>💡 Don't give up!</strong><br>
          We encourage you to continue applying for other positions that match your 
          skills. Your profile will remain in our database for future opportunities.
        </p>
      </div>
      
      <p class="message">
        We wish you the best in your job search and future career endeavors.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboardUrl}" class="button button-primary" style="color: #ffffff;">
          Browse Other Jobs
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>CADDCORE Job Portal</strong></p>
      <p>Thank you for considering us. Best of luck!</p>
      <p>© ${new Date().getFullYear()} CADDCORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ALL TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export const ApplicationEmailTemplates = {
  applicationReceived: applicationReceivedTemplate,
  applicationReviewed: applicationReviewedTemplate,
  applicationShortlisted: applicationShortlistedTemplate,
  interviewScheduled: interviewScheduledTemplate,
  interviewRescheduled: interviewRescheduledTemplate,
  applicationSelected: applicationSelectedTemplate,
  applicationRejected: applicationRejectedTemplate,
};
