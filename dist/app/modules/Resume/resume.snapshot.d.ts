import { IResumeContent, IResumeDocument } from './resume.interface';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME SNAPSHOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A resume document is mutable: the candidate keeps editing it, and any edit to
 * reviewed content drops it back to `draft` so it has to be approved again.
 * That is right for the living CV - and wrong for an application that was
 * already sent.
 *
 * Storing only `resumeId` on an application meant a recruiter opening it later
 * would see whatever the candidate has typed since, labelled with the version
 * number of something else entirely. So at apply time we copy the approved
 * content onto the application and never touch it again.
 *
 * The snapshot is the record of what was approved. The resume document is the
 * candidate's current draft. They are allowed to diverge, and the UI says so.
 */
export interface IResumeSnapshot extends IResumeContent {
    /** The resume this was copied from - for tracing, not for reading content */
    resumeId: string;
    /** Submission number that was approved */
    version: number;
    /** Template the content was approved in */
    template: string;
    /** Section order approved alongside it, for the `custom` template */
    sectionOrder?: string[];
    /** Candidate-facing resume label at the time of applying */
    title?: string;
    approvedAt?: Date;
    /** When the copy was taken (i.e. when the candidate applied) */
    capturedAt: Date;
}
/**
 * Deep-copy the reviewed content off a resume document.
 *
 * `toObject()` is deliberate: without it the arrays would still be live
 * Mongoose subdocuments sharing memory with the resume, and a later edit could
 * mutate the "immutable" snapshot from underneath us.
 */
export declare const buildResumeSnapshot: (resume: IResumeDocument) => IResumeSnapshot;
/**
 * Has the candidate's live resume moved on since this snapshot was taken?
 *
 * Recruiters see this as "the candidate has updated their CV since applying",
 * which is useful context without implying anything is wrong.
 */
export declare const isSnapshotStale: (snapshot: Pick<IResumeSnapshot, "version"> | undefined, resume: Pick<IResumeDocument, "version"> | null | undefined) => boolean;
//# sourceMappingURL=resume.snapshot.d.ts.map