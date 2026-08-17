"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = exports.runDailyJobs = exports.submitCheckInResponse = exports.getCheckInContext = exports.runSixMonthCheckIn = exports.runAdminDigest = exports.verifyCheckInToken = exports.createCheckInToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../../config"));
const user_model_1 = require("../User/user.model");
const Jobaplications_model_1 = require("../jobs/Jobaplications/Jobaplications.model");
const employerFollowup_model_1 = require("../EmployerFollowup/employerFollowup.model");
const settings_service_1 = require("../Settings/settings.service");
const settings_constant_1 = require("../Settings/settings.constant");
const cron_emails_1 = require("./cron.emails");
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
const createCheckInToken = (applicationId, expiresInDays) => jsonwebtoken_1.default.sign({ applicationId, aud: CHECKIN_AUDIENCE }, config_1.default.jwt_access_secret, {
    expiresIn: `${expiresInDays}d`,
});
exports.createCheckInToken = createCheckInToken;
/** Returns the application id, or null when the token is bad or expired. */
const verifyCheckInToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
        // An access token must not double as a check-in token, so the audience is
        // checked explicitly rather than assumed from a valid signature.
        if (decoded.aud !== CHECKIN_AUDIENCE || !decoded.applicationId)
            return null;
        return decoded.applicationId;
    }
    catch {
        return null;
    }
};
exports.verifyCheckInToken = verifyCheckInToken;
// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const describe = (app) => {
    const name = app.userId?.name || 'Unknown candidate';
    const company = app.jobId?.companyName || 'unknown employer';
    return `${name} — ${company}`;
};
/** Who the digest goes to: the configured list, or every staff account. */
const resolveDigestRecipients = async () => {
    const configured = await settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.NOTIFICATIONS_ADMIN_DIGEST_RECIPIENTS);
    const explicit = String(configured || '')
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.includes('@'));
    if (explicit.length > 0)
        return explicit;
    const staff = await user_model_1.User.find({
        role: { $in: ['ADMIN', 'HR'] },
        status: 'ACTIVE',
    })
        .select('email')
        .limit(25)
        .lean();
    return staff.map((member) => member.email).filter(Boolean);
};
const runAdminDigest = async () => {
    const enabled = await settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.NOTIFICATIONS_ADMIN_DAILY_DIGEST);
    if (!enabled) {
        return { job: 'admin-digest', skipped: 'disabled in settings' };
    }
    const now = new Date();
    const [dueCheckIns, missingJoiningDates, overdueActions] = await Promise.all([
        Jobaplications_model_1.JobApplication.find({
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
        Jobaplications_model_1.JobApplication.find({
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
        employerFollowup_model_1.EmployerFollowup.find({
            isNextActionDone: false,
            nextActionDate: { $lte: now },
            nextAction: { $exists: true, $ne: '' },
        })
            .limit(30)
            .lean(),
    ]);
    // A digest that arrives every morning saying "nothing to do" is a digest
    // people filter into a folder. Silence is the correct output for a quiet day.
    if (dueCheckIns.length === 0 &&
        missingJoiningDates.length === 0 &&
        overdueActions.length === 0) {
        return { job: 'admin-digest', skipped: 'nothing due today', processed: 0 };
    }
    const recipients = await resolveDigestRecipients();
    if (recipients.length === 0) {
        return { job: 'admin-digest', skipped: 'no recipients configured' };
    }
    await (0, cron_emails_1.sendAdminDigest)(recipients, {
        dueCheckIns: dueCheckIns.map(describe),
        missingJoiningDates: missingJoiningDates.map(describe),
        overdueEmployerActions: overdueActions.map((followup) => `${followup.companyNameSnapshot || 'Employer'} — ${followup.nextAction}`),
    });
    return {
        job: 'admin-digest',
        sent: recipients.length,
        processed: dueCheckIns.length + missingJoiningDates.length + overdueActions.length,
    };
};
exports.runAdminDigest = runAdminDigest;
// ─────────────────────────────────────────────────────────────────────────────
// JOB 2 - CANDIDATE SIX-MONTH CHECK-IN
// ─────────────────────────────────────────────────────────────────────────────
const runSixMonthCheckIn = async () => {
    const [enabled, expiryDays] = await Promise.all([
        settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.NOTIFICATIONS_SIX_MONTH_CHECKIN),
        settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.NOTIFICATIONS_SIX_MONTH_REMINDER_DAYS),
    ]);
    if (!enabled) {
        return { job: 'six-month-checkin', skipped: 'disabled in settings' };
    }
    const days = Number(expiryDays) || 30;
    const candidates = await Jobaplications_model_1.JobApplication.find({
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
    const errors = [];
    let sent = 0;
    for (const application of candidates) {
        const email = application.userId?.email;
        if (!email)
            continue;
        try {
            const token = (0, exports.createCheckInToken)(String(application._id), days);
            const checkInUrl = `${config_1.default.client_url}/placement-check-in?token=${token}`;
            await (0, cron_emails_1.sendSixMonthCheckIn)(email, {
                candidateName: application.userId?.name || 'there',
                companyName: application.jobId?.companyName || 'your employer',
                jobTitle: application.jobId?.title || 'your role',
                checkInUrl,
                expiresInDays: days,
            });
            // Stamped only after a successful send, so a failure is retried tomorrow
            // rather than silently marked as done.
            await Jobaplications_model_1.JobApplication.updateOne({ _id: application._id }, {
                $set: {
                    'placement.sixMonthEmailSentAt': new Date(),
                    'placement.sixMonthFollowUpStatus': 'Contacted',
                },
            });
            sent++;
        }
        catch (error) {
            errors.push(`${email}: ${error instanceof Error ? error.message : 'send failed'}`);
        }
    }
    return {
        job: 'six-month-checkin',
        processed: candidates.length,
        sent,
        ...(errors.length > 0 ? { errors } : {}),
    };
};
exports.runSixMonthCheckIn = runSixMonthCheckIn;
/** What the check-in page shows before the candidate answers. */
const getCheckInContext = async (token) => {
    const applicationId = (0, exports.verifyCheckInToken)(token);
    if (!applicationId)
        return null;
    const application = await Jobaplications_model_1.JobApplication.findById(applicationId)
        .populate([
        { path: 'jobId', select: 'title companyName' },
        { path: 'userId', select: 'name' },
    ])
        .lean();
    if (!application)
        return null;
    const placement = application.placement || {};
    return {
        candidateName: application.userId?.name || '',
        companyName: application.jobId?.companyName || '',
        jobTitle: application.jobId?.title || '',
        joiningDate: application.offerDetails?.joiningDate || null,
        /** True when they have already answered - the page says thank you instead. */
        alreadyAnswered: Boolean(placement.respondedAt),
        previousAnswer: placement.employmentStatus || null,
    };
};
exports.getCheckInContext = getCheckInContext;
/**
 * Record the candidate's own answer.
 *
 * Deliberately does NOT set `placement.verified`. Verified means the institute
 * confirmed the placement with the employer; a candidate saying so is useful
 * evidence but it is not that confirmation, and conflating the two would inflate
 * the verified placement figures.
 */
const submitCheckInResponse = async (token, answer, note) => {
    const applicationId = (0, exports.verifyCheckInToken)(token);
    if (!applicationId)
        return null;
    const isWorking = answer === 'working';
    const update = {
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
    const updated = await Jobaplications_model_1.JobApplication.findByIdAndUpdate(applicationId, { $set: update }, { new: true });
    return updated ? { ok: true, answer } : null;
};
exports.submitCheckInResponse = submitCheckInResponse;
// ─────────────────────────────────────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────────────────────────────────────
/** Everything the daily schedule should do, in order. */
const runDailyJobs = async () => {
    const results = [];
    // Sequential, and each wrapped: one job failing must not stop the other from
    // running, and the caller should see which one broke.
    for (const job of [exports.runSixMonthCheckIn, exports.runAdminDigest]) {
        try {
            results.push(await job());
        }
        catch (error) {
            results.push({
                job: job.name,
                errors: [error instanceof Error ? error.message : 'unknown error'],
            });
        }
    }
    return results;
};
exports.runDailyJobs = runDailyJobs;
exports.CronService = {
    runDailyJobs: exports.runDailyJobs,
    runAdminDigest: exports.runAdminDigest,
    runSixMonthCheckIn: exports.runSixMonthCheckIn,
    getCheckInContext: exports.getCheckInContext,
    submitCheckInResponse: exports.submitCheckInResponse,
    createCheckInToken: exports.createCheckInToken,
    verifyCheckInToken: exports.verifyCheckInToken,
};
//# sourceMappingURL=cron.service.js.map