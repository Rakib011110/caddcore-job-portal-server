import jwt from 'jsonwebtoken';
import config from '../../../config';
import { User } from '../User/user.model';
import { JobApplication } from '../jobs/Jobaplications/Jobaplications.model';
import { EmployerFollowup } from '../EmployerFollowup/employerFollowup.model';
import { SettingsService } from '../Settings/settings.service';
import { SETTING_KEYS } from '../Settings/settings.constant';
import { sendAdminDigest, sendSixMonthCheckIn } from './cron.emails';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SCHEDULED JOBS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Two jobs, both idempotent and both opt-in.
 *
 * Idempotent matters more than it sounds: this runs from an external scheduler
 * over HTTP, and schedulers retry. Running the daily job three times must not
 * send a candidate three emails, which is why the check-in stamps
 * `sixMonthEmailSentAt` and filters on its absence rather than trusting that it
 * only runs once.
 *
 * Opt-in matters because these are the only emails the system sends without a
 * person triggering them. Both are off by default and are turned on in
 * Admin → Settings → Automated Emails.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CHECK-IN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The emailed check-in link carries a signed token rather than an application
 * id.
 *
 * A raw id in a URL would let anyone who guessed one read a stranger's
 * placement, and these links get forwarded. The token is signed with the
 * existing JWT secret, scoped to a single application, and expires - so a leaked
 * link stops working and can never be pointed at a different record.
 */
const CHECKIN_AUDIENCE = 'placement-checkin';

export interface CheckInTokenPayload {
  applicationId: string;
  aud: string;
}

export const createCheckInToken = (
  applicationId: string,
  expiresInDays: number
): string =>
  jwt.sign({ applicationId, aud: CHECKIN_AUDIENCE }, config.jwt_access_secret as string, {
    expiresIn: `${expiresInDays}d`,
  });

/** Returns the application id, or null when the token is bad or expired. */
export const verifyCheckInToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as CheckInTokenPayload;

    // An access token must not double as a check-in token, so the audience is
    // checked explicitly rather than assumed from a valid signature.
    if (decoded.aud !== CHECKIN_AUDIENCE || !decoded.applicationId) return null;

    return decoded.applicationId;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const describe = (app: any): string => {
  const name = app.userId?.name || 'Unknown candidate';
  const company = app.jobId?.companyName || 'unknown employer';
  return `${name} — ${company}`;
};

/** Who the digest goes to: the configured list, or every staff account. */
const resolveDigestRecipients = async (): Promise<string[]> => {
  const configured = await SettingsService.get<string>(
    SETTING_KEYS.NOTIFICATIONS_ADMIN_DIGEST_RECIPIENTS
  );

  const explicit = String(configured || '')
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.includes('@'));

  if (explicit.length > 0) return explicit;

  const staff = await User.find({
    role: { $in: ['ADMIN', 'HR'] },
    status: 'ACTIVE',
  })
    .select('email')
    .limit(25)
    .lean();

  return staff.map((member: any) => member.email).filter(Boolean);
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB 1 - ADMIN DAILY DIGEST
// ─────────────────────────────────────────────────────────────────────────────

export interface JobResult {
  job: string;
  skipped?: string;
  processed?: number;
  sent?: number;
  errors?: string[];
}

export const runAdminDigest = async (): Promise<JobResult> => {
  const enabled = await SettingsService.get<boolean>(
    SETTING_KEYS.NOTIFICATIONS_ADMIN_DAILY_DIGEST
  );

  if (!enabled) {
    return { job: 'admin-digest', skipped: 'disabled in settings' };
  }

  const now = new Date();

  const [dueCheckIns, missingJoiningDates, overdueActions] = await Promise.all([
    JobApplication.find({
      applicationStatus: { $in: ['Selected', 'Offer Accepted'] },
      'placement.sixMonthFollowUpDate': { $lte: now },
      $or: [
        { 'placement.sixMonthFollowUpStatus': { $in: ['Pending', 'Contacted'] } },
        { 'placement.sixMonthFollowUpStatus': { $exists: false } },
      ],
    })
      .populate([
        { path: 'jobId', select: 'companyName' },
        { path: 'userId', select: 'name' },
      ])
      .limit(30)
      .lean(),

    JobApplication.find({
      applicationStatus: { $in: ['Selected', 'Offer Accepted'] },
      $or: [
        { 'offerDetails.joiningDate': { $exists: false } },
        { 'offerDetails.joiningDate': null },
      ],
    })
      .populate([
        { path: 'jobId', select: 'companyName' },
        { path: 'userId', select: 'name' },
      ])
      .limit(30)
      .lean(),

    EmployerFollowup.find({
      isNextActionDone: false,
      nextActionDate: { $lte: now },
      nextAction: { $exists: true, $ne: '' },
    })
      .limit(30)
      .lean(),
  ]);

  // A digest that arrives every morning saying "nothing to do" is a digest
  // people filter into a folder. Silence is the correct output for a quiet day.
  if (
    dueCheckIns.length === 0 &&
    missingJoiningDates.length === 0 &&
    overdueActions.length === 0
  ) {
    return { job: 'admin-digest', skipped: 'nothing due today', processed: 0 };
  }

  const recipients = await resolveDigestRecipients();

  if (recipients.length === 0) {
    return { job: 'admin-digest', skipped: 'no recipients configured' };
  }

  await sendAdminDigest(recipients, {
    dueCheckIns: dueCheckIns.map(describe),
    missingJoiningDates: missingJoiningDates.map(describe),
    overdueEmployerActions: overdueActions.map(
      (followup: any) =>
        `${followup.companyNameSnapshot || 'Employer'} — ${followup.nextAction}`
    ),
  });

  return {
    job: 'admin-digest',
    sent: recipients.length,
    processed:
      dueCheckIns.length + missingJoiningDates.length + overdueActions.length,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB 2 - CANDIDATE SIX-MONTH CHECK-IN
// ─────────────────────────────────────────────────────────────────────────────

export const runSixMonthCheckIn = async (): Promise<JobResult> => {
  const [enabled, expiryDays] = await Promise.all([
    SettingsService.get<boolean>(SETTING_KEYS.NOTIFICATIONS_SIX_MONTH_CHECKIN),
    SettingsService.get<number>(SETTING_KEYS.NOTIFICATIONS_SIX_MONTH_REMINDER_DAYS),
  ]);

  if (!enabled) {
    return { job: 'six-month-checkin', skipped: 'disabled in settings' };
  }

  const days = Number(expiryDays) || 30;

  const candidates = await JobApplication.find({
    applicationStatus: { $in: ['Selected', 'Offer Accepted'] },
    'placement.sixMonthFollowUpDate': { $lte: new Date() },
    // Never emailed before, and not already answered by any route.
    'placement.sixMonthEmailSentAt': { $exists: false },
    $or: [
      { 'placement.sixMonthFollowUpStatus': 'Pending' },
      { 'placement.sixMonthFollowUpStatus': { $exists: false } },
    ],
  })
    .populate([
      { path: 'jobId', select: 'title companyName' },
      { path: 'userId', select: 'name email' },
    ])
    // Capped per run so a first switch-on against a large backlog does not fire
    // hundreds of emails in one go and trip the SMTP provider's rate limit.
    .limit(50);

  const errors: string[] = [];
  let sent = 0;

  for (const application of candidates as any[]) {
    const email = application.userId?.email;
    if (!email) continue;

    try {
      const token = createCheckInToken(String(application._id), days);
      const checkInUrl = `${config.client_url}/placement-check-in?token=${token}`;

      await sendSixMonthCheckIn(email, {
        candidateName: application.userId?.name || 'there',
        companyName: application.jobId?.companyName || 'your employer',
        jobTitle: application.jobId?.title || 'your role',
        checkInUrl,
        expiresInDays: days,
      });

      // Stamped only after a successful send, so a failure is retried tomorrow
      // rather than silently marked as done.
      await JobApplication.updateOne(
        { _id: application._id },
        {
          $set: {
            'placement.sixMonthEmailSentAt': new Date(),
            'placement.sixMonthFollowUpStatus': 'Contacted',
          },
        }
      );

      sent++;
    } catch (error) {
      errors.push(
        `${email}: ${error instanceof Error ? error.message : 'send failed'}`
      );
    }
  }

  return {
    job: 'six-month-checkin',
    processed: candidates.length,
    sent,
    ...(errors.length > 0 ? { errors } : {}),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

export type CheckInAnswer = 'working' | 'left';

/** What the check-in page shows before the candidate answers. */
export const getCheckInContext = async (token: string) => {
  const applicationId = verifyCheckInToken(token);
  if (!applicationId) return null;

  const application = await JobApplication.findById(applicationId)
    .populate([
      { path: 'jobId', select: 'title companyName' },
      { path: 'userId', select: 'name' },
    ])
    .lean();

  if (!application) return null;

  const placement = (application as any).placement || {};

  return {
    candidateName: (application as any).userId?.name || '',
    companyName: (application as any).jobId?.companyName || '',
    jobTitle: (application as any).jobId?.title || '',
    joiningDate: (application as any).offerDetails?.joiningDate || null,
    /** True when they have already answered - the page says thank you instead. */
    alreadyAnswered: Boolean(placement.respondedAt),
    previousAnswer: placement.employmentStatus || null,
  };
};

/**
 * Record the candidate's own answer.
 *
 * Deliberately does NOT set `placement.verified`. Verified means the institute
 * confirmed the placement with the employer; a candidate saying so is useful
 * evidence but it is not that confirmation, and conflating the two would inflate
 * the verified placement figures.
 */
export const submitCheckInResponse = async (
  token: string,
  answer: CheckInAnswer,
  note?: string
) => {
  const applicationId = verifyCheckInToken(token);
  if (!applicationId) return null;

  const isWorking = answer === 'working';

  const update: Record<string, unknown> = {
    'placement.employmentStatus': isWorking ? 'Working' : 'Resigned',
    'placement.sixMonthFollowUpStatus': isWorking
      ? 'Confirmed Working'
      : 'Left Job',
    'placement.respondedBySelf': true,
    'placement.respondedAt': new Date(),
  };

  if (note?.trim()) {
    update['placement.notes'] = `Candidate reply: ${note.trim()}`;
  }

  const updated = await JobApplication.findByIdAndUpdate(
    applicationId,
    { $set: update },
    { new: true }
  );

  return updated ? { ok: true, answer } : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────────────────────────────────────

/** Everything the daily schedule should do, in order. */
export const runDailyJobs = async (): Promise<JobResult[]> => {
  const results: JobResult[] = [];

  // Sequential, and each wrapped: one job failing must not stop the other from
  // running, and the caller should see which one broke.
  for (const job of [runSixMonthCheckIn, runAdminDigest]) {
    try {
      results.push(await job());
    } catch (error) {
      results.push({
        job: job.name,
        errors: [error instanceof Error ? error.message : 'unknown error'],
      });
    }
  }

  return results;
};

export const CronService = {
  runDailyJobs,
  runAdminDigest,
  runSixMonthCheckIn,
  getCheckInContext,
  submitCheckInResponse,
  createCheckInToken,
  verifyCheckInToken,
};
