import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import AppError from '../../error/AppError';
import { ResumeService } from './resume.service';
import { ApplicationService } from '../jobs/Jobaplications/Jobaplications.services';
import {
  IRenderResumeOptions,
  renderResumeDocument,
  resumeFileName,
} from './resume.document';
import { isPdfAvailable, renderPdf } from './resume.pdf';
import { IResumeContent } from './resume.interface';
import { RESUME_STATUS } from './resume.constant';
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_TEMPLATES,
  isKnownTemplate,
} from './resume.templates';

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

const getUserId = (req: Request): string => {
  const userId = (req as any).user?._id || (req as any).user?.id;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  return userId;
};

/**
 * Decide which template an export may use.
 *
 * Returns the approved one for approved CVs (ignoring whatever the query asked
 * for), otherwise honours the request and falls back to the saved template.
 */
const resolveExportTemplate = (
  requested: unknown,
  resume: { status?: string; template?: string }
): string => {
  const approvedTemplate =
    resume.status === RESUME_STATUS.APPROVED ? resume.template : undefined;

  if (approvedTemplate && isKnownTemplate(approvedTemplate)) {
    return approvedTemplate;
  }

  if (isKnownTemplate(requested)) return requested;
  if (isKnownTemplate(resume.template)) return resume.template;

  return DEFAULT_RESUME_TEMPLATE_ID;
};

/** True when the caller asked for `.pdf` rather than the HTML preview. */
const wantsPdf = (req: Request): boolean =>
  req.path.toLowerCase().endsWith('.pdf');

/**
 * Render and send a CV in whichever format the route asked for.
 *
 * The three export endpoints differ only in where the CV comes from and what
 * the stamp says, so the send logic - render, choose format, set headers - is
 * written once here.
 */
const sendResumeDocument = async (
  req: Request,
  res: Response,
  cv: IResumeContent,
  options: IRenderResumeOptions
): Promise<void> => {
  const html = renderResumeDocument(cv, options);
  const fileName = resumeFileName(cv, options.template);

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
  if (!(await isPdfAvailable())) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Cv-Export-Fallback', 'print');
    res.send(html);
    return;
  }

  const pdf = await renderPdf(html);

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
export const listTemplates = catchAsync(async (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'CV templates fetched successfully',
    data: RESUME_TEMPLATES,
  });
});

/** Candidate exporting their own CV. */
export const exportMyResume = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const resume = await ResumeService.getMyResumeById(
    userId,
    req.params.id as string
  );

  const template = resolveExportTemplate(req.query.template, resume);
  const cv = resume.toObject();
  const isApproved = resume.status === RESUME_STATUS.APPROVED;

  await sendResumeDocument(req, res, cv, {
    template,
    documentTitle: resumeFileName(cv, template),
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
export const exportApplicationResume = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ApplicationService.getApplicationResume(
      req.params.id as string
    );

    if (!result) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'This application has no CV attached.'
      );
    }

    const appliedOn = result.appliedAt
      ? new Date(result.appliedAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '';

    const snapshotOrder = (result.resume as { sectionOrder?: string[] })
      .sectionOrder;

    await sendResumeDocument(req, res, result.resume, {
      template: result.template,
      documentTitle: resumeFileName(result.resume, result.template),
      ...(snapshotOrder?.length ? { sectionOrder: snapshotOrder } : {}),
      watermark: `Submitted ${appliedOn} · CV version ${result.version}`,
    });
  }
);

/**
 * Anyone downloading the CV from a public candidate profile.
 *
 * Always the approved content in the approved template - the same document an
 * employer receives with an application, so the CV a visitor downloads and the
 * CV that arrives in the applicant list cannot disagree.
 */
export const exportPublicCandidateResume = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ResumeService.getPublicCandidateResume(
      req.params.userId as string
    );

    if (!result) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'This candidate has no approved CV to download yet.'
      );
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
      documentTitle: resumeFileName(result.resume, result.template),
      ...(result.resume.sectionOrder?.length
        ? { sectionOrder: result.resume.sectionOrder }
        : {}),
      // No DRAFT stamp: this endpoint only ever serves approved CVs.
      watermark: approvedOn
        ? `Approved by CADD CORE ${approvedOn} · CV version ${result.version}`
        : `Approved by CADD CORE · CV version ${result.version}`,
    });
  }
);

/** Reviewer exporting a CV from the approval queue. */
export const exportResumeForReview = catchAsync(
  async (req: Request, res: Response) => {
    // Already plain: the review lookup hands back the document spread with the
    // reviewer's badge summary, not a hydrated document - nothing to convert.
    const cv = await ResumeService.getResumeById(req.params.id as string);
    const template = resolveExportTemplate(req.query.template, cv);

    await sendResumeDocument(req, res, cv, {
      template,
      documentTitle: resumeFileName(cv, template),
      ...(cv.sectionOrder?.length ? { sectionOrder: cv.sectionOrder } : {}),
      watermark: `Review copy · status: ${cv.status} · v${cv.version}`,
    });
  }
);

export const ResumeExportControllers = {
  listTemplates,
  exportMyResume,
  exportApplicationResume,
  exportPublicCandidateResume,
  exportResumeForReview,
};
