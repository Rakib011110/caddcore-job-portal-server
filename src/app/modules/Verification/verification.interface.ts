import { Types, Model, Document } from 'mongoose';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CADDCORE VERIFICATION INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// BADGE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type BadgeType = 'bronze' | 'silver' | 'gold' | 'platinum';
export type VerificationStatus = 'not_applied' | 'pending' | 'approved' | 'rejected';

// ─────────────────────────────────────────────────────────────────────────────
// COURSE CLAIMED BY USER
// ─────────────────────────────────────────────────────────────────────────────

export interface ICourseClaimed {
  courseId: string;
  courseName: string;
  certificateUrl?: string;
  completionDate?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// ON-JOB TRAINING DETAILS
// ─────────────────────────────────────────────────────────────────────────────

export interface IOnJobTrainingDetails {
  startDate?: Date;
  endDate?: Date;
  companyName?: string;
  supervisorName?: string;
  certificateUrl?: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNSHIP DETAILS
// ─────────────────────────────────────────────────────────────────────────────

export interface IInternshipDetails {
  startDate?: Date;
  endDate?: Date;
  companyName?: string;
  position?: string;
  certificateUrl?: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION REQUEST (Main Model)
// ─────────────────────────────────────────────────────────────────────────────

export interface IVerificationRequest {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  
  // Application Data
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  
  // User Submitted Info
  studentId?: string;
  batchNo: string;
  enrollmentYear: number;
  
  // Courses Claimed
  coursesClaimed: ICourseClaimed[];
  
  // Training Claimed
  claimsOnJobTraining: boolean;
  onJobTrainingDetails?: IOnJobTrainingDetails;
  
  // Internship Claimed
  claimsInternship: boolean;
  internshipDetails?: IInternshipDetails;
  
  // Additional Documents & Notes
  proofDocuments?: string[];
  userNotes?: string;
  adminNotes?: string;
  
  // Admin Decision
  approvedBadgeType?: BadgeType;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// CADDCORE VERIFICATION (Embedded in User Model)
// ─────────────────────────────────────────────────────────────────────────────

export interface ICaddcoreVerification {
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  badgeType?: BadgeType;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  
  // Verified Information
  studentId?: string;
  batchNo?: string;
  courses?: {
    courseId: string;
    courseName: string;
    completedAt?: Date;
  }[];
  
  // Training & Internship Status
  hasOnJobTraining?: boolean;
  hasInternship?: boolean;
  
  // Calculated Priority
  priorityScore?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY FOR VERIFICATION INPUT
// ─────────────────────────────────────────────────────────────────────────────

export interface IApplyVerificationInput {
  studentId?: string;
  batchNo: string;
  enrollmentYear: number;
  coursesClaimed: ICourseClaimed[];
  claimsOnJobTraining: boolean;
  onJobTrainingDetails?: IOnJobTrainingDetails;
  claimsInternship: boolean;
  internshipDetails?: IInternshipDetails;
  proofDocuments?: string[];
  userNotes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN APPROVAL INPUT
// ─────────────────────────────────────────────────────────────────────────────

export interface IApproveVerificationInput {
  badgeType: BadgeType;
  adminNotes?: string;
}

export interface IRejectVerificationInput {
  rejectionReason: string;
  adminNotes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION STATS
// ─────────────────────────────────────────────────────────────────────────────

export interface IVerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  badgeDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface IVerificationRequestDocument extends Omit<IVerificationRequest, '_id'>, Document {}

export interface IVerificationRequestModel extends Model<IVerificationRequestDocument> {}
