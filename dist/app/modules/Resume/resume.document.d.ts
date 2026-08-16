import { IResumeContent } from './resume.interface';
export type SectionKey = 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'certifications' | 'languages' | 'awards' | 'references';
/** Section keys a `custom` layout may reorder. Validation reads this. */
export declare const RESUME_SECTION_KEYS: SectionKey[];
export interface IRenderResumeOptions {
    /** Template id from the shared registry. Unknown ids fall back to the default. */
    template?: string;
    /** Section order for the `custom` template */
    sectionOrder?: string[];
    /** Document title - becomes the PDF filename in most browsers */
    documentTitle?: string;
    /** Printed above the CV, e.g. "Approved 12 Aug 2026 · v3" */
    watermark?: string;
}
/** Render a CV to a standalone, print-ready HTML document. */
export declare const renderResumeDocument: (cv: IResumeContent, options?: IRenderResumeOptions) => string;
/** Filename-safe slug for downloads. Unicode names survive intact. */
export declare const resumeFileName: (cv: IResumeContent, template?: string) => string;
//# sourceMappingURL=resume.document.d.ts.map