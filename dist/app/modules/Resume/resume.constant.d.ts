/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
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
export declare const RESUME_STATUS: {
    readonly DRAFT: "draft";
    readonly PENDING_REVIEW: "pending_review";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
};
export type TResumeStatus = (typeof RESUME_STATUS)[keyof typeof RESUME_STATUS];
export declare const RESUME_STATUS_VALUES: ("approved" | "rejected" | "draft" | "pending_review")[];
/** Statuses a user may submit for review from */
export declare const SUBMITTABLE_STATUSES: TResumeStatus[];
/** Human readable labels (shared with emails/notifications) */
export declare const RESUME_STATUS_LABELS: Record<TResumeStatus, string>;
export declare const RESUME_REVIEW_ACTION: {
    readonly CREATED: "created";
    readonly UPDATED: "updated";
    readonly SUBMITTED: "submitted";
    readonly WITHDRAWN: "withdrawn";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
    readonly AUTO_APPROVED: "auto_approved";
};
export type TResumeReviewAction = (typeof RESUME_REVIEW_ACTION)[keyof typeof RESUME_REVIEW_ACTION];
export declare const RESUME_REVIEW_ACTION_VALUES: ("approved" | "rejected" | "created" | "updated" | "submitted" | "withdrawn" | "auto_approved")[];
export declare const ResumeSearchableFields: string[];
/**
 * Fields that count as resume CONTENT. Editing any of these invalidates a prior
 * approval; editing anything else (title, isDefault) does not.
 */
export declare const RESUME_CONTENT_FIELDS: readonly ["fullName", "email", "phone", "address", "city", "country", "profilePhoto", "headline", "summary", "currentJobTitle", "totalExperienceYears", "expectedSalary", "education", "workExperience", "skills", "certifications", "languages", "projects", "awards", "references", "socialLinks", "fileUrl", "template", "sectionOrder"];
//# sourceMappingURL=resume.constant.d.ts.map