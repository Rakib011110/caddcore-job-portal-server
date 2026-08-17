"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xlsxText = exports.xlsxList = exports.xlsxBool = exports.MONEY_FORMAT = exports.DATETIME_FORMAT = exports.DATE_FORMAT = exports.xlsxDate = exports.buildSingleSheetWorkbook = exports.workbookToBuffer = exports.createWorkbook = exports.buildSheet = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WORKBOOK BUILDER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The house style for every .xlsx this API produces: dark blue header band,
 * white bold header text, AutoFilter on row 1, and row 1 frozen so the headers
 * stay put while you scroll a thousand candidates.
 *
 * It exists so the sheets stay identical to each other. A report that looks
 * different depending on which endpoint made it is a report people stop
 * trusting, and there are nine of them here.
 *
 * Only `buildSheet` and `workbookToBuffer` are meant to be called from
 * services - everything else is the styling detail behind them.
 */
// ─────────────────────────────────────────────────────────────────────────────
// HOUSE STYLE
// ─────────────────────────────────────────────────────────────────────────────
/** Header band. ARGB, alpha first - ExcelJS rejects plain 6-digit hex. */
const HEADER_FILL = 'FF1F4E79';
const HEADER_TEXT = 'FFFFFFFF';
const BORDER_COLOR = 'FFD9D9D9';
/** Banding on even rows. Subtle on purpose - it should aid the eye, not shout. */
const ZEBRA_FILL = 'FFF7F9FC';
/** Excel's own cap. Longer names make the file unopenable, so we truncate. */
const MAX_SHEET_NAME = 31;
/** Column autofit bounds, in characters. */
const MIN_COL_WIDTH = 10;
const MAX_COL_WIDTH = 48;
// ─────────────────────────────────────────────────────────────────────────────
// SHEET BUILDER
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Excel forbids : \ / ? * [ ] in sheet names and caps them at 31 characters.
 * A bad name does not throw here - it produces a file Excel refuses to open,
 * which is much harder to debug. So it is sanitised rather than trusted.
 */
const safeSheetName = (name) => name.replace(/[:\\/?*[\]]/g, '-').slice(0, MAX_SHEET_NAME);
/** Size a column to its widest cell, within bounds. */
const autoFitColumn = (header, rows, columnIndex) => {
    let widest = header.length;
    for (const row of rows) {
        const value = row[columnIndex];
        if (value === null || value === undefined)
            continue;
        const length = value instanceof Date ? 10 : String(value).length;
        if (length > widest)
            widest = length;
        // Nothing beyond the cap matters, so stop measuring a 4,000-character
        // description field once it has already blown past it.
        if (widest >= MAX_COL_WIDTH)
            return MAX_COL_WIDTH;
    }
    return Math.min(Math.max(widest + 2, MIN_COL_WIDTH), MAX_COL_WIDTH);
};
/** Add one fully styled sheet to a workbook. */
const buildSheet = (workbook, spec) => {
    const sheet = workbook.addWorksheet(safeSheetName(spec.name), {
        views: [{ state: 'frozen', ySplit: 1 }],
    });
    // ── Columns ────────────────────────────────────────────────────────────────
    // `style` is spread in rather than set to undefined: with
    // exactOptionalPropertyTypes, an explicit `style: undefined` is not the same
    // as an absent key, and ExcelJS's types reject the former.
    sheet.columns = spec.columns.map((column, index) => ({
        header: column.header,
        key: `c${index}`,
        width: column.width ?? autoFitColumn(column.header, spec.rows, index),
        ...(column.numFmt ? { style: { numFmt: column.numFmt } } : {}),
    }));
    // ── Header band ────────────────────────────────────────────────────────────
    const headerRow = sheet.getRow(1);
    headerRow.height = 26;
    headerRow.font = { bold: true, size: 11, color: { argb: HEADER_TEXT } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
        cell.border = {
            top: { style: 'thin', color: { argb: HEADER_FILL } },
            left: { style: 'thin', color: { argb: HEADER_FILL } },
            bottom: { style: 'thin', color: { argb: HEADER_FILL } },
            right: { style: 'thin', color: { argb: HEADER_FILL } },
        };
    });
    // ── Data ───────────────────────────────────────────────────────────────────
    spec.rows.forEach((row, rowIndex) => {
        const added = sheet.addRow(row);
        added.alignment = { vertical: 'top', wrapText: false };
        if (rowIndex % 2 === 1) {
            added.eachCell({ includeEmpty: true }, (cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_FILL } };
            });
        }
        added.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
                right: { style: 'thin', color: { argb: BORDER_COLOR } },
            };
        });
    });
    // ── AutoFilter ─────────────────────────────────────────────────────────────
    // Only when there is at least one column; filtering an empty range is another
    // way to produce a file Excel will not open.
    if (spec.columns.length > 0) {
        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: spec.columns.length },
        };
    }
    // ── Footer note ────────────────────────────────────────────────────────────
    if (spec.note) {
        const noteRow = sheet.getRow(spec.rows.length + 3);
        noteRow.getCell(1).value = spec.note;
        noteRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF888888' } };
    }
    return sheet;
};
exports.buildSheet = buildSheet;
// ─────────────────────────────────────────────────────────────────────────────
// WORKBOOK
// ─────────────────────────────────────────────────────────────────────────────
const createWorkbook = () => {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'CADD CORE Job Portal';
    workbook.lastModifiedBy = 'CADD CORE Job Portal';
    workbook.created = new Date();
    workbook.modified = new Date();
    return workbook;
};
exports.createWorkbook = createWorkbook;
/** Serialise a workbook to the Buffer that gets written to the response. */
const workbookToBuffer = async (workbook) => {
    const data = await workbook.xlsx.writeBuffer();
    return Buffer.from(data);
};
exports.workbookToBuffer = workbookToBuffer;
/** One sheet in, .xlsx bytes out - the single-report path. */
const buildSingleSheetWorkbook = async (spec) => {
    const workbook = (0, exports.createWorkbook)();
    (0, exports.buildSheet)(workbook, spec);
    return (0, exports.workbookToBuffer)(workbook);
};
exports.buildSingleSheetWorkbook = buildSingleSheetWorkbook;
// ─────────────────────────────────────────────────────────────────────────────
// CELL FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Dates go in as real Date objects, not strings, so Excel can sort and filter
 * them as dates. `numFmt: DATE_FORMAT` on the column controls how they read.
 */
const xlsxDate = (value) => {
    if (!value)
        return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
exports.xlsxDate = xlsxDate;
exports.DATE_FORMAT = 'yyyy-mm-dd';
exports.DATETIME_FORMAT = 'yyyy-mm-dd hh:mm';
exports.MONEY_FORMAT = '#,##0';
/** Yes/No reads better than TRUE/FALSE in a report someone prints. */
const xlsxBool = (value) => value === undefined || value === null ? '' : value ? 'Yes' : 'No';
exports.xlsxBool = xlsxBool;
/** Collapse a list into one cell. */
const xlsxList = (value) => (value?.length ? value.filter(Boolean).join('; ') : '');
exports.xlsxList = xlsxList;
/** Strip HTML and collapse whitespace, for description columns. */
const xlsxText = (value, maxLength = 500) => {
    if (!value)
        return '';
    const plain = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return plain.length > maxLength ? `${plain.slice(0, maxLength)}...` : plain;
};
exports.xlsxText = xlsxText;
//# sourceMappingURL=export.workbook.js.map