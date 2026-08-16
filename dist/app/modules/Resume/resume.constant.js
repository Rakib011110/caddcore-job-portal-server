"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESUME_CONTENT_FIELDS = exports.ResumeSearchableFields = exports.RESUME_REVIEW_ACTION_VALUES = exports.RESUME_REVIEW_ACTION = exports.RESUME_STATUS_LABELS = exports.SUBMITTABLE_STATUSES = exports.RESUME_STATUS_VALUES = exports.RESUME_STATUS = void 0;
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
exports.RESUME_STATUS = {
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
exports.RESUME_STATUS_VALUES = Object.values(exports.RESUME_STATUS);
/** Statuses a user may submit for review from */
exports.SUBMITTABLE_STATUSES = [
    exports.RESUME_STATUS.DRAFT,
    exports.RESUME_STATUS.REJECTED,
];
/** Human readable labels (shared with emails/notifications) */
exports.RESUME_STATUS_LABELS = {
    [exports.RESUME_STATUS.DRAFT]: 'Draft',
    [exports.RESUME_STATUS.PENDING_REVIEW]: 'Pending Approval',
    [exports.RESUME_STATUS.APPROVED]: 'Approved',
    [exports.RESUME_STATUS.REJECTED]: 'Rejected',
};
// ─────────────────────────────────────────────────────────────────────────────
// REVIEW HISTORY ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
exports.RESUME_REVIEW_ACTION = {
    CREATED: 'created',
    UPDATED: 'updated',
    SUBMITTED: 'submitted',
    WITHDRAWN: 'withdrawn',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    AUTO_APPROVED: 'auto_approved',
};
exports.RESUME_REVIEW_ACTION_VALUES = Object.values(exports.RESUME_REVIEW_ACTION);
// ─────────────────────────────────────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────────────────────────────────────
exports.ResumeSearchableFields = ['title', 'headline', 'summary'];
/**
 * Fields that count as resume CONTENT. Editing any of these invalidates a prior
 * approval; editing anything else (title, isDefault) does not.
 */
exports.RESUME_CONTENT_FIELDS = [
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
];
//# sourceMappingURL=resume.constant.js.map