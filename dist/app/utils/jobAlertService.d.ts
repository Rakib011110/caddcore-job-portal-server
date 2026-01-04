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
import { TUser } from '../modules/User/user.interface';
import { TJobs } from '../modules/jobs/job.interface';
/**
 * Find users whose job alert preferences match the new job
 */
export declare const findMatchingUsers: (job: TJobs) => Promise<TUser[]>;
/**
 * Send job alert emails to all matching users in batches
 * - 20 users per batch
 * - 3 second gap between batches
 * - 100ms gap between individual emails
 */
export declare const sendJobAlertEmails: (job: TJobs, users: TUser[]) => Promise<{
    total: number;
    sent: number;
    failed: number;
}>;
/**
 * Main function to trigger job alerts when a new job is created
 * This runs asynchronously and doesn't block the job creation response
 */
export declare const triggerJobAlerts: (job: TJobs) => Promise<void>;
declare const _default: {
    triggerJobAlerts: (job: TJobs) => Promise<void>;
    findMatchingUsers: (job: TJobs) => Promise<TUser[]>;
    sendJobAlertEmails: (job: TJobs, users: TUser[]) => Promise<{
        total: number;
        sent: number;
        failed: number;
    }>;
};
export default _default;
//# sourceMappingURL=jobAlertService.d.ts.map