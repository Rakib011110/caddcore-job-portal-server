import { Schema, model } from 'mongoose';
import { IResumeDocument, IResumeModel } from './resume.interface';
import {
  RESUME_REVIEW_ACTION_VALUES,
  RESUME_STATUS,
  RESUME_STATUS_VALUES,
} from './resume.constant';
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_TEMPLATE_IDS,
} from './resume.templates';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sub-document fields mirror the User CV sub-schemas but are deliberately NOT
 * `required`: a draft resume must be saveable half-finished. Completeness is
 * enforced at submit time instead (see `assertSubmittable` in resume.service).
 */

// ─────────────────────────────────────────────────────────────────────────────
// CV SUB-SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const educationSchema = new Schema(
  {
    degreeType: { type: String },
    degreeName: { type: String },
    institutionName: { type: String },
    location: { type: String },
    startYear: { type: Number },
    endYear: { type: Number },
    isCurrentlyStudying: { type: Boolean, default: false },
    grade: { type: String },
    description: { type: String },
  },
  { _id: true }
);

const workExperienceSchema = new Schema(
  {
    jobTitle: { type: String },
    companyName: { type: String },
    companyLocation: { type: String },
    employmentType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'],
    },
    startDate: { type: String },
    endDate: { type: String },
    isCurrentJob: { type: Boolean, default: false },
    responsibilities: [{ type: String }],
    achievements: [{ type: String }],
    description: { type: String },
  },
  { _id: true }
);

const certificationSchema = new Schema(
  {
    name: { type: String },
    issuingOrganization: { type: String },
    issueDate: { type: String },
    expiryDate: { type: String },
    credentialId: { type: String },
    credentialUrl: { type: String },
    description: { type: String },
  },
  { _id: true }
);

const skillSchema = new Schema(
  {
    name: { type: String },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    },
    yearsOfExperience: { type: Number },
    category: { type: String },
  },
  { _id: true }
);

const languageSchema = new Schema(
  {
    name: { type: String },
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Proficient', 'Fluent', 'Native'],
    },
  },
  { _id: true }
);

const projectSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    role: { type: String },
    technologies: [{ type: String }],
    projectUrl: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    highlights: [{ type: String }],
  },
  { _id: true }
);

const awardSchema = new Schema(
  {
    title: { type: String },
    issuer: { type: String },
    date: { type: String },
    description: { type: String },
  },
  { _id: true }
);

const referenceSchema = new Schema(
  {
    name: { type: String },
    position: { type: String },
    company: { type: String },
    email: { type: String },
    phone: { type: String },
    relationship: { type: String },
  },
  { _id: true }
);

const socialLinksSchema = new Schema(
  {
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    twitter: { type: String },
    website: { type: String },
    other: [{ name: String, url: String }],
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// CADD CORE CREDENTIALS SUB-SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The candidate's CADD CORE credentials, attached to the CV.
 *
 * Replaces the standalone verification form: the reviewer approves the CV and
 * grants the badge in one action, instead of the same student being approved
 * twice for the same facts. `isCaddcoreStudent` gates the whole block, so a
 * candidate who never studied here simply leaves it off and still gets a CV.
 */
const caddcoreCourseClaimSchema = new Schema(
  {
    courseId: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    completionDate: { type: Date },
    certificateUrl: { type: String, trim: true },
  },
  { _id: false }
);

const caddcoreCredentialsSchema = new Schema(
  {
    isCaddcoreStudent: { type: Boolean, default: false },
    studentId: { type: String, trim: true, uppercase: true },
    batchNo: { type: String, trim: true },
    enrollmentYear: { type: Number },
    courses: { type: [caddcoreCourseClaimSchema], default: [] },

    hasOnJobTraining: { type: Boolean, default: false },
    onJobTrainingDetails: {
      companyName: { type: String, trim: true },
      startDate: { type: Date },
      endDate: { type: Date },
      supervisorName: { type: String, trim: true },
      certificateUrl: { type: String, trim: true },
      description: { type: String, maxlength: 1000 },
    },

    hasInternship: { type: Boolean, default: false },
    internshipDetails: {
      companyName: { type: String, trim: true },
      position: { type: String, trim: true },
      startDate: { type: Date },
      endDate: { type: Date },
      certificateUrl: { type: String, trim: true },
      description: { type: String, maxlength: 1000 },
    },

    proofDocuments: { type: [String], default: [] },
    candidateNotes: { type: String, maxlength: 1000 },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW HISTORY SUB-SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const reviewEntrySchema = new Schema(
  {
    action: {
      type: String,
      enum: RESUME_REVIEW_ACTION_VALUES,
      required: true,
    },
    status: {
      type: String,
      enum: RESUME_STATUS_VALUES,
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String },
    feedback: { type: String, maxlength: 2000 },
    version: { type: Number, default: 1 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// RESUME SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const resumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: 'My Resume',
    },

    status: {
      type: String,
      enum: RESUME_STATUS_VALUES,
      default: RESUME_STATUS.DRAFT,
      index: true,
    },

    isDefault: { type: Boolean, default: false },

    version: { type: Number, default: 0 },

    // ═══════════════════════════════════════════════════════════════════════
    // CONTACT BLOCK
    // ═══════════════════════════════════════════════════════════════════════
    fullName: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    profilePhoto: { type: String },

    // ═══════════════════════════════════════════════════════════════════════
    // PROFESSIONAL SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    headline: { type: String, maxlength: 200 },
    summary: { type: String, maxlength: 3000 },
    currentJobTitle: { type: String },
    totalExperienceYears: { type: Number, min: 0 },
    expectedSalary: { type: Number, min: 0 },

    // ═══════════════════════════════════════════════════════════════════════
    // CV SECTIONS
    // ═══════════════════════════════════════════════════════════════════════
    education: { type: [educationSchema], default: [] },
    workExperience: { type: [workExperienceSchema], default: [] },
    skills: { type: [skillSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    languages: { type: [languageSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    awards: { type: [awardSchema], default: [] },
    references: { type: [referenceSchema], default: [] },
    socialLinks: { type: socialLinksSchema, default: {} },

    /** CADD CORE credentials - drives the badge granted on approval. */
    caddcoreCredentials: { type: caddcoreCredentialsSchema, default: () => ({}) },

    fileUrl: { type: String },
    /**
     * The CV format. Listed in `RESUME_CONTENT_FIELDS`, so changing it sends an
     * approved resume back to draft - the reviewer approved a layout as much as
     * a set of facts, and the employer receives that same layout.
     */
    template: {
      type: String,
      enum: RESUME_TEMPLATE_IDS,
      default: DEFAULT_RESUME_TEMPLATE_ID,
    },
    /** Section order for the `custom` template; ignored by the others */
    sectionOrder: { type: [String], default: undefined },

    // ═══════════════════════════════════════════════════════════════════════
    // REVIEW LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, maxlength: 2000 },
    reviewerNotes: { type: String, maxlength: 2000 },
    submissionNote: { type: String, maxlength: 1000 },

    hasBeenApproved: { type: Boolean, default: false },

    // ═══════════════════════════════════════════════════════════════════════
    // RE-APPROVAL
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Frozen copy of the content a reviewer last approved. `Mixed` because it
     * mirrors the whole content shape and duplicating every sub-schema here
     * would just be a second place to forget a field.
     */
    approvedContent: { type: Schema.Types.Mixed, default: undefined },
    approvedVersion: { type: Number },
    /** Approved and usable, but holding edits a reviewer has not seen yet */
    pendingReapproval: { type: Boolean, default: false },
    /** Share of fields differing from `approvedContent`, 0-100 */
    changeSinceApproval: { type: Number, default: 0 },

    reviewHistory: { type: [reviewEntrySchema], default: [] },

    // ═══════════════════════════════════════════════════════════════════════
    // SOFT DELETE
    // ═══════════════════════════════════════════════════════════════════════
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

// "Does this user have an approved resume?" - the job-application gate
resumeSchema.index({ userId: 1, status: 1, isDeleted: 1 });

// Admin review queue, oldest submission first
resumeSchema.index({ status: 1, submittedAt: 1 });

// User's resume list
resumeSchema.index({ userId: 1, isDeleted: 1, updatedAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────────────

resumeSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

resumeSchema.virtual('reviewer', {
  ref: 'User',
  localField: 'reviewedBy',
  foreignField: '_id',
  justOne: true,
});

export const Resume = model<IResumeDocument, IResumeModel>(
  'Resume',
  resumeSchema
);
