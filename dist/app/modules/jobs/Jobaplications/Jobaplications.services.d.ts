import mongoose from "mongoose";
import { IJobApplication, IStatusUpdatePayload, IScheduleInterviewPayload } from "./Jobaplications.interfaces";
export declare const applyToJob: (payload: Partial<IJobApplication>, sendNotification?: boolean) => Promise<any>;
export declare const updateApplicationStatus: (payload: IStatusUpdatePayload) => Promise<any>;
export declare const scheduleInterview: (payload: IScheduleInterviewPayload) => Promise<any>;
export declare const rescheduleInterview: (applicationId: string, interviewId: string, newDate: Date, newTime: string, reason: string, rescheduledBy?: string, sendNotification?: boolean) => Promise<any>;
export declare const cancelInterview: (applicationId: string, interviewId: string, reason: string, cancelledBy?: string) => Promise<any>;
export declare const submitInterviewFeedback: (applicationId: string, interviewId: string, feedback: {
    rating?: number;
    strengths?: string[];
    improvements?: string[];
    recommendation?: "Hire" | "Reject" | "Next Round" | "Hold";
    comments?: string;
}, submittedBy: string) => Promise<any>;
export declare const getApplicationWithTimeline: (id: string) => Promise<any>;
export declare const getApplicationsByJob: (jobId: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
    _id: string | undefined;
}> & {
    __v: number;
})[]>;
export declare const getAllApplications: (filters?: {
    companyId?: string;
    status?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: (mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
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
export declare const getApplicationById: (id: string) => Promise<any>;
export declare const addApplicationNotes: (id: string, notes: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
    _id: string | undefined;
}> & {
    __v: number;
}) | null>;
/**
 * Record the outcome of a hire: the offer terms and the placement follow-up.
 *
 * These two blocks had no write path at all before, which meant the Placement
 * Record report could never show a joining date or a salary no matter what
 * actually happened - the schema fields existed but nothing ever filled them.
 *
 * Written as a nested `$set` rather than a whole-object replace so updating one
 * field (say, the 6-month follow-up) does not wipe the offer terms recorded
 * months earlier.
 */
export declare const updatePlacementDetails: (id: string, payload: {
    offerDetails?: Record<string, unknown>;
    placement?: Record<string, unknown>;
    applicationMethod?: string;
    followUpDate?: Date | string;
    followUpStatus?: string;
}, updatedBy?: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
    _id: string | undefined;
}> & {
    __v: number;
}) | null>;
/**
 * Placements whose 6-month check-in is due, plus the hires that cannot be
 * tracked at all yet because no joining date was ever recorded.
 *
 * Two lists rather than one, because they need different actions: the first
 * needs someone to phone the employer, the second needs someone to fill in a
 * date before the placement can be counted or followed up. Returning only the
 * first would quietly hide every hire that was never completed.
 */
export declare const getDuePlacementFollowups: () => Promise<{
    due: (mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    })[];
    missingJoiningDate: (mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    })[];
    counts: {
        due: number;
        missingJoiningDate: number;
    };
}>;
export declare const deleteApplication: (id: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
    _id: string | undefined;
}> & {
    __v: number;
}) | null>;
export declare const getApplicationCountByStatus: (jobId: string) => Promise<any[]>;
export declare const getTotalApplicationsForJob: (jobId: string) => Promise<number>;
export declare const getApplicationsByUserId: (userId: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
    _id: string | undefined;
}> & {
    __v: number;
})[]>;
export declare const searchApplications: (query: any) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
    _id: string | undefined;
}> & {
    __v: number;
})[]>;
export declare const getUpcomingInterviews: (days?: number, companyId?: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
    _id: string | undefined;
}> & {
    __v: number;
})[]>;
export interface IApplicationResumeResult {
    applicationId: string;
    /** `id` is the candidate's user id - needed to start a chat with them */
    candidate: {
        id?: string;
        name?: string;
        email?: string;
        profilePhoto?: string;
    };
    job: {
        title?: string;
        companyName?: string;
    };
    appliedAt?: Date;
    /** The CV exactly as approved when the candidate applied */
    resume: Record<string, any>;
    template: string;
    version: number;
    /** True when the candidate has edited their CV since applying */
    candidateHasNewerVersion: boolean;
    /**
     * Applications created before snapshots existed have no frozen copy. We fall
     * back to the live resume and say so, rather than showing nothing.
     */
    isLegacyFallback: boolean;
}
/**
 * The CV a recruiter should look at for one application.
 *
 * Reads the frozen snapshot first. Only pre-snapshot applications fall back to
 * the live resume document, and those are flagged so the UI can be honest about
 * what it is showing.
 */
export declare const getApplicationResume: (applicationId: string) => Promise<IApplicationResumeResult | null>;
export declare const ApplicationService: {
    applyToJob: (payload: Partial<IJobApplication>, sendNotification?: boolean) => Promise<any>;
    updateApplicationStatus: (payload: IStatusUpdatePayload) => Promise<any>;
    scheduleInterview: (payload: IScheduleInterviewPayload) => Promise<any>;
    rescheduleInterview: (applicationId: string, interviewId: string, newDate: Date, newTime: string, reason: string, rescheduledBy?: string, sendNotification?: boolean) => Promise<any>;
    cancelInterview: (applicationId: string, interviewId: string, reason: string, cancelledBy?: string) => Promise<any>;
    submitInterviewFeedback: (applicationId: string, interviewId: string, feedback: {
        rating?: number;
        strengths?: string[];
        improvements?: string[];
        recommendation?: "Hire" | "Reject" | "Next Round" | "Hold";
        comments?: string;
    }, submittedBy: string) => Promise<any>;
    getApplicationWithTimeline: (id: string) => Promise<any>;
    getApplicationsByJob: (jobId: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    })[]>;
    getAllApplications: (filters?: {
        companyId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        data: (mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
            _id: string | undefined;
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
    getApplicationById: (id: string) => Promise<any>;
    addApplicationNotes: (id: string, notes: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    }) | null>;
    updatePlacementDetails: (id: string, payload: {
        offerDetails?: Record<string, unknown>;
        placement?: Record<string, unknown>;
        applicationMethod?: string;
        followUpDate?: Date | string;
        followUpStatus?: string;
    }, updatedBy?: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    }) | null>;
    getDuePlacementFollowups: () => Promise<{
        due: (mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
            _id: string | undefined;
        }> & {
            __v: number;
        })[];
        missingJoiningDate: (mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
            _id: string | undefined;
        }> & {
            __v: number;
        })[];
        counts: {
            due: number;
            missingJoiningDate: number;
        };
    }>;
    deleteApplication: (id: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    }) | null>;
    getApplicationCountByStatus: (jobId: string) => Promise<any[]>;
    getTotalApplicationsForJob: (jobId: string) => Promise<number>;
    getApplicationsByUserId: (userId: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    })[]>;
    searchApplications: (query: any) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    })[]>;
    getUpcomingInterviews: (days?: number, companyId?: string) => Promise<(mongoose.Document<unknown, {}, IJobApplication, {}, {}> & IJobApplication & Required<{
        _id: string | undefined;
    }> & {
        __v: number;
    })[]>;
    getApplicationResume: (applicationId: string) => Promise<IApplicationResumeResult | null>;
};
//# sourceMappingURL=Jobaplications.services.d.ts.map