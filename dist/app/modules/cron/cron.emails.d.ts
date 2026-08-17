export interface DigestPayload {
    dueCheckIns: string[];
    missingJoiningDates: string[];
    overdueEmployerActions: string[];
}
export declare const sendAdminDigest: (recipients: string[], payload: DigestPayload) => Promise<void>;
export interface CheckInPayload {
    candidateName: string;
    companyName: string;
    jobTitle: string;
    /** Signed, single-purpose link. */
    checkInUrl: string;
    expiresInDays: number;
}
export declare const sendSixMonthCheckIn: (email: string, payload: CheckInPayload) => Promise<void>;
//# sourceMappingURL=cron.emails.d.ts.map