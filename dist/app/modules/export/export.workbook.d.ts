import ExcelJS from 'exceljs';
export type CellValue = string | number | boolean | Date | null | undefined;
export interface SheetColumn {
    /** Header text shown in row 1. */
    header: string;
    /**
     * Number format for the whole column, e.g. 'yyyy-mm-dd' for dates or
     * '#,##0' for money. Left off, Excel decides for itself.
     */
    numFmt?: string;
    /** Fixed width in characters. Left off, the column is sized from its content. */
    width?: number;
}
export interface SheetSpec {
    /** Tab name, e.g. "01 Student Database". Truncated to 31 chars. */
    name: string;
    columns: SheetColumn[];
    rows: CellValue[][];
    /**
     * Optional note dropped two rows under the data - used for "generated at"
     * lines and for explaining an empty sheet.
     */
    note?: string;
}
/** Add one fully styled sheet to a workbook. */
export declare const buildSheet: (workbook: ExcelJS.Workbook, spec: SheetSpec) => ExcelJS.Worksheet;
export declare const createWorkbook: () => ExcelJS.Workbook;
/** Serialise a workbook to the Buffer that gets written to the response. */
export declare const workbookToBuffer: (workbook: ExcelJS.Workbook) => Promise<Buffer>;
/** One sheet in, .xlsx bytes out - the single-report path. */
export declare const buildSingleSheetWorkbook: (spec: SheetSpec) => Promise<Buffer>;
/**
 * Dates go in as real Date objects, not strings, so Excel can sort and filter
 * them as dates. `numFmt: DATE_FORMAT` on the column controls how they read.
 */
export declare const xlsxDate: (value?: Date | string | null) => Date | null;
export declare const DATE_FORMAT = "yyyy-mm-dd";
export declare const DATETIME_FORMAT = "yyyy-mm-dd hh:mm";
export declare const MONEY_FORMAT = "#,##0";
/** Yes/No reads better than TRUE/FALSE in a report someone prints. */
export declare const xlsxBool: (value?: boolean | null) => string;
/** Collapse a list into one cell. */
export declare const xlsxList: (value?: Array<string | number | null | undefined> | null) => string;
/** Strip HTML and collapse whitespace, for description columns. */
export declare const xlsxText: (value?: string | null, maxLength?: number) => string;
//# sourceMappingURL=export.workbook.d.ts.map