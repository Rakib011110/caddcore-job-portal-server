"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CV TEMPLATE REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The one place a CV format is defined.
 *
 * These ids used to be duplicated in three files with three different sets of
 * labels - the candidate picked "Modern", the reviewer approved "Executive
 * Corporate", and nobody could tell they were the same thing. Both sides now
 * read this list, so the format a candidate submits is the format the reviewer
 * approves and the format the employer receives.
 *
 * Keep this file in sync with its client twin at
 * `caddcore-job-portal-client-code/src/lib/cv/templates.ts`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplate = exports.isKnownTemplate = exports.RESUME_TEMPLATE_IDS = exports.DEFAULT_RESUME_TEMPLATE_ID = exports.RESUME_TEMPLATES = void 0;
exports.RESUME_TEMPLATES = [
    {
        id: 'classic',
        name: 'Classic ATS',
        description: 'Single column, plain headings. The safest choice when an employer screens CVs with software.',
        atsSafe: true,
    },
    {
        id: 'modern',
        name: 'Modern Executive',
        description: 'Dark header band with a structured body. Clean and corporate.',
        atsSafe: true,
    },
    {
        id: 'professional',
        name: 'Professional Grid',
        description: 'Formal card layout that groups each section clearly.',
        atsSafe: true,
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Typography and whitespace only. Nothing to distract.',
        atsSafe: true,
    },
    {
        id: 'creative',
        name: 'Two Column',
        description: 'Sidebar for skills and contact, main column for experience. Best for design and portfolio roles.',
        atsSafe: false,
    },
    {
        id: 'custom',
        name: 'Custom Order',
        description: 'Same content, your section order. Useful when one section deserves the top of the page.',
        atsSafe: false,
    },
];
exports.DEFAULT_RESUME_TEMPLATE_ID = 'classic';
exports.RESUME_TEMPLATE_IDS = exports.RESUME_TEMPLATES.map((t) => t.id);
const isKnownTemplate = (id) => typeof id === 'string' && exports.RESUME_TEMPLATE_IDS.includes(id);
exports.isKnownTemplate = isKnownTemplate;
const getTemplate = (id) => exports.RESUME_TEMPLATES.find((t) => t.id === id) ??
    exports.RESUME_TEMPLATES.find((t) => t.id === exports.DEFAULT_RESUME_TEMPLATE_ID);
exports.getTemplate = getTemplate;
//# sourceMappingURL=resume.templates.js.map