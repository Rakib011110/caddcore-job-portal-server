export interface CheckInTokenPayload {
    applicationId: string;
    aud: string;
}
export declare const createCheckInToken: (applicationId: string, expiresInDays: number) => string;
/** Returns the application id, or null when the token is bad or expired. */
export declare const verifyCheckInToken: (token: string) => string | null;
export interface JobResult {
    job: string;
    skipped?: string;
    processed?: number;
    sent?: number;
    errors?: string[];
}
export declare const runAdminDigest: () => Promise<JobResult>;
export declare const runSixMonthCheckIn: () => Promise<JobResult>;
export type CheckInAnswer = 'working' | 'left';
/** What the check-in page shows before the candidate answers. */
export declare const getCheckInContext: (token: string) => Promise<{
    candidateName: any;
    companyName: any;
    jobTitle: any;
    joiningDate: any;
    /** True when they have already answered - the page says thank you instead. */
    alreadyAnswered: boolean;
    previousAnswer: any;
} | null>;
/**
 * Record the candidate's own answer.
 *
 * Deliberately does NOT set `placement.verified`. Verified means the institute
 * confirmed the placement with the employer; a candidate saying so is useful
 * evidence but it is not that confirmation, and conflating the two would inflate
 * the verified placement figures.
 */
export declare const submitCheckInResponse: (token: string, answer: CheckInAnswer, note?: string) => Promise<{
    ok: boolean;
    answer: CheckInAnswer;
} | null>;
/** Everything the daily schedule should do, in order. */
export declare const runDailyJobs: () => Promise<JobResult[]>;
export declare const CronService: {
    runDailyJobs: () => Promise<JobResult[]>;
    runAdminDigest: () => Promise<JobResult>;
    runSixMonthCheckIn: () => Promise<JobResult>;
    getCheckInContext: (token: string) => Promise<{
        candidateName: any;
        companyName: any;
        jobTitle: any;
        joiningDate: any;
        /** True when they have already answered - the page says thank you instead. */
        alreadyAnswered: boolean;
        previousAnswer: any;
    } | null>;
    submitCheckInResponse: (token: string, answer: CheckInAnswer, note?: string) => Promise<{
        ok: boolean;
        answer: CheckInAnswer;
    } | null>;
    createCheckInToken: (applicationId: string, expiresInDays: number) => string;
    verifyCheckInToken: (token: string) => string | null;
};
//# sourceMappingURL=cron.service.d.ts.map