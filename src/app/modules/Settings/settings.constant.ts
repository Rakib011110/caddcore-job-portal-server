import { ISettingDefinition, SETTING_VALUE_TYPES } from './settings.interface';

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

export const SETTING_KEYS = {
  // Resume
  RESUME_APPROVAL_REQUIRED: 'resume.approval_required',
  RESUME_ALLOW_EDIT_WHILE_PENDING: 'resume.allow_edit_while_pending',
  RESUME_AUTO_APPROVE_ON_RESUBMIT: 'resume.auto_approve_on_resubmit',
  RESUME_REAPPROVAL_REQUIRED: 'resume.reapproval_required',
  RESUME_MAJOR_CHANGE_THRESHOLD: 'resume.major_change_threshold',

  // Job application
  JOB_APPLICATION_APPROVED_RESUME_REQUIRED:
    'job_application.approved_resume_required',

  // Registration
  REGISTRATION_STUDENT_ID_REQUIRED: 'registration.student_id_required',
} as const;

export type TSettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

// ─────────────────────────────────────────────────────────────────────────────
// THE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const SETTINGS_REGISTRY: ISettingDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // RESUME
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: SETTING_KEYS.RESUME_APPROVAL_REQUIRED,
    groupLabel: 'Resume',
    label: 'Require resume approval',
    description:
      'When enabled, resumes go through an admin review before they count as approved. When disabled, submitted resumes are approved automatically.',
    type: SETTING_VALUE_TYPES.BOOLEAN,
    defaultValue: true,
    isPublic: true,
    isEditable: true,
  },
  {
    key: SETTING_KEYS.RESUME_REAPPROVAL_REQUIRED,
    groupLabel: 'Resume',
    label: 'Require approval after every edit',
    description:
      'When enabled, every edit to an approved CV goes back for review. When disabled, small edits are accepted automatically and only a substantial rewrite (see the threshold below) needs approving again. Either way the CV stays usable while it waits - employers receive the last approved version.',
    type: SETTING_VALUE_TYPES.BOOLEAN,
    defaultValue: true,
    isPublic: true,
    isEditable: true,
  },
  {
    key: SETTING_KEYS.RESUME_MAJOR_CHANGE_THRESHOLD,
    groupLabel: 'Resume',
    label: 'Re-approval threshold (% of fields changed)',
    description:
      'Only applies when "Require approval after every edit" is off. Once this share of the CV has changed since it was last approved, it needs approving again. Measured field by field and counted against the last approved version, so many small edits still add up.',
    type: SETTING_VALUE_TYPES.NUMBER,
    defaultValue: 50,
    min: 1,
    max: 100,
    isPublic: true,
    isEditable: true,
  },
  {
    key: SETTING_KEYS.RESUME_ALLOW_EDIT_WHILE_PENDING,
    groupLabel: 'Resume',
    label: 'Allow editing while pending review',
    description:
      'When enabled, users can keep editing a resume that is already waiting for review. When disabled, they must withdraw it first.',
    type: SETTING_VALUE_TYPES.BOOLEAN,
    defaultValue: false,
    isPublic: true,
    isEditable: true,
  },
  {
    key: SETTING_KEYS.RESUME_AUTO_APPROVE_ON_RESUBMIT,
    groupLabel: 'Resume',
    label: 'Auto-approve resubmissions',
    description:
      'When enabled, a resume that was approved once before is auto-approved again on resubmission instead of returning to the review queue.',
    type: SETTING_VALUE_TYPES.BOOLEAN,
    defaultValue: false,
    isPublic: false,
    isEditable: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JOB APPLICATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: SETTING_KEYS.JOB_APPLICATION_APPROVED_RESUME_REQUIRED,
    groupLabel: 'Job Application',
    label: 'Require an approved resume to apply',
    description:
      'When enabled, a user must have at least one approved resume before they can apply for any job.',
    type: SETTING_VALUE_TYPES.BOOLEAN,
    defaultValue: false,
    isPublic: true,
    isEditable: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: SETTING_KEYS.REGISTRATION_STUDENT_ID_REQUIRED,
    groupLabel: 'Registration',
    label: 'Require Student ID at registration',
    description:
      'When enabled, new users must provide a CADD CORE Student ID to register. Each Student ID can only be used by one account, whether this is on or off. Existing accounts are never affected - this only gates new registrations.',
    type: SETTING_VALUE_TYPES.BOOLEAN,
    defaultValue: false,
    // Public so the registration form (which is unauthenticated) can render the
    // field. The server still enforces it independently - see User/studentId.ts.
    isPublic: true,
    isEditable: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY LOOKUPS
// ─────────────────────────────────────────────────────────────────────────────

export const SETTINGS_REGISTRY_MAP: ReadonlyMap<string, ISettingDefinition> =
  new Map(SETTINGS_REGISTRY.map((definition) => [definition.key, definition]));

/** The part of the key before the first dot, e.g. `resume` */
export const getSettingGroup = (key: string): string => key.split('.')[0] || 'general';

export const getSettingDefinition = (
  key: string
): ISettingDefinition | undefined => SETTINGS_REGISTRY_MAP.get(key);
