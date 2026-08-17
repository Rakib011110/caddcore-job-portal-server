import { IResumeContent } from './resume.interface';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CV COMPLETENESS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * How finished is this candidate's CV, and what should they do next.
 *
 * There is no uploaded-file path here on purpose. On this portal the CV IS the
 * profile - candidates build it in the CV builder and nobody attaches a PDF from
 * elsewhere. So completeness is measured against the CV's own sections, and the
 * old `User.cvUrl` upload plays no part in the score.
 *
 * The output is deliberately more than a number. A bare "65%" tells a candidate
 * nothing they can act on; `nextSteps` tells them which section to open and
 * exactly how many points it is worth, which is the difference between a bar
 * people ignore and one they finish.
 */
export interface CompletenessSection {
    /** Stable id - the client uses it to deep-link into the right builder tab. */
    id: string;
    label: string;
    /** Points this section contributes out of 100. */
    weight: number;
    /** Shown when the section is incomplete. Phrased as an instruction. */
    hint: string;
    /** True when a CV cannot be considered usable without it. */
    essential: boolean;
    /** How many points the CV currently earns here, 0..weight. */
    earned: number;
    complete: boolean;
}
export interface CompletenessResult {
    /** 0..100 */
    percentage: number;
    sections: CompletenessSection[];
    /**
     * What to do next, biggest win first. Essential gaps are always listed above
     * optional ones even when an optional section is worth more points - being
     * told to add a portfolio while your education section is empty is bad
     * advice, however many points it scores.
     */
    nextSteps: Array<{
        id: string;
        label: string;
        hint: string;
        pointsAvailable: number;
        essential: boolean;
    }>;
    /** Percentage this CV would reach if every remaining step were done. */
    potential: number;
    /** True once `percentage` meets the configured job-ready threshold. */
    isJobReady: boolean;
    readyThreshold: number;
}
/**
 * Score a CV.
 *
 * `readyThreshold` comes from settings so the institute can decide how complete
 * counts as job-ready without a code change.
 */
export declare const calculateCvCompleteness: (cv: Partial<IResumeContent> | null | undefined, readyThreshold?: number) => CompletenessResult;
//# sourceMappingURL=resume.completeness.d.ts.map