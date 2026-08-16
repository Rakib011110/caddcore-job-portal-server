"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeExportControllers = exports.exportResumeForReview = exports.exportPublicCandidateResume = exports.exportApplicationResume = exports.exportMyResume = exports.listTemplates = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = __importDefault(require("../../error/AppError"));
const resume_service_1 = require("./resume.service");
const Jobaplications_services_1 = require("../jobs/Jobaplications/Jobaplications.services");
const resume_document_1 = require("./resume.document");
const resume_pdf_1 = require("./resume.pdf");
const resume_constant_1 = require("./resume.constant");
const resume_templates_1 = require("./resume.templates");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CV EXPORT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Every CV leaves the system through here, in one of two formats:
 *
 *   .../export       → HTML, for the on-screen preview frames
 *   .../export.pdf   → a real PDF file, for downloading
 *
 * Both render the SAME document from `resume.document.ts`. The PDF is that HTML
 * printed by Chromium, which is what keeps every link in the file clickable and
 * what guarantees the preview matches the download.
 *
 * The other rule lives here too: once a CV is approved, it may only be exported
 * in the template it was approved in. Approval covers the layout as well as the
 * facts, so "approved in Classic ATS, downloaded in Two Column" is not
 * something a candidate can do. While the CV is a draft, every template is open
 * - that is when experimenting is useful.
 */
// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getUserId = (req) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Authentication required');
    }
    return userId;
};
/**
 * Decide which template an export may use.
 *
 * Returns the approved one for approved CVs (ignoring whatever the query asked
 * for), otherwise honours the request and falls back to the saved template.
 */
const resolveExportTemplate = (requested, resume) => {
    const approvedTemplate = resume.status === resume_constant_1.RESUME_STATUS.APPROVED ? resume.template : undefined;
    if (approvedTemplate && (0, resume_templates_1.isKnownTemplate)(approvedTemplate)) {
        return approvedTemplate;
    }
    if ((0, resume_templates_1.isKnownTemplate)(requested))
        return requested;
    if ((0, resume_templates_1.isKnownTemplate)(resume.template))
        return resume.template;
    return resume_templates_1.DEFAULT_RESUME_TEMPLATE_ID;
};
/** True when the caller asked for `.pdf` rather than the HTML preview. */
const wantsPdf = (req) => req.path.toLowerCase().endsWith('.pdf');
/**
 * Render and send a CV in whichever format the route asked for.
 *
 * The three export endpoints differ only in where the CV comes from and what
 * the stamp says, so the send logic - render, choose format, set headers - is
 * written once here.
 */
const sendResumeDocument = async (req, res, cv, options) => {
    const html = (0, resume_document_1.renderResumeDocument)(cv, options);
    const fileName = (0, resume_document_1.resumeFileName)(cv, options.template);
    // A CV is personal data - never let a proxy or CDN hold a copy.
    res.setHeader('Cache-Control', 'private, no-store');
    if (!wantsPdf(req)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}.html"`);
        res.send(html);
        return;
    }
    // No Chromium in this environment. Rather than fail the download, hand back
    // the same document as HTML and let the client fall back to printing it -
    // the client reads this header to decide which flow it got.
    if (!(await (0, resume_pdf_1.isPdfAvailable)())) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Cv-Export-Fallback', 'print');
        res.send(html);
        return;
    }
    const pdf = await (0, resume_pdf_1.renderPdf)(html);
    res.setHeader('Content-Type', 'application/pdf');
    // `attachment` is what makes the browser save the file straight away instead
    // of opening a viewer and a print dialog.
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
    res.setHeader('Content-Length', String(pdf.length));
    res.end(pdf);
};
// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/** The formats a CV may be built and approved in. */
exports.listTemplates = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'CV templates fetched successfully',
        data: resume_templates_1.RESUME_TEMPLATES,
    });
});
/** Candidate exporting their own CV. */
exports.exportMyResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = getUserId(req);
    const resume = await resume_service_1.ResumeService.getMyResumeById(userId, req.params.id);
    const template = resolveExportTemplate(req.query.template, resume);
    const cv = resume.toObject();
    const isApproved = resume.status === resume_constant_1.RESUME_STATUS.APPROVED;
    await sendResumeDocument(req, res, cv, {
        template,
        documentTitle: (0, resume_document_1.resumeFileName)(cv, template),
        ...(resume.sectionOrder?.length
            ? { sectionOrder: resume.sectionOrder }
            : {}),
        // Draft exports are stamped so an unapproved CV is never mistaken for a
        // reviewed one after it leaves the site.
        ...(isApproved
            ? {}
            : { watermark: 'DRAFT — not yet approved by CADD CORE' }),
    });
});
/**
 * Recruiter exporting the CV attached to an application.
 *
 * Always the frozen snapshot, always in the approved template - this is the
 * document of record for that application.
 */
exports.exportApplicationResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await Jobaplications_services_1.ApplicationService.getApplicationResume(req.params.id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This application has no CV attached.');
    }
    const appliedOn = result.appliedAt
        ? new Date(result.appliedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '';
    const snapshotOrder = result.resume
        .sectionOrder;
    await sendResumeDocument(req, res, result.resume, {
        template: result.template,
        documentTitle: (0, resume_document_1.resumeFileName)(result.resume, result.template),
        ...(snapshotOrder?.length ? { sectionOrder: snapshotOrder } : {}),
        watermark: `Submitted ${appliedOn} · CV version ${result.version}`,
    });
});
/**
 * Anyone downloading the CV from a public candidate profile.
 *
 * Always the approved content in the approved template - the same document an
 * employer receives with an application, so the CV a visitor downloads and the
 * CV that arrives in the applicant list cannot disagree.
 */
exports.exportPublicCandidateResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await resume_service_1.ResumeService.getPublicCandidateResume(req.params.userId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This candidate has no approved CV to download yet.');
    }
    const approvedOn = result.approvedAt
        ? new Date(result.approvedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '';
    await sendResumeDocument(req, res, result.resume, {
        template: result.template,
        documentTitle: (0, resume_document_1.resumeFileName)(result.resume, result.template),
        ...(result.resume.sectionOrder?.length
            ? { sectionOrder: result.resume.sectionOrder }
            : {}),
        // No DRAFT stamp: this endpoint only ever serves approved CVs.
        watermark: approvedOn
            ? `Approved by CADD CORE ${approvedOn} · CV version ${result.version}`
            : `Approved by CADD CORE · CV version ${result.version}`,
    });
});
/** Reviewer exporting a CV from the approval queue. */
exports.exportResumeForReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const resume = await resume_service_1.ResumeService.getResumeById(req.params.id);
    const template = resolveExportTemplate(req.query.template, resume);
    const cv = resume.toObject();
    await sendResumeDocument(req, res, cv, {
        template,
        documentTitle: (0, resume_document_1.resumeFileName)(cv, template),
        ...(resume.sectionOrder?.length
            ? { sectionOrder: resume.sectionOrder }
            : {}),
        watermark: `Review copy · status: ${resume.status} · v${resume.version}`,
    });
});
exports.ResumeExportControllers = {
    listTemplates: exports.listTemplates,
    exportMyResume: exports.exportMyResume,
    exportApplicationResume: exports.exportApplicationResume,
    exportPublicCandidateResume: exports.exportPublicCandidateResume,
    exportResumeForReview: exports.exportResumeForReview,
};
//# sourceMappingURL=resume.export.controller.js.map