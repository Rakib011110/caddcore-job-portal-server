/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB ALERT SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Handles job alert notifications when new jobs are posted.
 * - Matches jobs with user preferences
 * - Sends emails in batches with rate limiting
 * - No cron job needed - triggers on job creation
 */

import nodemailer from 'nodemailer';
import config from '../../config';
import { User } from '../modules/User/user.model';
import { TUser, IJobAlertPreferences } from '../modules/User/user.interface';
import { TJobs } from '../modules/jobs/job.interface';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 20;           // Send to 20 users at a time
const BATCH_DELAY_MS = 3000;     // 3 seconds gap between batches
const INDIVIDUAL_DELAY_MS = 100; // 100ms between individual emails in batch

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL TRANSPORTER
// ─────────────────────────────────────────────────────────────────────────────

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email_host,
    port: Number(config.email_port),
    secure: false, // false for port 587
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB MATCHING LOGIC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find users whose job alert preferences match the new job
 */
export const findMatchingUsers = async (job: TJobs): Promise<TUser[]> => {
  try {
    // Build query to find users with enabled job alerts
    const query: any = {
      'jobAlertPreferences.enabled': true,
      status: 'ACTIVE',
    };

    // Get all users with enabled job alerts
    const users = await User.find(query).lean();

    // Filter users based on their specific preferences
    const matchingUsers = users.filter((user: any) => {
      const prefs: IJobAlertPreferences = user.jobAlertPreferences;
      if (!prefs || !prefs.enabled) return false;

      let matches = true;

      // Check category match (if user has category preferences)
      if (prefs.categories && prefs.categories.length > 0 && job.category) {
        const categoryMatch = prefs.categories.some(
          cat => cat.toLowerCase() === job.category?.toLowerCase()
        );
        if (!categoryMatch) matches = false;
      }

      // Check location match (if user has location preferences)
      if (matches && prefs.locations && prefs.locations.length > 0 && job.location) {
        const locationMatch = prefs.locations.some(loc =>
          job.location?.toLowerCase().includes(loc.toLowerCase()) ||
          loc.toLowerCase().includes(job.location?.toLowerCase() || '')
        );
        if (!locationMatch) matches = false;
      }

      // Check job type match (if user has job type preferences)
      if (matches && prefs.jobTypes && prefs.jobTypes.length > 0 && job.jobType) {
        const typeMatch = prefs.jobTypes.some(
          type => type.toLowerCase() === job.jobType?.toLowerCase()
        );
        if (!typeMatch) matches = false;
      }

      // Check keywords match (if user has keyword preferences)
      if (matches && prefs.keywords && prefs.keywords.length > 0) {
        const jobText = `${job.title} ${job.description} ${job.companyName} ${job.requiredSkills?.join(' ')}`.toLowerCase();
        const keywordMatch = prefs.keywords.some(keyword =>
          jobText.includes(keyword.toLowerCase())
        );
        if (!keywordMatch) matches = false;
      }

      // Check minimum salary (if user has salary preference)
      if (matches && prefs.minSalary && prefs.minSalary > 0) {
        // Extract numeric value from salary range if possible
        const salaryMatch = extractSalary(job.salaryRange) >= prefs.minSalary;
        if (!salaryMatch) matches = false;
      }

      return matches;
    });

    console.log(`[JobAlert] Found ${matchingUsers.length} matching users for job: ${job.title}`);
    return matchingUsers as TUser[];

  } catch (error) {
    console.error('[JobAlert] Error finding matching users:', error);
    return [];
  }
};

/**
 * Extract numeric salary from salary range string
 */
const extractSalary = (salaryRange?: string): number => {
  if (!salaryRange) return 0;
  
  // Extract numbers from string like "50000-80000" or "৳50,000" etc.
  const numbers = salaryRange.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    return parseInt(numbers[0].replace(/,/g, ''));
  }
  return 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate HTML email template for job alert
 */
const generateJobAlertEmail = (user: TUser, job: TJobs): string => {
  const jobUrl = `${config.client_url}/jobs/${job.slug || job._id}`;
  const unsubscribeUrl = `${config.client_url}/user-profile/job-alerts`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
          🔔 New Job Alert
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
          A new job matching your preferences has been posted!
        </p>
      </td>
    </tr>
    
    <!-- Greeting -->
    <tr>
      <td style="padding: 30px 40px 20px;">
        <p style="color: #374151; font-size: 16px; margin: 0;">
          Hi <strong>${user.name || 'there'}</strong>,
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0;">
          Great news! A new job that matches your preferences has just been posted.
        </p>
      </td>
    </tr>
    
    <!-- Job Card -->
    <tr>
      <td style="padding: 0 40px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <!-- Company Header -->
          <tr>
            <td style="padding: 20px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50" valign="top">
                    <div style="width: 45px; height: 45px; background-color: #2563eb; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                      ${job.companyLogoUrl 
                        ? `<img src="${job.companyLogoUrl}" alt="" style="width: 45px; height: 45px; border-radius: 10px; object-fit: cover;">` 
                        : `<span style="color: white; font-weight: bold; font-size: 16px; display: block; text-align: center; line-height: 45px;">${(job.companyName || 'C').charAt(0).toUpperCase()}</span>`
                      }
                    </div>
                  </td>
                  <td style="padding-left: 15px;">
                    <h2 style="color: #111827; font-size: 18px; margin: 0; font-weight: 600;">
                      ${job.title}
                    </h2>
                    <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0;">
                      ${job.companyName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Job Details -->
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${job.location ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #9ca3af; font-size: 13px;">📍 Location:</span>
                    <span style="color: #374151; font-size: 14px; margin-left: 8px;">${job.location}</span>
                  </td>
                </tr>
                ` : ''}
                ${job.jobType ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #9ca3af; font-size: 13px;">💼 Type:</span>
                    <span style="color: #374151; font-size: 14px; margin-left: 8px;">${job.jobType}</span>
                  </td>
                </tr>
                ` : ''}
                ${job.salaryRange ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #9ca3af; font-size: 13px;">💰 Salary:</span>
                    <span style="color: #374151; font-size: 14px; margin-left: 8px;">${job.salaryRange}</span>
                  </td>
                </tr>
                ` : ''}
                ${job.category ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #9ca3af; font-size: 13px;">🏷️ Category:</span>
                    <span style="color: #374151; font-size: 14px; margin-left: 8px;">${job.category}</span>
                  </td>
                </tr>
                ` : ''}
                ${job.applicationDeadline ? `
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #9ca3af; font-size: 13px;">📅 Deadline:</span>
                    <span style="color: #ef4444; font-size: 14px; font-weight: 500; margin-left: 8px;">${new Date(job.applicationDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          <!-- Description Preview -->
          ${job.description ? `
          <tr>
            <td style="padding: 0 20px 20px;">
              <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.6;">
                ${stripHtml(job.description).substring(0, 200)}...
              </p>
            </td>
          </tr>
          ` : ''}
          
          <!-- Skills Tags -->
          ${job.requiredSkills && job.requiredSkills.length > 0 ? `
          <tr>
            <td style="padding: 0 20px 20px;">
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${job.requiredSkills.slice(0, 5).map(skill => `
                  <span style="display: inline-block; padding: 4px 12px; background-color: #eff6ff; color: #2563eb; font-size: 12px; border-radius: 20px;">
                    ${skill}
                  </span>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 20px 25px;">
              <a href="${jobUrl}" style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                View Job Details →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 40px 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
          You received this email because you enabled job alerts on Job Portal.
          <br>
          <a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: none;">Manage your alert preferences</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Strip HTML tags from string
 */
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SENDING WITH RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sleep utility for delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send email to a single user
 */
const sendEmailToUser = async (
  transporter: nodemailer.Transporter,
  user: TUser,
  job: TJobs
): Promise<boolean> => {
  try {
    const htmlContent = generateJobAlertEmail(user, job);
    
    await transporter.sendMail({
      from: `"Job Portal" <${config.email_from}>`,
      to: user.email,
      subject: `🔔 New Job: ${job.title} at ${job.companyName}`,
      html: htmlContent,
    });
    
    console.log(`[JobAlert] ✓ Email sent to: ${user.email}`);
    return true;
  } catch (error: any) {
    console.error(`[JobAlert] ✗ Failed to send email to ${user.email}:`, error.message);
    return false;
  }
};

/**
 * Send job alert emails to all matching users in batches
 * - 20 users per batch
 * - 3 second gap between batches
 * - 100ms gap between individual emails
 */
export const sendJobAlertEmails = async (job: TJobs, users: TUser[]): Promise<{
  total: number;
  sent: number;
  failed: number;
}> => {
  if (users.length === 0) {
    console.log('[JobAlert] No users to send emails to');
    return { total: 0, sent: 0, failed: 0 };
  }

  console.log(`[JobAlert] Starting to send emails to ${users.length} users for job: ${job.title}`);
  console.log(`[JobAlert] Batch size: ${BATCH_SIZE}, Batch delay: ${BATCH_DELAY_MS}ms`);

  const transporter = createTransporter();
  let sentCount = 0;
  let failedCount = 0;

  // Split users into batches
  const batches: TUser[][] = [];
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    batches.push(users.slice(i, i + BATCH_SIZE));
  }

  console.log(`[JobAlert] Total batches: ${batches.length}`);

  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    if (!batch) continue; // Skip if batch is undefined
    
    console.log(`[JobAlert] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} users)`);

    // Send emails to users in current batch with small delay between each
    for (const user of batch) {
      const success = await sendEmailToUser(transporter, user, job);
      if (success) {
        sentCount++;
      } else {
        failedCount++;
      }
      
      // Small delay between individual emails
      await sleep(INDIVIDUAL_DELAY_MS);
    }

    // Delay before next batch (except for the last batch)
    if (batchIndex < batches.length - 1) {
      console.log(`[JobAlert] Waiting ${BATCH_DELAY_MS}ms before next batch...`);
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`[JobAlert] ═══════════════════════════════════════`);
  console.log(`[JobAlert] Email sending completed for job: ${job.title}`);
  console.log(`[JobAlert] Total: ${users.length}, Sent: ${sentCount}, Failed: ${failedCount}`);
  console.log(`[JobAlert] ═══════════════════════════════════════`);

  return {
    total: users.length,
    sent: sentCount,
    failed: failedCount,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TRIGGER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main function to trigger job alerts when a new job is created
 * This runs asynchronously and doesn't block the job creation response
 */
export const triggerJobAlerts = async (job: TJobs): Promise<void> => {
  try {
    console.log(`[JobAlert] ═══════════════════════════════════════`);
    console.log(`[JobAlert] New job posted: ${job.title}`);
    console.log(`[JobAlert] Triggering job alerts...`);
    console.log(`[JobAlert] ═══════════════════════════════════════`);

    // Find matching users
    const matchingUsers = await findMatchingUsers(job);

    if (matchingUsers.length === 0) {
      console.log('[JobAlert] No matching users found. Skipping email alerts.');
      return;
    }

    // Send emails in background (don't await to keep it non-blocking)
    sendJobAlertEmails(job, matchingUsers)
      .then(result => {
        console.log(`[JobAlert] Background email sending completed:`, result);
      })
      .catch(error => {
        console.error('[JobAlert] Background email sending failed:', error);
      });

  } catch (error) {
    console.error('[JobAlert] Error triggering job alerts:', error);
  }
};

export default {
  triggerJobAlerts,
  findMatchingUsers,
  sendJobAlertEmails,
};
