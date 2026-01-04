/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * HTTP request handlers for Company module.
 */
import { Request, Response } from 'express';
export declare const CompanyController: {
    registerCompany: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getMyCompany: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateMyCompany: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getCompanyById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getCompanyBySlug: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllApprovedCompanies: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllCompaniesForAdmin: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getPendingCompanies: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    approveCompany: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getCompanyStats: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    canPostJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=company.controller.d.ts.map