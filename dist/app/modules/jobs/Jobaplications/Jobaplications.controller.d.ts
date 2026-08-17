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
/**
 * Record offer terms and the post-hire placement follow-up.
 *
 * Feeds the Placement Record report - joining date, salary, employment status,
 * the 6-month check-in and whether any of it has been verified against the
 * employer.
 */
export declare const updatePlacementDetails: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
/** Placement follow-ups that are due, and hires still missing a joining date. */
export declare const getDuePlacementFollowups: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const deleteApplication: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getApplicationCountByStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getTotalApplicationsForJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getApplicationsByUserId: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const searchApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getMyApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
/**
 * The CV that came with this application, frozen as approved.
 *
 * Access is already settled by `guardApplicationScope` on the route, so this
 * handler only has to fetch.
 */
export declare const getApplicationResume: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
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
    updatePlacementDetails: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getDuePlacementFollowups: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteApplication: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getApplicationCountByStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getTotalApplicationsForJob: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getApplicationsByUserId: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    searchApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getMyApplications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getApplicationResume: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=Jobaplications.controller.d.ts.map