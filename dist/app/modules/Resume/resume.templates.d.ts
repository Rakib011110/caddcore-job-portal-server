/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CV TEMPLATE REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The one place a CV format is defined.
 *
 * These ids used to be duplicated in three files with three different sets of
 * labels - the candidate picked "Modern", the reviewer approved "Executive
 * Corporate", and nobody could tell they were the same thing. Both sides now
 * read this list, so the format a candidate submits is the format the reviewer
 * approves and the format the employer receives.
 *
 * Keep this file in sync with its client twin at
 * `caddcore-job-portal-client-code/src/lib/cv/templates.ts`.
 */
export interface IResumeTemplate {
    id: string;
    /** Shown to everyone - candidate, reviewer and employer alike */
    name: string;
    description: string;
    /** True when the layout survives automated CV parsers */
    atsSafe: boolean;
}
export declare const RESUME_TEMPLATES: IResumeTemplate[];
export declare const DEFAULT_RESUME_TEMPLATE_ID = "classic";
export declare const RESUME_TEMPLATE_IDS: string[];
export declare const isKnownTemplate: (id: unknown) => id is string;
export declare const getTemplate: (id: unknown) => IResumeTemplate;
//# sourceMappingURL=resume.templates.d.ts.map