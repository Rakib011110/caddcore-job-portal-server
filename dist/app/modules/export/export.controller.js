"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const export_workbook_1 = require("./export.workbook");
const export_service_1 = require("./export.service");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPORT CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Turns a report into an .xlsx download.
 *
 * These responses are binary, so they cannot go through `sendResponse` - the
 * headers are set by hand and the Buffer is written directly. That also means
 * an error thrown mid-write would corrupt a half-sent file, which is why the
 * workbook is fully built in memory BEFORE a single header goes out.
 */
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const readFilters = (req) => ({
    from: req.query.from,
    to: req.query.to,
    status: req.query.status,
    companyId: req.query.companyId,
});
/**
 * Write a finished workbook to the response as a download.
 *
 * `no-store` matters here: these files contain student phone numbers and
 * internal notes, and a proxy holding onto one is a data leak, not a
 * performance win.
 */
const sendWorkbook = (res, buffer, baseName) => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${baseName}-${date}.xlsx`;
    res.setHeader('Content-Type', XLSX_MIME);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader('Cache-Control', 'private, no-store');
    // Lets the browser read the name back when the download goes through fetch().
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.status(http_status_1.default.OK).send(buffer);
};
// ─────────────────────────────────────────────────────────────────────────────
// ONE REPORT
// ─────────────────────────────────────────────────────────────────────────────
const exportSheet = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { sheet } = req.params;
    if (!(0, export_service_1.isSheetKey)(sheet)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Unknown report "${sheet}". Valid reports: ${export_service_1.SHEET_KEYS.join(', ')}`);
    }
    const spec = await export_service_1.SHEET_BUILDERS[sheet](readFilters(req));
    const buffer = await (0, export_workbook_1.buildSingleSheetWorkbook)(spec);
    sendWorkbook(res, buffer, export_service_1.SHEET_FILENAMES[sheet]);
});
// ─────────────────────────────────────────────────────────────────────────────
// FULL WORKBOOK
// ─────────────────────────────────────────────────────────────────────────────
/**
 * All nine reports as one .xlsx, tabs in the institute's own order.
 *
 * Built sequentially rather than with Promise.all - each builder runs several
 * collection-wide queries, and firing all nine at once is a reliable way to
 * exhaust the Mongo connection pool on a small instance. The whole thing is a
 * few seconds either way.
 */
const exportFullWorkbook = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const filters = readFilters(req);
    const workbook = (0, export_workbook_1.createWorkbook)();
    for (const key of export_service_1.SHEET_KEYS) {
        const spec = await export_service_1.SHEET_BUILDERS[key](filters);
        (0, export_workbook_1.buildSheet)(workbook, spec);
    }
    const buffer = await (0, export_workbook_1.workbookToBuffer)(workbook);
    sendWorkbook(res, buffer, 'caddcore-placement-workbook');
});
// ─────────────────────────────────────────────────────────────────────────────
// CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * What the Reports page renders its cards from.
 *
 * Kept on the server so the descriptions the ⓘ tooltips show cannot drift away
 * from what the exporters actually produce.
 */
const REPORT_CATALOGUE = [
    {
        key: 'students',
        tab: '01 Student Database',
        title: 'Student Database',
        description: 'Every registered candidate with their CADD CORE student ID, batch, course, CV and portfolio links, job preferences and placement status.',
        supportsDateRange: true,
        dateRangeMeaning: 'Filters on registration date.',
    },
    {
        key: 'employers',
        tab: '02 Employer Database',
        title: 'Employer Database',
        description: 'Registered companies with contact person, industry, location, website, the roles they are currently hiring for and their approval status.',
        supportsDateRange: true,
        dateRangeMeaning: 'Filters on company registration date.',
    },
    {
        key: 'vacancies',
        tab: '03 Vacancy Database',
        title: 'Vacancy Database',
        description: 'All job posts with salary range, required skills, experience, deadline, work mode and vacancy count.',
        supportsDateRange: true,
        dateRangeMeaning: 'Filters on the date the job was posted.',
    },
    {
        key: 'applications',
        tab: '04 Application Tracker',
        title: 'Application Tracker',
        description: 'One row per application: who applied where, current status, whether a CV and cover letter went with it, and the follow-up state.',
        supportsDateRange: true,
        dateRangeMeaning: 'Filters on application date.',
    },
    {
        key: 'interviews',
        tab: '05 Interview Tracker',
        title: 'Interview Tracker',
        description: 'One row per interview round, not per candidate — a candidate who sat three rounds appears three times, with venue, interviewers, rating and feedback.',
        supportsDateRange: true,
        dateRangeMeaning: 'Filters on the interview date, not the application date.',
    },
    {
        key: 'placements',
        tab: '06 Placement Record',
        title: 'Placement Record',
        description: 'Confirmed hires with joining date, salary, placement source, employment status and the 6-month follow-up result.',
        supportsDateRange: true,
        dateRangeMeaning: 'Filters on when the application was last updated.',
    },
    {
        key: 'followups',
        tab: '07 Employer Follow-up',
        title: 'Employer Follow-up',
        description: "The placement cell's call log: who was contacted, when, why, what they said, their hiring need and the next action due.",
        supportsDateRange: true,
        dateRangeMeaning: 'Filters on contact date.',
    },
    {
        key: 'kpi',
        tab: '08 Monthly KPI',
        title: 'Monthly KPI',
        description: 'Month-by-month totals for students, employers contacted, vacancies, applications, interviews, selections, placements and placement rate, with a TOTAL row.',
        supportsDateRange: true,
        dateRangeMeaning: 'Sets the months covered. Defaults to the last 12 months.',
    },
    {
        key: 'dashboard',
        tab: '09 Dashboard',
        title: 'Dashboard Summary',
        description: 'A live snapshot of the placement funnel as Metric / Value / meaning rows, including shortlist, selection and rejection rates.',
        supportsDateRange: false,
        dateRangeMeaning: 'Always a live snapshot — date range does not apply.',
    },
];
const getReportCatalogue = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Report catalogue fetched successfully',
        data: REPORT_CATALOGUE,
    });
});
exports.ExportControllers = {
    exportSheet,
    exportFullWorkbook,
    getReportCatalogue,
};
//# sourceMappingURL=export.controller.js.map