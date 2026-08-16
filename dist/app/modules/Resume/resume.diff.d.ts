import { IResumeContent } from './resume.interface';
export interface ICvSectionChange {
    section: string;
    percent: number;
    changed: number;
    total: number;
}
export interface ICvChangeReport {
    /** 0-100, share of fields that differ from the approved version */
    percent: number;
    /** Fields present in both but with a different value */
    modified: number;
    /** Fields the candidate filled in that were not there before */
    added: number;
    /** Fields the candidate cleared */
    removed: number;
    /** Union of fields across both versions - the denominator */
    total: number;
    /** Section names that changed, for a human-readable summary */
    changedSections: string[];
    /** Per-section breakdown, biggest change first */
    sections: ICvSectionChange[];
    /**
     * The largest change within a single load-bearing section.
     *
     * The overall percentage alone lets a serious rewrite slip through: replacing
     * an entire work history moves under 40% of a full CV, because the untouched
     * contact details, education, skills and links dilute it. That is precisely
     * the edit a reviewer would want to see, so the sections that carry a CV's
     * substance are also measured on their own.
     */
    majorSectionPercent: number;
    /** Which section that was, when there is one */
    majorSection?: string;
}
/**
 * Compare a CV against the version that was approved.
 *
 * An empty baseline yields 0%: with nothing to compare against, treating the
 * whole CV as "100% changed" would send every legacy resume straight back into
 * the review queue the moment its owner fixed a typo.
 */
export declare const measureCvChange: (approved: IResumeContent | null | undefined, current: IResumeContent) => ICvChangeReport;
//# sourceMappingURL=resume.diff.d.ts.map