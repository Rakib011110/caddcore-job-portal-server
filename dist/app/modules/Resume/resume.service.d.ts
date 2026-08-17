import { suggestBadge } from './resume.badge';
import { IApproveResumePayload, ICreateResumePayload, IRejectResumePayload, IResume, IResumeDocument, IResumeEligibility, IResumeFilters, IResumeStats, ISubmitResumePayload, IUpdateResumePayload } from './resume.interface';
import { TResumeStatus } from './resume.constant';
/**
 * The reviewer's view of a CV: plain content, not a live document.
 *
 * Spelled out rather than left as `any` so callers cannot reach for document
 * methods that were lost the moment `badgeReview` was spread on.
 */
export interface IResumeReviewView extends IResume {
    badgeReview: {
        suggestion: ReturnType<typeof suggestBadge>;
        currentBadge: string | null;
        /** Platinum is awarded on placement and is never changed by a CV review. */
        isLocked: boolean;
        credentialsChanged: boolean;
    };
}
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
    getCvCompleteness: (userId: string) => Promise<{
        /** When false the client hides the bar - the score is still computed. */
        display: boolean;
        hasResume: boolean;
        resumeId: string | undefined;
        resumeStatus: TResumeStatus | undefined;
        percentage: number;
        sections: import("./resume.completeness").CompletenessSection[];
        nextSteps: Array<{
            id: string;
            label: string;
            hint: string;
            pointsAvailable: number;
            essential: boolean;
        }>;
        potential: number;
        isJobReady: boolean;
        readyThreshold: number;
    }>;
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
    getResumeById: (resumeId: string) => Promise<IResumeReviewView>;
    approveResume: (resumeId: string, reviewerId: string, reviewerRole: string, payload?: IApproveResumePayload) => Promise<IResumeDocument>;
    rejectResume: (resumeId: string, reviewerId: string, reviewerRole: string, payload?: IRejectResumePayload) => Promise<IResumeDocument>;
    getResumeStats: () => Promise<IResumeStats>;
};
//# sourceMappingURL=resume.service.d.ts.map