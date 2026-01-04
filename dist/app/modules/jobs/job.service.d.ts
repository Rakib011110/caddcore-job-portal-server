import { TJobs } from "./job.interface";
export declare const createJob: (payload: TJobs) => Promise<import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
    _id: string;
}> & {
    __v: number;
}>;
export declare const getAllJobs: (filters?: any) => Promise<{
    data: (import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
        _id: string;
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
export declare const getSingleJob: (slug: string) => Promise<(import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare const getSingleJobById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare const updateJob: (id: string, payload: Partial<TJobs>) => Promise<(import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare const deleteJob: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare const getJobsByCompany: (companyName: string) => Promise<(import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
    _id: string;
}> & {
    __v: number;
})[]>;
export declare const getFeaturedJobs: (limit?: number) => Promise<(import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
    _id: string;
}> & {
    __v: number;
})[]>;
export declare const getJobsCountByCategory: () => Promise<any[]>;
export declare const getTotalJobsCount: () => Promise<number>;
export declare const uploadJobLogo: (jobId: string, file: any) => Promise<{
    job: import("mongoose").Document<unknown, {}, TJobs, {}, {}> & TJobs & Required<{
        _id: string;
    }> & {
        __v: number;
    };
    logoUrl: any;
}>;
//# sourceMappingURL=job.service.d.ts.map