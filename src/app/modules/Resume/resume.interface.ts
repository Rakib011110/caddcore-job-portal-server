import { Document, Model, Types } from 'mongoose';
import {
  IAward,
  ICertification,
  IEducation,
  ILanguage,
  IProject,
  IReference,
  ISkill,
  ISocialLinks,
  IWorkExperience,
} from '../User/user.interface';
import { TResumeReviewAction, TResumeStatus } from './resume.constant';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A resume is a standalone, reviewable document. A user can keep several of
 * them (e.g. one tailored per role) and each carries its own approval state,
 * which is why job-application eligibility is "at least one APPROVED resume".
 *
 * The CV section shapes are reused from the User profile so a resume can be
 * pre-filled straight from the profile the CV Builder already maintains.
 */

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW HISTORY
// ─────────────────────────────────────────────────────────────────────────────

export interface IResumeReviewEntry {
  action: TResumeReviewAction;
  /** Status the resume ended up in after this action */
  status: TResumeStatus;
  actorId?: Types.ObjectId | string;
  actorRole?: string;
  /** Reviewer feedback / rejection reason / user note */
  feedback?: string;
  /** Submission number this entry belongs to */
  version: number;
  at: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// CADD CORE CREDENTIALS
// ─────────────────────────────────────────────────────────────────────────────

/** One CADD CORE course the candidate says they completed. */
export interface ICaddcoreCourseClaim {
  courseId: string;
  courseName: string;
  completionDate?: Date | string;
  certificateUrl?: string;
}

/**
 * The candidate's CADD CORE credentials, carried ON the CV.
 *
 * These used to live in a separate VerificationRequest with its own page, its
 * own form and its own approval queue - so a student had to be approved twice,
 * once for their CV and once to prove they studied here. The two reviews always
 * looked at the same person and happened at the same time, so they are now one:
 * the reviewer reads the CV, sees the credentials attached to it, and approving
 * the CV grants the badge.
 *
 * `isCaddcoreStudent` is the whole gate. Left false the section is skipped, the
 * CV is reviewed on its own merits and no badge is granted - which is what makes
 * the portal usable by candidates who never studied here.
 */
export interface ICaddcoreCredentials {
  /** Candidate's own claim that they studied at CADD CORE. */
  isCaddcoreStudent?: boolean;
  studentId?: string;
  batchNo?: string;
  enrollmentYear?: number;
  courses?: ICaddcoreCourseClaim[];

  hasOnJobTraining?: boolean;
  onJobTrainingDetails?: {
    companyName?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    supervisorName?: string;
    certificateUrl?: string;
    description?: string;
  };

  hasInternship?: boolean;
  internshipDetails?: {
    companyName?: string;
    position?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    certificateUrl?: string;
    description?: string;
  };

  /** Certificates and letters backing the claims above. */
  proofDocuments?: string[];
  /** Anything the candidate wants the reviewer to know. */
  candidateNotes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUME CONTENT
// ─────────────────────────────────────────────────────────────────────────────

export interface IResumeContent {
  /** CADD CORE credentials - see ICaddcoreCredentials. */
  caddcoreCredentials?: ICaddcoreCredentials;

  // Contact block
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  profilePhoto?: string;

  // Professional summary
  headline?: string;
  summary?: string;
  currentJobTitle?: string;
  totalExperienceYears?: number;
  expectedSalary?: number;

  // CV sections
  education?: IEducation[];
  workExperience?: IWorkExperience[];
  skills?: ISkill[];
  certifications?: ICertification[];
  languages?: ILanguage[];
  projects?: IProject[];
  awards?: IAward[];
  references?: IReference[];
  socialLinks?: ISocialLinks;

  /** Optional uploaded PDF/DOC that replaces or supplements the built resume */
  fileUrl?: string;

  /** Template used when rendering/exporting */
  template?: string;

  /**
   * Section order for the `custom` template.
   *
   * Ignored by every other template, which own their layout. Stored on the
   * resume rather than held in the preview so the order the candidate chose is
   * the order the reviewer approves and the employer receives.
   */
  sectionOrder?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUME
// ─────────────────────────────────────────────────────────────────────────────

export interface IResume extends IResumeContent {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;

  /** User-facing label, e.g. "Structural Engineer - 2026" */
  title: string;

  status: TResumeStatus;

  /** The resume used by default when applying for jobs */
  isDefault: boolean;

  /** Increments on every submission for review */
  version: number;

  // Review lifecycle
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId | string;
  /** Feedback shown to the user when rejected */
  rejectionReason?: string;
  /** Internal reviewer note, also surfaced on approval */
  reviewerNotes?: string;
  /** Note the user attaches when submitting */
  submissionNote?: string;

  /** True once the resume has been approved at least once */
  hasBeenApproved: boolean;

  // ───────────────────────────────────────────────────────────────────────────
  // RE-APPROVAL
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * The content exactly as a reviewer last approved it.
   *
   * Serves two jobs at once: it is the baseline the change percentage is
   * measured against, and it is what employers receive while newer edits are
   * still waiting for review. Without it, "how much has changed since
   * approval?" has nothing to compare to and an unreviewed rewrite would reach
   * employers the moment it was typed.
   */
  approvedContent?: IResumeContent;

  /** Submission number that produced `approvedContent` */
  approvedVersion?: number;

  /**
   * The CV is approved and usable, but carries edits a reviewer has not seen.
   *
   * Deliberately separate from `status`: the candidate keeps their approved
   * standing (and can keep applying) while the newer draft waits its turn.
   */
  pendingReapproval: boolean;

  /** Share of fields differing from `approvedContent`, 0-100 */
  changeSinceApproval?: number;

  reviewHistory: IResumeReviewEntry[];

  // Soft delete
  isDeleted: boolean;
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResumeDocument extends Omit<IResume, '_id'>, Document {}

export type IResumeModel = Model<IResumeDocument>;

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOADS
// ─────────────────────────────────────────────────────────────────────────────

export interface ICreateResumePayload extends IResumeContent {
  title?: string;
  isDefault?: boolean;
  /** Pre-fill every empty content field from the user's profile CV */
  fromProfile?: boolean;
}

export interface IUpdateResumePayload extends IResumeContent {
  title?: string;
  isDefault?: boolean;
}

export interface ISubmitResumePayload {
  submissionNote?: string;
}

export interface IApproveResumePayload {
  reviewerNotes?: string;
  /**
   * Badge to grant, overriding the tier derived from the credentials.
   *
   * Omit to accept the suggestion. `'none'` approves the CV while granting no
   * badge - the case where a reviewer believes the CV but not the CADD CORE
   * claims attached to it.
   */
  badgeOverride?: 'bronze' | 'silver' | 'gold' | 'none';
}

export interface IRejectResumePayload {
  /** Optional per the spec - reviewers may reject without writing feedback */
  rejectionReason?: string;
  reviewerNotes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY FILTERS
// ─────────────────────────────────────────────────────────────────────────────

export interface IResumeFilters {
  status?: TResumeStatus | 'all';
  userId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIGIBILITY (drives the "can this user apply?" gate)
// ─────────────────────────────────────────────────────────────────────────────

export interface IResumeEligibility {
  /** `resume.approval_required` - is the review workflow switched on at all */
  approvalRequired: boolean;
  /** `job_application.approved_resume_required` - is applying gated */
  approvedResumeRequired: boolean;
  hasApprovedResume: boolean;
  canApply: boolean;
  /** Why the user cannot apply, ready to show in the UI */
  reason?: string;
  counts: Record<TResumeStatus, number> & { total: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN STATS
// ─────────────────────────────────────────────────────────────────────────────

export interface IResumeStats {
  total: number;
  draft: number;
  pending_review: number;
  approved: number;
  rejected: number;
  /** Resumes waiting longer than 3 days */
  staleReviews: number;
  /** Approved CVs edited enough to need reviewing again */
  awaitingReapproval: number;
}
