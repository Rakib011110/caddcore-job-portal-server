import { Request, Response } from 'express';
/** The formats a CV may be built and approved in. */
export declare const listTemplates: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
/** Candidate exporting their own CV. */
export declare const exportMyResume: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
/**
 * Recruiter exporting the CV attached to an application.
 *
 * Always the frozen snapshot, always in the approved template - this is the
 * document of record for that application.
 */
export declare const exportApplicationResume: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
/**
 * Anyone downloading the CV from a public candidate profile.
 *
 * Always the approved content in the approved template - the same document an
 * employer receives with an application, so the CV a visitor downloads and the
 * CV that arrives in the applicant list cannot disagree.
 */
export declare const exportPublicCandidateResume: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
/** Reviewer exporting a CV from the approval queue. */
export declare const exportResumeForReview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const ResumeExportControllers: {
    listTemplates: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    exportMyResume: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    exportApplicationResume: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    exportPublicCandidateResume: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    exportResumeForReview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=resume.export.controller.d.ts.map