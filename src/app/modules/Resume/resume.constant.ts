/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// STATUSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resume lifecycle:
 *
 *   draft ──submit──> pending_review ──approve──> approved
 *     ▲                     │
 *     │                     └──reject──> rejected ──edit + submit──> pending_review
 *     │                     │
 *     └──withdraw───────────┘
 *
 * Editing an approved resume returns it to `draft`, because approval applies to
 * the reviewed content and stale approvals should not survive a rewrite.
 */
export const RESUME_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type TResumeStatus = (typeof RESUME_STATUS)[keyof typeof RESUME_STATUS];

export const RESUME_STATUS_VALUES = Object.values(RESUME_STATUS);

/** Statuses a user may submit for review from */
export const SUBMITTABLE_STATUSES: TResumeStatus[] = [
  RESUME_STATUS.DRAFT,
  RESUME_STATUS.REJECTED,
];

/** Human readable labels (shared with emails/notifications) */
export const RESUME_STATUS_LABELS: Record<TResumeStatus, string> = {
  [RESUME_STATUS.DRAFT]: 'Draft',
  [RESUME_STATUS.PENDING_REVIEW]: 'Pending Approval',
  [RESUME_STATUS.APPROVED]: 'Approved',
  [RESUME_STATUS.REJECTED]: 'Rejected',
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW HISTORY ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const RESUME_REVIEW_ACTION = {
  CREATED: 'created',
  UPDATED: 'updated',
  SUBMITTED: 'submitted',
  WITHDRAWN: 'withdrawn',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  AUTO_APPROVED: 'auto_approved',
} as const;

export type TResumeReviewAction =
  (typeof RESUME_REVIEW_ACTION)[keyof typeof RESUME_REVIEW_ACTION];

export const RESUME_REVIEW_ACTION_VALUES = Object.values(RESUME_REVIEW_ACTION);

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────────────────────────────────────

export const ResumeSearchableFields = ['title', 'headline', 'summary'];

/**
 * Fields that count as resume CONTENT. Editing any of these invalidates a prior
 * approval; editing anything else (title, isDefault) does not.
 */
export const RESUME_CONTENT_FIELDS = [
  'fullName',
  'email',
  'phone',
  'address',
  'city',
  'country',
  'profilePhoto',
  'headline',
  'summary',
  'currentJobTitle',
  'totalExperienceYears',
  'expectedSalary',
  'education',
  'workExperience',
  'skills',
  'certifications',
  'languages',
  'projects',
  'awards',
  'references',
  'socialLinks',
  'fileUrl',
  'template',
  'sectionOrder',
] as const;
