"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingDefinition = exports.getSettingGroup = exports.SETTINGS_REGISTRY_MAP = exports.SETTINGS_REGISTRY = exports.SETTING_KEYS = void 0;
const settings_interface_1 = require("./settings.interface");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SETTINGS REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ADDING A NEW SETTING
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Add one entry to `SETTINGS_REGISTRY` below.
 * 2. Add its key to `SETTING_KEYS` so it can be referenced type-safely.
 * 3. Read it anywhere with `await SettingsService.get<boolean>(SETTING_KEYS.YOUR_KEY)`.
 *
 * That is the whole process. No model change, no migration, no new route.
 * Settings with no DB row automatically resolve to `defaultValue`, so a newly
 * added setting works on existing deployments without a backfill.
 *
 * KEY NAMING: `group.snake_case_name` - the group is the part before the first
 * dot and is what the resolved config object nests under:
 *
 *   {
 *     "resume":          { "approval_required": true },
 *     "job_application": { "approved_resume_required": true }
 *   }
 */
// ─────────────────────────────────────────────────────────────────────────────
// TYPE-SAFE KEY CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
exports.SETTING_KEYS = {
    // Resume
    RESUME_APPROVAL_REQUIRED: 'resume.approval_required',
    RESUME_ALLOW_EDIT_WHILE_PENDING: 'resume.allow_edit_while_pending',
    RESUME_AUTO_APPROVE_ON_RESUBMIT: 'resume.auto_approve_on_resubmit',
    RESUME_REAPPROVAL_REQUIRED: 'resume.reapproval_required',
    RESUME_MAJOR_CHANGE_THRESHOLD: 'resume.major_change_threshold',
    // Job application
    JOB_APPLICATION_APPROVED_RESUME_REQUIRED: 'job_application.approved_resume_required',
    // Registration
    REGISTRATION_STUDENT_ID_REQUIRED: 'registration.student_id_required',
    // Profile
    PROFILE_COMPLETENESS_ENABLED: 'profile.completeness_enabled',
    PROFILE_COMPLETENESS_READY_THRESHOLD: 'profile.completeness_ready_threshold',
    // Automated notifications
    NOTIFICATIONS_ADMIN_DAILY_DIGEST: 'notifications.admin_daily_digest',
    NOTIFICATIONS_ADMIN_DIGEST_RECIPIENTS: 'notifications.admin_digest_recipients',
    NOTIFICATIONS_SIX_MONTH_CHECKIN: 'notifications.six_month_checkin',
    NOTIFICATIONS_SIX_MONTH_REMINDER_DAYS: 'notifications.six_month_reminder_days',
};
// ─────────────────────────────────────────────────────────────────────────────
// THE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
exports.SETTINGS_REGISTRY = [
    // ═══════════════════════════════════════════════════════════════════════════
    // RESUME
    // ═══════════════════════════════════════════════════════════════════════════
    {
        key: exports.SETTING_KEYS.RESUME_APPROVAL_REQUIRED,
        groupLabel: 'Resume',
        label: 'Require resume approval',
        description: 'When enabled, resumes go through an admin review before they count as approved. When disabled, submitted resumes are approved automatically.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: true,
        isPublic: true,
        isEditable: true,
    },
    {
        key: exports.SETTING_KEYS.RESUME_REAPPROVAL_REQUIRED,
        groupLabel: 'Resume',
        label: 'Require approval after every edit',
        description: 'When enabled, every edit to an approved CV goes back for review. When disabled, small edits are accepted automatically and only a substantial rewrite (see the threshold below) needs approving again. Either way the CV stays usable while it waits - employers receive the last approved version.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: true,
        isPublic: true,
        isEditable: true,
    },
    {
        key: exports.SETTING_KEYS.RESUME_MAJOR_CHANGE_THRESHOLD,
        groupLabel: 'Resume',
        label: 'Re-approval threshold (% of fields changed)',
        description: 'Only applies when "Require approval after every edit" is off. Once this share of the CV has changed since it was last approved, it needs approving again. Measured field by field and counted against the last approved version, so many small edits still add up.',
        type: settings_interface_1.SETTING_VALUE_TYPES.NUMBER,
        defaultValue: 50,
        min: 1,
        max: 100,
        isPublic: true,
        isEditable: true,
    },
    {
        key: exports.SETTING_KEYS.RESUME_ALLOW_EDIT_WHILE_PENDING,
        groupLabel: 'Resume',
        label: 'Allow editing while pending review',
        description: 'When enabled, users can keep editing a resume that is already waiting for review. When disabled, they must withdraw it first.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: false,
        isPublic: true,
        isEditable: true,
    },
    {
        key: exports.SETTING_KEYS.RESUME_AUTO_APPROVE_ON_RESUBMIT,
        groupLabel: 'Resume',
        label: 'Auto-approve resubmissions',
        description: 'When enabled, a resume that was approved once before is auto-approved again on resubmission instead of returning to the review queue.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: false,
        isPublic: false,
        isEditable: true,
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // JOB APPLICATION
    // ═══════════════════════════════════════════════════════════════════════════
    {
        key: exports.SETTING_KEYS.JOB_APPLICATION_APPROVED_RESUME_REQUIRED,
        groupLabel: 'Job Application',
        label: 'Require an approved resume to apply',
        description: 'When enabled, a user must have at least one approved resume before they can apply for any job.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: false,
        isPublic: true,
        isEditable: true,
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════
    {
        key: exports.SETTING_KEYS.REGISTRATION_STUDENT_ID_REQUIRED,
        groupLabel: 'Registration',
        label: 'Require Student ID at registration',
        description: 'When enabled, new users must provide a CADD CORE Student ID to register. Each Student ID can only be used by one account, whether this is on or off. Existing accounts are never affected - this only gates new registrations.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: false,
        // Public so the registration form (which is unauthenticated) can render the
        // field. The server still enforces it independently - see User/studentId.ts.
        isPublic: true,
        isEditable: true,
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // PROFILE
    // ═══════════════════════════════════════════════════════════════════════════
    {
        key: exports.SETTING_KEYS.PROFILE_COMPLETENESS_ENABLED,
        groupLabel: 'Profile',
        label: 'Show the CV completeness bar',
        description: 'When enabled, candidates see a progress bar on their profile showing how complete their CV is and exactly which section to fill in next. Turning it off hides the bar; the percentage is still calculated and still used for reporting.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: true,
        isPublic: true,
        isEditable: true,
    },
    {
        key: exports.SETTING_KEYS.PROFILE_COMPLETENESS_READY_THRESHOLD,
        groupLabel: 'Profile',
        label: 'Job-ready threshold (% complete)',
        description: 'How complete a CV must be before the candidate counts as job-ready. This is the number behind the "Job-ready Students" figure on the dashboard and the Monthly KPI sheet, so changing it changes that count.',
        type: settings_interface_1.SETTING_VALUE_TYPES.NUMBER,
        defaultValue: 80,
        min: 10,
        max: 100,
        isPublic: true,
        isEditable: true,
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // AUTOMATED NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        key: exports.SETTING_KEYS.NOTIFICATIONS_ADMIN_DAILY_DIGEST,
        groupLabel: 'Automated Emails',
        label: 'Daily placement digest to admins',
        description: 'Emails staff once a day with the six-month follow-ups that are due, hires still missing a joining date, and employer follow-up actions past their date. Nothing is sent on a day when all three lists are empty.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: false,
        isPublic: false,
        isEditable: true,
    },
    {
        key: exports.SETTING_KEYS.NOTIFICATIONS_ADMIN_DIGEST_RECIPIENTS,
        groupLabel: 'Automated Emails',
        label: 'Digest recipients',
        description: 'Comma-separated email addresses to receive the daily digest. Leave empty to send it to every ADMIN and HR account instead.',
        type: settings_interface_1.SETTING_VALUE_TYPES.STRING,
        defaultValue: '',
        isPublic: false,
        isEditable: true,
    },
    {
        key: exports.SETTING_KEYS.NOTIFICATIONS_SIX_MONTH_CHECKIN,
        groupLabel: 'Automated Emails',
        label: 'Six-month check-in email to candidates',
        description: 'Six months after a candidate joins, emails them a one-click "are you still working there?" form. Their answer updates the placement record automatically, so nobody has to phone round. Each candidate is emailed once per placement.',
        type: settings_interface_1.SETTING_VALUE_TYPES.BOOLEAN,
        defaultValue: false,
        isPublic: false,
        isEditable: true,
    },
    {
        key: exports.SETTING_KEYS.NOTIFICATIONS_SIX_MONTH_REMINDER_DAYS,
        groupLabel: 'Automated Emails',
        label: 'Check-in link valid for (days)',
        description: 'How long the one-click check-in link keeps working after it is emailed. After this the candidate sees an expired notice and the follow-up goes back to being a phone call.',
        type: settings_interface_1.SETTING_VALUE_TYPES.NUMBER,
        defaultValue: 30,
        min: 3,
        max: 180,
        isPublic: false,
        isEditable: true,
    },
];
// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY LOOKUPS
// ─────────────────────────────────────────────────────────────────────────────
exports.SETTINGS_REGISTRY_MAP = new Map(exports.SETTINGS_REGISTRY.map((definition) => [definition.key, definition]));
/** The part of the key before the first dot, e.g. `resume` */
const getSettingGroup = (key) => key.split('.')[0] || 'general';
exports.getSettingGroup = getSettingGroup;
const getSettingDefinition = (key) => exports.SETTINGS_REGISTRY_MAP.get(key);
exports.getSettingDefinition = getSettingDefinition;
//# sourceMappingURL=settings.constant.js.map