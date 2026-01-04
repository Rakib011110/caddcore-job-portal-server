import { IApplyVerificationInput, IApproveVerificationInput, IRejectVerificationInput, IVerificationStats } from './verification.interface';
import mongoose from 'mongoose';
export declare const VerificationServices: {
    applyForVerification: (userId: string, data: IApplyVerificationInput) => Promise<mongoose.Document<unknown, {}, import("./verification.interface").IVerificationRequestDocument, {}, {}> & import("./verification.interface").IVerificationRequestDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getMyVerificationStatus: (userId: string) => Promise<{
        verification: {
            isVerified: boolean;
            verificationStatus: "not_applied" | "pending" | "approved" | "rejected";
            badgeType?: "bronze" | "silver" | "gold" | "platinum";
            verifiedAt?: Date;
            verifiedBy?: mongoose.Types.ObjectId;
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
        };
        latestRequest: (mongoose.FlattenMaps<import("./verification.interface").IVerificationRequestDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        }) | null;
    }>;
    updateVerificationRequest: (requestId: string, userId: string, data: Partial<IApplyVerificationInput>) => Promise<mongoose.Document<unknown, {}, import("./verification.interface").IVerificationRequestDocument, {}, {}> & import("./verification.interface").IVerificationRequestDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    cancelVerificationRequest: (requestId: string, userId: string) => Promise<{
        message: string;
    }>;
    getCoursesList: () => import("./verification.constant").ICaddcoreCourse[];
    getAllVerificationRequests: (filters: {
        status?: string;
        page?: number;
        limit?: number;
        searchTerm?: string;
    }) => Promise<{
        data: (mongoose.FlattenMaps<import("./verification.interface").IVerificationRequestDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getSingleVerificationRequest: (requestId: string) => Promise<mongoose.FlattenMaps<import("./verification.interface").IVerificationRequestDocument> & Required<{
        _id: mongoose.FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    approveVerification: (requestId: string, adminId: string, data: IApproveVerificationInput) => Promise<mongoose.Document<unknown, {}, import("./verification.interface").IVerificationRequestDocument, {}, {}> & import("./verification.interface").IVerificationRequestDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    rejectVerification: (requestId: string, adminId: string, data: IRejectVerificationInput) => Promise<mongoose.Document<unknown, {}, import("./verification.interface").IVerificationRequestDocument, {}, {}> & import("./verification.interface").IVerificationRequestDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getVerificationStats: () => Promise<IVerificationStats>;
    upgradeToPlatinum: (userId: string, adminId: string) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=verification.services.d.ts.map