export declare const AnalyticsServices: {
    getOverviewStats: () => Promise<{
        users: {
            total: number;
            active: number;
            inactive: number;
        };
        jobs: {
            total: number;
            active: number;
            inactive: number;
        };
        applications: {
            total: number;
            pending: number;
            shortlisted: number;
        };
    }>;
    getUserStats: () => Promise<{
        byRole: any;
        byStatus: any;
        recentUsers: (import("mongoose").Document<unknown, {}, import("../User/user.interface").TUser, {}, {}> & import("../User/user.interface").TUser & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        withCompleteProfile: number;
        withJobAlerts: number;
        registrationTrend: any[];
    }>;
    getJobStats: () => Promise<{
        byCategory: any[];
        byType: any;
        byLocation: any[];
        recentJobs: (import("mongoose").Document<unknown, {}, import("../jobs/job.interface").TJobs, {}, {}> & import("../jobs/job.interface").TJobs & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        featured: number;
        expired: number;
        postingTrend: any[];
    }>;
    getApplicationStats: () => Promise<{
        byStatus: any;
        topJobs: any[];
        recent: (import("mongoose").Document<unknown, {}, import("../jobs/Jobaplications/Jobaplications.interfaces").IJobApplication, {}, {}> & import("../jobs/Jobaplications/Jobaplications.interfaces").IJobApplication & Required<{
            _id: string | undefined;
        }> & {
            __v: number;
        })[];
        trend: any[];
    }>;
    getDashboardData: () => Promise<{
        overview: {
            users: {
                total: number;
                active: number;
                inactive: number;
            };
            jobs: {
                total: number;
                active: number;
                inactive: number;
            };
            applications: {
                total: number;
                pending: number;
                shortlisted: number;
            };
        };
        users: {
            byRole: any;
            byStatus: any;
            recentUsers: (import("mongoose").Document<unknown, {}, import("../User/user.interface").TUser, {}, {}> & import("../User/user.interface").TUser & Required<{
                _id: string;
            }> & {
                __v: number;
            })[];
            withCompleteProfile: number;
            withJobAlerts: number;
            registrationTrend: any[];
        };
        jobs: {
            byCategory: any[];
            byType: any;
            byLocation: any[];
            recentJobs: (import("mongoose").Document<unknown, {}, import("../jobs/job.interface").TJobs, {}, {}> & import("../jobs/job.interface").TJobs & Required<{
                _id: string;
            }> & {
                __v: number;
            })[];
            featured: number;
            expired: number;
            postingTrend: any[];
        };
        applications: {
            byStatus: any;
            topJobs: any[];
            recent: (import("mongoose").Document<unknown, {}, import("../jobs/Jobaplications/Jobaplications.interfaces").IJobApplication, {}, {}> & import("../jobs/Jobaplications/Jobaplications.interfaces").IJobApplication & Required<{
                _id: string | undefined;
            }> & {
                __v: number;
            })[];
            trend: any[];
        };
        generatedAt: Date;
    }>;
    getConversionMetrics: () => Promise<{
        shortlistRate: string | number;
        selectionRate: string | number;
        rejectionRate: string | number;
        details: {
            total: number;
            shortlisted: number;
            selected: number;
            rejected: number;
        };
    }>;
};
//# sourceMappingURL=analytics.services.d.ts.map