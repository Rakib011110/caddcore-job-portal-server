"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeFileName = exports.renderResumeDocument = exports.RESUME_SECTION_KEYS = void 0;
const resume_templates_1 = require("./resume.templates");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CANONICAL CV DOCUMENT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * One renderer, on the server, for the printable CV.
 *
 * Before this, the candidate's download was drawn by the browser from their
 * live profile while the reviewer looked at a React component reading the
 * resume record. Two renderers, two data sources - so "the CV I approved" and
 * "the CV they downloaded" were never guaranteed to match.
 *
 * Everything printable now comes from here: candidate download, reviewer
 * archive, employer copy. Same input, same bytes.
 *
 * The output is a standalone HTML document with inline CSS and no external
 * requests, which is exactly what a PDF engine wants to consume.
 */
// ─────────────────────────────────────────────────────────────────────────────
// ESCAPING
// ─────────────────────────────────────────────────────────────────────────────
const ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
/** CV content is user-authored, so every value is escaped on the way in. */
const esc = (value) => {
    if (value === undefined || value === null)
        return '';
    return String(value).replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
};
/** Only http(s) links are emitted - `javascript:` hrefs would survive escaping. */
const safeUrl = (value) => {
    const raw = String(value ?? '').trim();
    if (!/^https?:\/\//i.test(raw))
        return '';
    return esc(raw);
};
/**
 * Shortens a URL for display without changing where it points.
 *
 * A full `https://www.linkedin.com/in/ariyan-rakib/` wraps onto two lines in a
 * contact header. The href keeps the real URL, so the PDF link still works -
 * only the label gets trimmed.
 */
const prettyUrl = (safe) => safe.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
const joinFilled = (parts, separator = ' • ') => parts
    .map((p) => String(p ?? '').trim())
    .filter(Boolean)
    .map(esc)
    .join(separator);
// ─────────────────────────────────────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────────────────────────────────────
const section = (title, body) => body.trim()
    ? `<section class="sec"><h2>${esc(title)}</h2>${body}</section>`
    : '';
const bullets = (items) => {
    const filled = (items ?? []).filter((i) => String(i ?? '').trim());
    if (!filled.length)
        return '';
    return `<ul>${filled.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
};
const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
/**
 * Renders a stored date the way a person writes it.
 *
 * The form fields store `YYYY-MM` because that is what `<input type="month">`
 * produces, and printing that raw put "2022-01 — Present" on the CV. Years are
 * passed through untouched, since education entries store a plain number, and
 * anything unrecognised is returned as typed rather than mangled.
 */
const formatDatePart = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw)
        return '';
    const match = /^(\d{4})-(\d{1,2})$/.exec(raw);
    if (!match)
        return raw;
    const monthIndex = Number(match[2]) - 1;
    const month = MONTHS[monthIndex];
    return month ? `${month} ${match[1]}` : match[1];
};
const dateRange = (start, end, current) => {
    const from = formatDatePart(start);
    const to = current ? 'Present' : formatDatePart(end);
    if (!from && !to)
        return '';
    return esc([from, to].filter(Boolean).join(' — '));
};
const renderSummary = (cv) => section('Professional Summary', cv.summary ? `<p>${esc(cv.summary)}</p>` : '');
const renderExperience = (cv) => section('Work Experience', (cv.workExperience ?? [])
    .map((job) => `
        <article class="entry">
          <div class="entry-head">
            <div>
              <h3>${esc(job.jobTitle)}</h3>
              <p class="muted">${joinFilled([job.companyName, job.companyLocation, job.employmentType])}</p>
            </div>
            <span class="dates">${dateRange(job.startDate, job.endDate, job.isCurrentJob)}</span>
          </div>
          ${job.description ? `<p>${esc(job.description)}</p>` : ''}
          ${bullets(job.responsibilities)}
          ${bullets(job.achievements)}
        </article>`)
    .join(''));
const renderEducation = (cv) => section('Education', (cv.education ?? [])
    .map((edu) => `
        <article class="entry">
          <div class="entry-head">
            <div>
              <h3>${joinFilled([edu.degreeType, edu.degreeName], ' in ')}</h3>
              <p class="muted">${joinFilled([edu.institutionName, edu.location, edu.grade])}</p>
            </div>
            <span class="dates">${dateRange(edu.startYear, edu.endYear, edu.isCurrentlyStudying)}</span>
          </div>
          ${edu.description ? `<p>${esc(edu.description)}</p>` : ''}
        </article>`)
    .join(''));
/**
 * Projects render the link as visible text, not a bare anchor.
 *
 * A printed CV is the common case and a hyperlink is invisible on paper, so the
 * URL has to survive the trip to PDF as readable characters.
 */
const renderProjects = (cv) => section('Projects', (cv.projects ?? [])
    .map((project) => {
    const url = safeUrl(project.projectUrl);
    return `
        <article class="entry">
          <div class="entry-head">
            <div>
              <h3>${esc(project.title)}</h3>
              <p class="muted">${joinFilled([project.role, (project.technologies ?? []).join(', ')])}</p>
            </div>
            <span class="dates">${dateRange(project.startDate, project.endDate)}</span>
          </div>
          ${project.description ? `<p>${esc(project.description)}</p>` : ''}
          ${bullets(project.highlights)}
          ${url ? `<p class="link"><a href="${url}">${prettyUrl(url)}</a></p>` : ''}
        </article>`;
})
    .join(''));
const renderSkills = (cv) => section('Skills', (cv.skills ?? []).length
    ? `<ul class="chips">${(cv.skills ?? [])
        .map((skill) => `<li>${esc(skill.name)}${skill.level ? `<span class="lvl">${esc(skill.level)}</span>` : ''}</li>`)
        .join('')}</ul>`
    : '');
const renderCertifications = (cv) => section('Certifications', (cv.certifications ?? [])
    .map((cert) => {
    const url = safeUrl(cert.credentialUrl);
    return `
        <article class="entry">
          <div class="entry-head">
            <div>
              <h3>${esc(cert.name)}</h3>
              <p class="muted">${joinFilled([cert.issuingOrganization, cert.credentialId])}</p>
            </div>
            <span class="dates">${dateRange(cert.issueDate, cert.expiryDate)}</span>
          </div>
          ${url ? `<p class="link"><a href="${url}">${prettyUrl(url)}</a></p>` : ''}
        </article>`;
})
    .join(''));
const renderLanguages = (cv) => section('Languages', (cv.languages ?? []).length
    ? `<ul class="chips">${(cv.languages ?? [])
        .map((lang) => `<li>${esc(lang.name)}<span class="lvl">${esc(lang.proficiency)}</span></li>`)
        .join('')}</ul>`
    : '');
const renderAwards = (cv) => section('Awards & Achievements', (cv.awards ?? [])
    .map((award) => `
        <article class="entry">
          <div class="entry-head">
            <div>
              <h3>${esc(award.title)}</h3>
              <p class="muted">${esc(award.issuer)}</p>
            </div>
            <span class="dates">${esc(award.date)}</span>
          </div>
          ${award.description ? `<p>${esc(award.description)}</p>` : ''}
        </article>`)
    .join(''));
const renderReferences = (cv) => section('References', (cv.references ?? [])
    .map((ref) => `
        <article class="entry">
          <h3>${esc(ref.name)}</h3>
          <p class="muted">${joinFilled([ref.position, ref.company, ref.relationship])}</p>
          <p class="muted">${joinFilled([ref.email, ref.phone])}</p>
        </article>`)
    .join(''));
/**
 * Contact line.
 *
 * Email and phone are anchors, not plain text, so they survive into the PDF as
 * clickable annotations - a recruiter can mail or ring the candidate straight
 * from the file. The visible text stays the plain address either way, because
 * the same document gets printed on paper.
 */
const renderContactLine = (cv) => {
    const parts = [];
    if (cv.email?.trim()) {
        const email = esc(cv.email.trim());
        parts.push(`<a href="mailto:${email}">${email}</a>`);
    }
    if (cv.phone?.trim()) {
        // `tel:` rejects spaces and dashes; the label keeps them for readability.
        const dialable = cv.phone.replace(/[^\d+]/g, '');
        parts.push(`<a href="tel:${esc(dialable)}">${esc(cv.phone.trim())}</a>`);
    }
    const place = joinFilled([cv.city, cv.country], ', ');
    if (place)
        parts.push(place);
    return parts.join(' • ');
};
const renderHeader = (cv, opts) => {
    const links = [
        cv.socialLinks?.linkedin,
        cv.socialLinks?.github,
        cv.socialLinks?.portfolio,
        cv.socialLinks?.website,
    ]
        .map((l) => safeUrl(l))
        .filter(Boolean);
    // The stamp lives inside the header rather than above it. Above, it pushed
    // the whole CV down by a line and collided with the bleed templates' banner.
    return `
    <header class="cv-head" data-bleed="${opts.bleed ? '1' : '0'}">
      <div class="cv-head-inner">
        ${opts.stamp ? `<span class="stamp">${esc(opts.stamp)}</span>` : ''}
        <h1>${esc(cv.fullName) || 'Candidate'}</h1>
        ${cv.headline || cv.currentJobTitle ? `<p class="role">${esc(cv.headline || cv.currentJobTitle)}</p>` : ''}
        <p class="contact">${renderContactLine(cv)}</p>
        ${links.length ? `<p class="contact links">${links.map((l) => `<a href="${l}">${prettyUrl(l)}</a>`).join(' • ')}</p>` : ''}
      </div>
    </header>`;
};
const RENDERERS = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    projects: renderProjects,
    skills: renderSkills,
    certifications: renderCertifications,
    languages: renderLanguages,
    awards: renderAwards,
    references: renderReferences,
};
/**
 * Default running order, and the only order the fixed templates use.
 *
 * Experience before education because most CVs are read by recruiters looking
 * for what someone has done, not where they studied.
 */
const DEFAULT_ORDER = [
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'languages',
    'awards',
    'references',
];
/** Section keys a `custom` layout may reorder. Validation reads this. */
exports.RESUME_SECTION_KEYS = DEFAULT_ORDER;
// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE STYLES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Per-template overrides, expressed only as custom-property values.
 *
 * Templates set variables rather than writing selectors. That keeps the page
 * geometry identical across all of them - a template changes how the CV looks,
 * never how much of it fits on a page, which is what makes approving a format
 * meaningful.
 *
 * It also removes a whole class of bug: the old overrides styled
 * `.cv-head .links a` only, so when the contact line gained `mailto:` and
 * `tel:` links they fell through to the browser default and rendered dark blue
 * on the dark navy header - effectively invisible. Header link colour is now a
 * variable every template must satisfy.
 */
const TEMPLATE_STYLES = {
    classic: `
    --rule: 2px solid #111;
    --h2-border: 1px solid #cbd5e1;`,
    modern: `
    --head-bg: #1e293b;
    --head-ink: #ffffff;
    --head-muted: #cbd5e1;
    --head-link: #93c5fd;
    --head-bleed: 1;
    --accent: #1e293b;
    --h2-color: #1e293b;
    --h2-border: 2px solid #1e293b;
    --rule: none;`,
    professional: `
    --accent: #0f172a;
    --h2-bg: #f1f5f9;
    --h2-pad: 5px 9px;
    --h2-border: none;
    --h2-edge: 3px solid #0f172a;
    --entry-box: 1px solid #e2e8f0;
    --entry-pad: 9px 11px;
    --rule: none;`,
    minimal: `
    --h2-color: #52525b;
    --h2-weight: 600;
    --h2-border: none;
    --h2-track: .16em;
    --rule: none;`,
    creative: `
    --accent: #7c3aed;
    --h2-color: #7c3aed;
    --h2-border: 1px solid #ddd6fe;
    --chip-bg: #f5f3ff;
    --rule: 3px solid #7c3aed;`,
    custom: `
    --h2-border: 1px solid #cbd5e1;
    --rule: 1px solid #cbd5e1;`,
};
/**
 * Templates whose header is a full-bleed colour band rather than plain text.
 *
 * Declared as data instead of being sniffed out of the CSS above: a band needs
 * a matching HTML attribute, and inferring that from a substring match would
 * break silently the moment someone reformatted a declaration.
 */
const BLEED_TEMPLATES = new Set(['modern']);
const BASE_STYLES = `
  :root {
    --ink: #1f2937;
    --muted: #64748b;
    --soft: #475569;
    --accent: #1f2937;
    --link: #1d4ed8;
    --chip-bg: #f1f5f9;

    /* Header. Light-on-white by default; dark templates flip these. */
    --head-bg: transparent;
    --head-ink: var(--ink);
    --head-muted: var(--soft);
    --head-link: var(--link);
    --head-bleed: 0;
    --rule: 1px solid #cbd5e1;

    /* Section headings */
    --h2-color: var(--accent);
    --h2-weight: 700;
    --h2-track: .09em;
    --h2-border: 1px solid #cbd5e1;
    --h2-bg: transparent;
    --h2-pad: 0 0 3px;
    --h2-edge: none;

    --entry-box: none;
    --entry-pad: 0;

    /* Horizontal page inset. Applied as element padding, not @page margin,
       because horizontal padding survives page breaks and vertical does not. */
    --side: 16mm;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 10.4pt;
    line-height: 1.45;
    color: var(--ink);
    background: #fff;
    /* Stops Chromium inflating text when a block is wider than expected. */
    -webkit-text-size-adjust: 100%;
  }

  .sheet { width: 210mm; margin: 0 auto; }

  /* ── Header ──────────────────────────────────────────────────────────── */

  /* The band (background) spans the full page width; the rule and the text
     share one inset. Putting the border on the outer element instead made it
     run edge-to-edge while the name sat 16mm in - a rule that lines up with
     nothing.

     The header also supplies page one's top space itself, because @page :first
     zeroes the engine margin there. That is what lets a banner reach the paper
     edge WITHOUT a negative margin - the previous minus-12mm margin-top pushed
     the name above the page box and the print engine simply clipped it. */
  .cv-head {
    padding: 12mm var(--side) 0;
    background: var(--head-bg);
    color: var(--head-ink);
  }
  .cv-head-inner {
    position: relative;
    padding-bottom: 8px;
    border-bottom: var(--rule);
  }

  /* Banner templates: a colour band that runs to the paper edge, so its
     breathing room is padding rather than a border. */
  .cv-head[data-bleed="1"] { padding: 11mm var(--side) 9mm; }
  .cv-head[data-bleed="1"] .cv-head-inner { padding-bottom: 0; border-bottom: 0; }
  .cv-head h1 { font-size: 21pt; margin: 0 0 2px; letter-spacing: -.4px; line-height: 1.15; }
  .cv-head .role { font-size: 11.5pt; color: var(--head-muted); margin: 0 0 6px; font-weight: 400; }
  .cv-head .contact { font-size: 9.4pt; color: var(--head-muted); margin: 2px 0; }
  .cv-head a { color: var(--head-link); text-decoration: none; }
  /* PDF viewers otherwise repaint followed links purple. */
  .cv-head a:visited { color: var(--head-link); }

  /* Anchored to the header's content box, so it lines up with the name in
     every template instead of needing a per-template offset. */
  .stamp {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 8pt;
    color: var(--head-muted);
    opacity: .85;
  }

  /* ── Body ────────────────────────────────────────────────────────────── */

  .cv-body { padding: 0 var(--side); }

  h2 {
    font-size: 9.6pt;
    text-transform: uppercase;
    letter-spacing: var(--h2-track);
    font-weight: var(--h2-weight);
    color: var(--h2-color);
    background: var(--h2-bg);
    border-bottom: var(--h2-border);
    border-left: var(--h2-edge);
    padding: var(--h2-pad);
    margin: 15px 0 8px;
  }
  .sec:first-child h2 { margin-top: 13px; }

  h3 { font-size: 10.8pt; margin: 0; font-weight: 700; }
  p { margin: 3px 0; }

  .muted { color: var(--muted); font-size: 9.4pt; margin: 1px 0 0; }
  .dates { font-size: 8.8pt; color: var(--muted); white-space: nowrap; padding-left: 12px; }

  /* entry-pad is 0 unless a template draws a box around entries, since
     padding without a border just looks like a stray indent. */
  .entry {
    margin-bottom: 10px;
    border: var(--entry-box);
    border-radius: 5px;
    padding: var(--entry-pad);
  }
  .entry:last-child { margin-bottom: 2px; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }

  ul { margin: 4px 0 0; padding-left: 16px; }
  li { margin-bottom: 2px; }

  .chips { list-style: none; padding: 0; margin: 4px 0 0; display: flex; flex-wrap: wrap; gap: 5px; }
  .chips li { background: var(--chip-bg); border-radius: 4px; padding: 3px 9px; font-size: 9.2pt; margin: 0; }
  .chips .lvl { color: var(--muted); font-size: 8.4pt; margin-left: 5px; }

  .link { margin-top: 3px; }
  .link a { color: var(--link); font-size: 9pt; text-decoration: none; word-break: break-word; }
  .link a:visited { color: var(--link); }

  /* ── Print ───────────────────────────────────────────────────────────── */

  /* Never split an entry across a page break - a job title stranded at the
     bottom of one page is the classic printed-CV failure. */
  .entry, .sec { break-inside: avoid; page-break-inside: avoid; }
  h2 { break-after: avoid; page-break-after: avoid; }

  /* Vertical margin lives here so EVERY page gets it, not just the first -
     without it, page two onwards would start hard against the paper edge.
     Horizontal stays 0 so a banner header can reach the edge. */
  @page { size: A4; margin: 12mm 0; }

  /* Page one's top space comes from the header instead, which is what lets a
     banner bleed to the edge without anything overflowing the page box. */
  @page :first { margin-top: 0; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet { width: auto; }
  }

  /* Screen has no @page margins; only the bottom needs replacing, since the
     header already owns the top. */
  @media screen {
    .sheet { padding-bottom: 12mm; min-height: 297mm; }
  }`;
/** Render a CV to a standalone, print-ready HTML document. */
const renderResumeDocument = (cv, options = {}) => {
    const templateId = (0, resume_templates_1.isKnownTemplate)(options.template)
        ? options.template
        : resume_templates_1.DEFAULT_RESUME_TEMPLATE_ID;
    // A custom order may be partial or stale (a section added after the candidate
    // set their order). Anything missing is appended in default order rather than
    // silently dropped - losing a section from a CV is far worse than an
    // unexpected position.
    const order = templateId === 'custom' && options.sectionOrder?.length
        ? (() => {
            const chosen = options.sectionOrder.filter((k) => k in RENDERERS);
            const missing = DEFAULT_ORDER.filter((k) => !chosen.includes(k));
            return [...chosen, ...missing];
        })()
        : DEFAULT_ORDER;
    const body = order.map((key) => RENDERERS[key](cv)).join('');
    const title = options.documentTitle || `${cv.fullName || 'Candidate'} CV`;
    // Template variables ride on `.sheet` rather than `:root` so the defaults in
    // BASE_STYLES stay the fallback for anything a template does not set.
    const templateVars = TEMPLATE_STYLES[templateId] ?? '';
    const bleed = BLEED_TEMPLATES.has(templateId);
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
${BASE_STYLES}
.sheet {${templateVars}
}
</style>
</head>
<body>
<div class="sheet">
${renderHeader(cv, { bleed, ...(options.watermark ? { stamp: options.watermark } : {}) })}
<main class="cv-body">
${body}
</main>
</div>
</body>
</html>`;
};
exports.renderResumeDocument = renderResumeDocument;
/** Filename-safe slug for downloads. Unicode names survive intact. */
const resumeFileName = (cv, template) => {
    const name = String(cv.fullName || 'Candidate')
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, '_')
        .replace(/^_+|_+$/g, '');
    return `${name || 'Candidate'}_CV_${(0, resume_templates_1.getTemplate)(template).name.replace(/\s+/g, '')}`;
};
exports.resumeFileName = resumeFileName;
//# sourceMappingURL=resume.document.js.map