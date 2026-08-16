import type { Browser } from 'puppeteer';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CV → PDF
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Turns the canonical CV document into a real PDF file.
 *
 * Why a headless browser rather than a PDF library: the CV layout already
 * exists once, as HTML, in `resume.document.ts`. Any PDF library would mean
 * re-describing that layout in drawing primitives - a second implementation of
 * the same document, guaranteed to drift from the first. Chromium consumes the
 * HTML we already have.
 *
 * It is also the only route to clickable links. Rasterising HTML (html2canvas →
 * jsPDF, the usual shortcut) produces a picture of a CV: the portfolio and
 * GitHub URLs an employer wants to click become dead pixels. Chromium emits
 * real PDF link annotations, so every URL in the CV stays live in the file.
 *
 * Chromium is not available everywhere - some serverless platforms ship no
 * browser binary. `isPdfAvailable()` reports that honestly so callers can fall
 * back to the print flow instead of failing.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BROWSER LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

let browserPromise: Promise<Browser> | null = null;

/**
 * One browser for the process, launched on first use.
 *
 * A cold Chromium launch costs about a second; per-request launches would make
 * every download feel broken. Pages are still created and closed per request so
 * one CV can never see another's state.
 */
const getBrowser = async (): Promise<Browser> => {
  if (!browserPromise) {
    // Required in most containers: no user namespaces means no sandbox.
    const puppeteer = await import('puppeteer');
    browserPromise = puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    // A failed launch must not be cached, or every later request inherits it.
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }

  const browser = await browserPromise;

  // Chromium can die independently (OOM killer, crash). Relaunch rather than
  // handing back a dead handle.
  if (!browser.connected) {
    browserPromise = null;
    return getBrowser();
  }

  return browser;
};

/** Whether this environment can actually produce PDFs. */
export const isPdfAvailable = async (): Promise<boolean> => {
  try {
    await getBrowser();
    return true;
  } catch {
    return false;
  }
};

/** Closes the shared browser. Call on shutdown so Chromium does not linger. */
export const shutdownPdfEngine = async (): Promise<void> => {
  if (!browserPromise) return;

  try {
    const browser = await browserPromise;
    await browser.close();
  } catch {
    // Already gone - nothing to clean up.
  } finally {
    browserPromise = null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────────────────────

/** Guards against a malformed CV hanging a request forever. */
const RENDER_TIMEOUT_MS = 20_000;

/**
 * Render a standalone HTML document to PDF bytes.
 *
 * `printBackground` is on because several templates carry a coloured header
 * band; without it the Modern layout prints as white-on-white.
 */
export const renderPdf = async (html: string): Promise<Buffer> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    page.setDefaultTimeout(RENDER_TIMEOUT_MS);

    // `domcontentloaded` rather than `networkidle`: the document is fully
    // self-contained, so there is no network to wait for and waiting would just
    // add the idle timeout to every download.
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: RENDER_TIMEOUT_MS,
    });

    // Webfonts land after first paint and shift the layout under us.
    await page.evaluateHandle('document.fonts.ready');

    const bytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      // The document owns its own page margins in CSS (@page), so adding more
      // here would double them.
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });

    return Buffer.from(bytes);
  } finally {
    // Always close the page, even on a render failure, or the browser leaks a
    // tab per failed download.
    await page.close().catch(() => undefined);
  }
};
