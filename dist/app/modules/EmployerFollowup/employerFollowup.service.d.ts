import { Types } from 'mongoose';
import { IEmployerFollowup, IFollowupFilters } from './employerFollowup.interface';
export declare const EmployerFollowupService: {
    createFollowup: (payload: Partial<IEmployerFollowup>, recordedBy: string) => Promise<IEmployerFollowup>;
    getAllFollowups: (filters?: IFollowupFilters) => Promise<{
        data: (import("mongoose").Document<unknown, {}, IEmployerFollowup, {}, {}> & IEmployerFollowup & Required<{
            _id: Types.ObjectId | undefined;
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
    getFollowupById: (id: string) => Promise<IEmployerFollowup>;
    getFollowupsByCompany: (companyId: string) => Promise<(import("mongoose").Document<unknown, {}, IEmployerFollowup, {}, {}> & IEmployerFollowup & Required<{
        _id: Types.ObjectId | undefined;
    }> & {
        __v: number;
    })[]>;
    getDueFollowups: (limit?: number) => Promise<(import("mongoose").Document<unknown, {}, IEmployerFollowup, {}, {}> & IEmployerFollowup & Required<{
        _id: Types.ObjectId | undefined;
    }> & {
        __v: number;
    })[]>;
    updateFollowup: (id: string, payload: Partial<IEmployerFollowup>) => Promise<IEmployerFollowup>;
    markActionDone: (id: string) => Promise<IEmployerFollowup>;
    deleteFollowup: (id: string) => Promise<void>;
    getFollowupStats: (from?: string, to?: string) => Promise<{
        totalFollowups: number;
        employersContacted: number;
        pendingActions: number;
        byOutcome: Record<string, number>;
        byMethod: Record<string, number>;
        byHiringNeed: Record<string, number>;
    }>;
};
//# sourceMappingURL=employerFollowup.service.d.ts.map