import { Model, Types } from 'mongoose';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The placement cell's call log: every time someone from the institute contacts
 * an employer, what was asked, and what came back.
 *
 * This is the one part of the tracking sheet the portal had no home for. Jobs,
 * applications and companies all record what the EMPLOYER did on the platform;
 * nothing recorded what WE did off it. Without that, "we have 40 employers"
 * cannot be separated from "we have 40 employers anyone has actually spoken
 * to", and the KPI sheet needs exactly that distinction.
 *
 * A follow-up always points at a Company. `companyNameSnapshot` exists so a log
 * line still reads correctly if that company is later renamed or removed.
 */
export declare const CONTACT_METHODS: readonly ["Phone", "Email", "WhatsApp", "Visit", "Meeting", "LinkedIn", "Other"];
export declare const FOLLOWUP_PURPOSES: readonly ["Initial Contact", "Vacancy Collection", "CV Submission", "Interview Coordination", "Placement Confirmation", "Relationship Building", "Feedback Collection", "Other"];
export declare const HIRING_NEEDS: readonly ["Immediate", "Within 1 Month", "Within 3 Months", "Future", "None", "Unknown"];
export declare const FOLLOWUP_OUTCOMES: readonly ["Positive", "Neutral", "Negative", "No Response", "Pending"];
export type ContactMethod = (typeof CONTACT_METHODS)[number];
export type FollowupPurpose = (typeof FOLLOWUP_PURPOSES)[number];
export type HiringNeed = (typeof HIRING_NEEDS)[number];
export type FollowupOutcome = (typeof FOLLOWUP_OUTCOMES)[number];
export interface IEmployerFollowup {
    _id?: Types.ObjectId | undefined;
    /**
     * Human-readable reference, e.g. `FU-2026-0007`. Generated on save.
     * The placement cell quotes these in meetings, so the sequence is per-year
     * and never reused.
     */
    followupId: string;
    companyId: Types.ObjectId;
    /** Company name as it stood on the day of contact. */
    companyNameSnapshot?: string | undefined;
    /** Person spoken to at the employer. */
    contactPerson?: string | undefined;
    contactDesignation?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
    contactDate: Date;
    contactMethod: ContactMethod;
    purpose: FollowupPurpose;
    /** What the employer said, in the caller's own words. */
    response?: string | undefined;
    outcome: FollowupOutcome;
    hiringNeed: HiringNeed;
    /** Roles the employer mentioned they are hiring for. */
    rolesDiscussed?: string[] | undefined;
    vacanciesOffered?: number | undefined;
    nextAction?: string | undefined;
    nextActionDate?: Date | undefined;
    /** Cleared when the next action is carried out. Drives the "due" list. */
    isNextActionDone?: boolean | undefined;
    notes?: string | undefined;
    /** Staff member who made the contact. */
    recordedBy: Types.ObjectId;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
export interface IEmployerFollowupModel extends Model<IEmployerFollowup> {
    /** Next `FU-<year>-<seq>` for the given year. */
    generateFollowupId(year?: number): Promise<string>;
}
export interface IFollowupFilters {
    companyId?: string | undefined;
    contactMethod?: string | undefined;
    purpose?: string | undefined;
    outcome?: string | undefined;
    hiringNeed?: string | undefined;
    /** Only follow-ups with an open next action. */
    pendingActionsOnly?: boolean | undefined;
    from?: string | undefined;
    to?: string | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}
//# sourceMappingURL=employerFollowup.interface.d.ts.map