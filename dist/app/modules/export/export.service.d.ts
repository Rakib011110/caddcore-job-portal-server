import { SheetSpec } from './export.workbook';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPORT SERVICE - Sheet Builders
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Nine builders, one per tab of the institute's placement workbook. Each returns
 * a `SheetSpec` - columns and rows, no styling - which `export.workbook.ts`
 * turns into a formatted worksheet.
 *
 * Two rules hold across all of them:
 *
 *   - `.lean()` everywhere. These queries pull whole collections; hydrating
 *     thousands of Mongoose documents to read ten fields off each is the
 *     difference between a fast export and a timed-out one.
 *
 *   - Column ORDER is the contract. The institute's existing sheet has these
 *     columns in this order, and people have formulas and habits built on that.
 *     Add new columns at the END; do not reorder existing ones.
 */
export interface ExportFilters {
    /** Inclusive lower bound on the record's own date field. */
    from?: string | undefined;
    to?: string | undefined;
    status?: string | undefined;
    companyId?: string | undefined;
}
export declare const buildStudentSheet: (filters?: ExportFilters) => Promise<SheetSpec>;
export declare const buildEmployerSheet: (filters?: ExportFilters) => Promise<SheetSpec>;
export declare const buildVacancySheet: (filters?: ExportFilters) => Promise<SheetSpec>;
export declare const buildApplicationSheet: (filters?: ExportFilters) => Promise<SheetSpec>;
/**
 * One row per INTERVIEW, not per application.
 *
 * A candidate who sat three rounds is three rows here, which is what makes this
 * sheet different from the tracker above - the tracker only ever shows the
 * current round.
 */
export declare const buildInterviewSheet: (filters?: ExportFilters) => Promise<SheetSpec>;
export declare const buildPlacementSheet: (filters?: ExportFilters) => Promise<SheetSpec>;
export declare const buildFollowupSheet: (filters?: ExportFilters) => Promise<SheetSpec>;
export declare const buildKpiSheet: (filters?: ExportFilters) => Promise<SheetSpec>;
/**
 * A flat Metric/Value summary rather than a chart.
 *
 * Charts do not survive a generated export cleanly, and the number is what
 * anyone reading this sheet actually wants. The funnel is laid out top to
 * bottom so the drop-off between stages is visible at a glance.
 */
export declare const buildDashboardSheet: () => Promise<SheetSpec>;
/**
 * The single source of truth for which reports exist.
 *
 * The controller validates the `:sheet` URL parameter against these keys, and
 * the full workbook is built by running all of them - so a new report is added
 * here once and appears in both places.
 */
export declare const SHEET_BUILDERS: {
    readonly students: (filters?: ExportFilters) => Promise<SheetSpec>;
    readonly employers: (filters?: ExportFilters) => Promise<SheetSpec>;
    readonly vacancies: (filters?: ExportFilters) => Promise<SheetSpec>;
    readonly applications: (filters?: ExportFilters) => Promise<SheetSpec>;
    readonly interviews: (filters?: ExportFilters) => Promise<SheetSpec>;
    readonly placements: (filters?: ExportFilters) => Promise<SheetSpec>;
    readonly followups: (filters?: ExportFilters) => Promise<SheetSpec>;
    readonly kpi: (filters?: ExportFilters) => Promise<SheetSpec>;
    readonly dashboard: () => Promise<SheetSpec>;
};
export type SheetKey = keyof typeof SHEET_BUILDERS;
export declare const SHEET_KEYS: SheetKey[];
export declare const isSheetKey: (value: unknown) => value is SheetKey;
/** Download file name per report, without the date suffix or extension. */
export declare const SHEET_FILENAMES: Record<SheetKey, string>;
//# sourceMappingURL=export.service.d.ts.map