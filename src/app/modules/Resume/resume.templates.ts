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

export interface IResumeTemplate {
  id: string;
  /** Shown to everyone - candidate, reviewer and employer alike */
  name: string;
  description: string;
  /** True when the layout survives automated CV parsers */
  atsSafe: boolean;
}

export const RESUME_TEMPLATES: IResumeTemplate[] = [
  {
    id: 'classic',
    name: 'Classic ATS',
    description:
      'Single column, plain headings. The safest choice when an employer screens CVs with software.',
    atsSafe: true,
  },
  {
    id: 'modern',
    name: 'Modern Executive',
    description:
      'Dark header band with a structured body. Clean and corporate.',
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
    description:
      'Sidebar for skills and contact, main column for experience. Best for design and portfolio roles.',
    atsSafe: false,
  },
  {
    id: 'custom',
    name: 'Custom Order',
    description:
      'Same content, your section order. Useful when one section deserves the top of the page.',
    atsSafe: false,
  },
];

export const DEFAULT_RESUME_TEMPLATE_ID = 'classic';

export const RESUME_TEMPLATE_IDS = RESUME_TEMPLATES.map((t) => t.id);

export const isKnownTemplate = (id: unknown): id is string =>
  typeof id === 'string' && RESUME_TEMPLATE_IDS.includes(id);

export const getTemplate = (id: unknown): IResumeTemplate =>
  RESUME_TEMPLATES.find((t) => t.id === id) ??
  (RESUME_TEMPLATES.find((t) => t.id === DEFAULT_RESUME_TEMPLATE_ID) as IResumeTemplate);
