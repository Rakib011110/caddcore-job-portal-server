/** Whether this environment can actually produce PDFs. */
export declare const isPdfAvailable: () => Promise<boolean>;
/** Closes the shared browser. Call on shutdown so Chromium does not linger. */
export declare const shutdownPdfEngine: () => Promise<void>;
/**
 * Render a standalone HTML document to PDF bytes.
 *
 * `printBackground` is on because several templates carry a coloured header
 * band; without it the Modern layout prints as white-on-white.
 */
export declare const renderPdf: (html: string) => Promise<Buffer>;
//# sourceMappingURL=resume.pdf.d.ts.map