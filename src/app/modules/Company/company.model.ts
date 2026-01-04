/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Mongoose model for Company with all schemas and static methods.
 */

import { Schema, model } from 'mongoose';
import { ICompany, ICompanyModel, IApprovalHistory, IContactPerson, ICompanySocialLinks } from './company.interface';
import { COMPANY_STATUS, COMPANY_SIZE, INDUSTRY_TYPES } from './company.constant';

// ─────────────────────────────────────────────────────────────────────────────
// SUB-SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const socialLinksSchema = new Schema<ICompanySocialLinks>(
  {
    linkedin: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    youtube: { type: String },
  },
  { _id: false }
);

const contactPersonSchema = new Schema<IContactPerson>(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false }
);

const approvalHistorySchema = new Schema<IApprovalHistory>(
  {
    status: {
      type: String,
      enum: Object.keys(COMPANY_STATUS),
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    reason: { type: String },
    notes: { type: String },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPANY SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const companySchema = new Schema<ICompany, ICompanyModel>(
  {
    // ═══════════════════════════════════════════════════════════════════════════
    // OWNERSHIP & USER REFERENCE
    // ═══════════════════════════════════════════════════════════════════════════
    // NOTE: Company name, email, phone come from populated User model
    // User.name = Company Name
    // User.email = Company Email
    // User.mobileNumber = Company Phone
    // User.profilePhoto = Company Logo (or use logo field below)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    
    // Slug for URL (auto-generated from User.name)
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // REGISTRATION & LEGAL
    // ═══════════════════════════════════════════════════════════════════════════
    registrationNumber: { type: String, trim: true },
    taxId: { type: String, trim: true },

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPANY DETAILS
    // ═══════════════════════════════════════════════════════════════════════════
    description: {
      type: String,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      enum: {
        values: INDUSTRY_TYPES,
        message: 'Invalid industry type',
      },
    },
    companySize: {
      type: String,
      required: [true, 'Company size is required'],
      enum: {
        values: Object.values(COMPANY_SIZE),
        message: 'Invalid company size',
      },
    },
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year must be after 1800'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
    },
    website: { type: String, trim: true },

    // ═══════════════════════════════════════════════════════════════════════════
    // BRANDING
    // ═══════════════════════════════════════════════════════════════════════════
    logo: { type: String },
    coverImage: { type: String },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LOCATION
    // ═══════════════════════════════════════════════════════════════════════════
    address: { type: String, trim: true },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: { type: String, trim: true },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    postalCode: { type: String, trim: true },

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTACT PERSON
    // ═══════════════════════════════════════════════════════════════════════════
    contactPerson: contactPersonSchema,

    // ═══════════════════════════════════════════════════════════════════════════
    // SOCIAL LINKS
    // ═══════════════════════════════════════════════════════════════════════════
    socialLinks: socialLinksSchema,

    // ═══════════════════════════════════════════════════════════════════════════
    // APPROVAL STATUS
    // ═══════════════════════════════════════════════════════════════════════════
    status: {
      type: String,
      enum: Object.keys(COMPANY_STATUS),
      default: COMPANY_STATUS.PENDING,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    approvalHistory: [approvalHistorySchema],

    // ═══════════════════════════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════════════════════════
    totalJobsPosted: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    totalApplicationsReceived: { type: Number, default: 0 },

    // ═══════════════════════════════════════════════════════════════════════════
    // SETTINGS & FLAGS
    // ═══════════════════════════════════════════════════════════════════════════
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date },
    jobPostLimit: { type: Number, default: 5 }, // Free tier: 5 jobs

    // ═══════════════════════════════════════════════════════════════════════════
    // DOCUMENTS
    // ═══════════════════════════════════════════════════════════════════════════
    tradeLicenseUrl: { type: String },
    taxCertificateUrl: { type: String },
    otherDocuments: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: Record<string, unknown>) {
        delete ret['__v'];
        return ret;
      },
    },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

companySchema.index({ slug: 1 });
companySchema.index({ email: 1 });
companySchema.index({ userId: 1 });
companySchema.index({ status: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ city: 1, country: 1 });
companySchema.index({ createdAt: -1 });
companySchema.index({ description: 'text' });

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE MIDDLEWARE - Slug is now generated from User.name in service
// ─────────────────────────────────────────────────────────────────────────────

// No pre-save hook needed - slug is set during registration from User.name

// ─────────────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────────────

companySchema.statics.isCompanyExistsBySlug = async function (
  slug: string
): Promise<ICompany | null> {
  return await Company.findOne({ slug });
};

companySchema.statics.isCompanyExistsByUserId = async function (
  userId: string
): Promise<ICompany | null> {
  return await Company.findOne({ userId });
};

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL FIELDS
// ─────────────────────────────────────────────────────────────────────────────

companySchema.virtual('isApproved').get(function () {
  return this.status === COMPANY_STATUS.APPROVED;
});

companySchema.virtual('canPostJobs').get(function () {
  return (
    this.status === COMPANY_STATUS.APPROVED &&
    (this.activeJobs || 0) < (this.jobPostLimit || 5)
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────────────────────────────────────────────

export const Company = model<ICompany, ICompanyModel>('Company', companySchema);
