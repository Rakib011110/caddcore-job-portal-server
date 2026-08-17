import { Request, Response } from 'express';
export declare const EmployerFollowupControllers: {
    createFollowup: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllFollowups: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getFollowupById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getFollowupsByCompany: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getDueFollowups: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateFollowup: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    markActionDone: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteFollowup: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getFollowupStats: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=employerFollowup.controller.d.ts.map