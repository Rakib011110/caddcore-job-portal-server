import { IApproveResumePayload, ICreateResumePayload, IRejectResumePayload, IResumeDocument, IResumeEligibility, IResumeFilters, IResumeStats, ISubmitResumePayload, IUpdateResumePayload } from './resume.interface';
export declare const ResumeService: {
    createResume: (userId: string, payload: ICreateResumePayload) => Promise<IResumeDocument>;
    getMyResumes: (userId: string, filters?: IResumeFilters) => Promise<IResumeDocument[]>;
    getMyResumeById: (userId: string, resumeId: string) => Promise<IResumeDocument>;
    ensurePrimaryResume: (userId: string) => Promise<IResumeDocument>;
    syncFromProfile: (userId: string, resumeId: string) => Promise<IResumeDocument>;
    updateResume: (userId: string, resumeId: string, payload: IUpdateResumePayload) => Promise<IResumeDocument>;
    deleteResume: (userId: string, resumeId: string) => Promise<{
        message: string;
    }>;
    setDefaultResume: (userId: string, resumeId: string) => Promise<IResumeDocument>;
    submitForReview: (userId: string, resumeId: string, payload?: ISubmitResumePayload) => Promise<IResumeDocument>;
    withdrawSubmission: (userId: string, resumeId: string) => Promise<IResumeDocument>;
    getEligibility: (userId: string) => Promise<IResumeEligibility>;
    assertCanApplyForJobs: (userId: string) => Promise<void>;
    getApplicableResume: (userId: string) => Promise<IResumeDocument | null>;
    getPublicCandidateResume: (userId: string) => Promise<{
        approvedAt?: Date;
        candidate: {
            id: string;
            name: string;
            email: string;
            profilePhoto: string | undefined;
        };
        resume: import("./resume.snapshot").IResumeSnapshot;
        template: string;
        version: number;
    } | null>;
    getAllResumes: (filters?: IResumeFilters) => Promise<{
        data: (import("mongoose").Document<unknown, {}, IResumeDocument, {}, {}> & IResumeDocument & Required<{
            _id: unknown;
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
    getResumeById: (resumeId: string) => Promise<IResumeDocument>;
    approveResume: (resumeId: string, reviewerId: string, reviewerRole: string, payload?: IApproveResumePayload) => Promise<IResumeDocument>;
    rejectResume: (resumeId: string, reviewerId: string, reviewerRole: string, payload?: IRejectResumePayload) => Promise<IResumeDocument>;
    getResumeStats: () => Promise<IResumeStats>;
};
//# sourceMappingURL=resume.service.d.ts.map