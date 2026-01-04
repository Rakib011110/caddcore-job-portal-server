import { Request, Response } from "express";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION CONTROLLER - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Complete CRUD with interview scheduling and status management
 */
export declare const applyToJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const updateApplicationStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const scheduleInterview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const rescheduleInterview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const cancelInterview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const submitInterviewFeedback: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getApplicationWithTimeline: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getUpcomingInterviews: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getApplicationsByJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getAllApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getApplicationById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const addApplicationNotes: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const deleteApplication: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getApplicationCountByStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getTotalApplicationsForJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getApplicationsByUserId: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const searchApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getMyApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const ApplicationController: {
    applyToJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateApplicationStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    scheduleInterview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    rescheduleInterview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    cancelInterview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    submitInterviewFeedback: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getApplicationWithTimeline: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getUpcomingInterviews: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getApplicationsByJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getApplicationById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    addApplicationNotes: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteApplication: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getApplicationCountByStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getTotalApplicationsForJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getApplicationsByUserId: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    searchApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getMyApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=Jobaplications.controller.d.ts.map