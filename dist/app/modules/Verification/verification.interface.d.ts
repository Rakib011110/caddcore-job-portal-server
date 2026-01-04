import { Types, Model, Document } from 'mongoose';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CADDCORE VERIFICATION INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export type BadgeType = 'bronze' | 'silver' | 'gold' | 'platinum';
export type VerificationStatus = 'not_applied' | 'pending' | 'approved' | 'rejected';
export interface ICourseClaimed {
    courseId: string;
    courseName: string;
    certificateUrl?: string;
    completionDate?: Date;
}
export interface IOnJobTrainingDetails {
    startDate?: Date;
    endDate?: Date;
    companyName?: string;
    supervisorName?: string;
    certificateUrl?: string;
    description?: string;
}
export interface IInternshipDetails {
    startDate?: Date;
    endDate?: Date;
    companyName?: string;
    position?: string;
    certificateUrl?: string;
    description?: string;
}
export interface IVerificationRequest {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: Date;
    processedAt?: Date;
    processedBy?: Types.ObjectId;
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
    adminNotes?: string;
    approvedBadgeType?: BadgeType;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICaddcoreVerification {
    isVerified: boolean;
    verificationStatus: VerificationStatus;
    badgeType?: BadgeType;
    verifiedAt?: Date;
    verifiedBy?: Types.ObjectId;
    studentId?: string;
    batchNo?: string;
    courses?: {
        courseId: string;
        courseName: string;
        completedAt?: Date;
    }[];
    hasOnJobTraining?: boolean;
    hasInternship?: boolean;
    priorityScore?: number;
}
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
export interface IApproveVerificationInput {
    badgeType: BadgeType;
    adminNotes?: string;
}
export interface IRejectVerificationInput {
    rejectionReason: string;
    adminNotes?: string;
}
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
export interface IVerificationRequestDocument extends Omit<IVerificationRequest, '_id'>, Document {
}
export interface IVerificationRequestModel extends Model<IVerificationRequestDocument> {
}
//# sourceMappingURL=verification.interface.d.ts.map