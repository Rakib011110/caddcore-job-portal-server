import { Schema, model } from 'mongoose';
import {
  IVerificationRequestDocument,
  IVerificationRequestModel,
} from './verification.interface';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VERIFICATION REQUEST MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// COURSE CLAIMED SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const courseClaimedSchema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    certificateUrl: String,
    completionDate: Date,
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// ON-JOB TRAINING DETAILS SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const onJobTrainingDetailsSchema = new Schema(
  {
    startDate: Date,
    endDate: Date,
    companyName: String,
    supervisorName: String,
    certificateUrl: String,
    description: String,
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// INTERNSHIP DETAILS SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const internshipDetailsSchema = new Schema(
  {
    startDate: Date,
    endDate: Date,
    companyName: String,
    position: String,
    certificateUrl: String,
    description: String,
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION REQUEST SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const verificationRequestSchema = new Schema<IVerificationRequestDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Application Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // User Submitted Info
    studentId: {
      type: String,
      trim: true,
    },
    batchNo: {
      type: String,
      required: true,
      trim: true,
    },
    enrollmentYear: {
      type: Number,
      required: true,
    },
    
    // Courses Claimed
    coursesClaimed: {
      type: [courseClaimedSchema],
      required: true,
      validate: {
        validator: function(courses: any[]) {
          return courses && courses.length > 0;
        },
        message: 'At least one course must be claimed',
      },
    },
    
    // Training Claimed
    claimsOnJobTraining: {
      type: Boolean,
      default: false,
    },
    onJobTrainingDetails: onJobTrainingDetailsSchema,
    
    // Internship Claimed
    claimsInternship: {
      type: Boolean,
      default: false,
    },
    internshipDetails: internshipDetailsSchema,
    
    // Additional Documents & Notes
    proofDocuments: [String],
    userNotes: {
      type: String,
      maxlength: 1000,
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    
    // Admin Decision
    approvedBadgeType: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
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

// Compound index for user's requests
verificationRequestSchema.index({ userId: 1, status: 1 });

// Index for admin queries
verificationRequestSchema.index({ status: 1, appliedAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────────────

verificationRequestSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

verificationRequestSchema.virtual('processedByUser', {
  ref: 'User',
  localField: 'processedBy',
  foreignField: '_id',
  justOne: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────────────────────────────────────────────

export const VerificationRequest = model<
  IVerificationRequestDocument,
  IVerificationRequestModel
>('VerificationRequest', verificationRequestSchema);
