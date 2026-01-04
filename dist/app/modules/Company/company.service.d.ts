/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Business logic for Company module including registration, approval, and CRUD.
 */
import { Types } from 'mongoose';
import { ICompany, ICompanyRegistrationInput, ICompanyUpdateInput, ICompanyApprovalInput } from './company.interface';
export declare const CompanyService: {
    registerCompany: (payload: ICompanyRegistrationInput) => Promise<{
        user: any;
        company: ICompany;
    }>;
    getMyCompany: (userId: string) => Promise<ICompany | null>;
    updateMyCompany: (userId: string, payload: ICompanyUpdateInput) => Promise<ICompany | null>;
    getCompanyById: (id: string) => Promise<ICompany | null>;
    getCompanyBySlug: (slug: string) => Promise<ICompany | null>;
    getAllApprovedCompanies: (query: Record<string, unknown>) => Promise<{
        companies: (import("mongoose").Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
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
    getAllCompaniesForAdmin: (query: Record<string, unknown>) => Promise<{
        companies: (import("mongoose").Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
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
    getPendingCompanies: (query: Record<string, unknown>) => Promise<{
        companies: (import("mongoose").Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
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
    approveCompany: (companyId: string, adminId: string, payload: ICompanyApprovalInput) => Promise<ICompany | null>;
    getCompanyStats: () => Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        suspended: number;
        premium: number;
        verified: number;
        recentRegistrations: number;
        industryDistribution: any[];
    }>;
    canCompanyPostJob: (userId: string) => Promise<{
        canPost: boolean;
        reason?: string;
        company?: ICompany;
    }>;
    incrementJobCount: (companyId: string) => Promise<void>;
    decrementActiveJobCount: (companyId: string) => Promise<void>;
};
//# sourceMappingURL=company.service.d.ts.map