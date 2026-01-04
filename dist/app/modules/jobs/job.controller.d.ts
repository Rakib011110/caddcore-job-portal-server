import { Request, Response } from "express";
export declare const createJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getAllJobs: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getSingleJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getSingleJobById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const updateJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const deleteJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getJobsByCompany: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getFeaturedJobs: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getJobsCountByCategory: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getTotalJobsCount: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const uploadJobLogo: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
//# sourceMappingURL=job.controller.d.ts.map