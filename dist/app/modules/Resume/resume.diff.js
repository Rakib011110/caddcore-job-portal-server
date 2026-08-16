"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureCvChange = void 0;
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CV CHANGE MEASUREMENT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Answers "how much of this CV has changed since it was approved?" as a
 * percentage, so a small correction can be waved through while a rewrite goes
 * back for review.
 *
 * Measured FIELD BY FIELD, not by character count. A candidate rephrasing one
 * long summary would blow past a character threshold while barely changing the
 * CV; renaming three employers and swapping five skills changes it a great deal
 * while touching very little text. Counting fields matches what a reviewer
 * would call "a different CV", and it is explainable: "you changed 16 of 40
 * things".
 *
 * The comparison is always against the LAST APPROVED content, never against the
 * previous save. Ten six-percent edits should eventually add up to a re-review
 * rather than each passing individually and drifting the CV away from anything
 * a human ever looked at.
 */
// ─────────────────────────────────────────────────────────────────────────────
// FLATTENING
// ─────────────────────────────────────────────────────────────────────────────
/** Scalar CV fields, each counting as one comparable item. */
const SCALAR_FIELDS = [
    'fullName',
    'email',
    'phone',
    'address',
    'city',
    'country',
    'headline',
    'summary',
    'currentJobTitle',
    'totalExperienceYears',
    'expectedSalary',
];
/** Array sections, with the per-entry fields that are compared. */
const LIST_FIELDS = [
    {
        key: 'education',
        fields: [
            'degreeType',
            'degreeName',
            'institutionName',
            'location',
            'startYear',
            'endYear',
            'grade',
            'description',
        ],
    },
    {
        key: 'workExperience',
        fields: [
            'jobTitle',
            'companyName',
            'companyLocation',
            'employmentType',
            'startDate',
            'endDate',
            'isCurrentJob',
            'responsibilities',
            'achievements',
            'description',
        ],
    },
    { key: 'skills', fields: ['name', 'level', 'category'] },
    {
        key: 'projects',
        fields: [
            'title',
            'description',
            'role',
            'technologies',
            'projectUrl',
            'startDate',
            'endDate',
            'highlights',
        ],
    },
    {
        key: 'certifications',
        fields: [
            'name',
            'issuingOrganization',
            'issueDate',
            'expiryDate',
            'credentialId',
            'credentialUrl',
        ],
    },
    { key: 'languages', fields: ['name', 'proficiency'] },
    { key: 'awards', fields: ['title', 'issuer', 'date', 'description'] },
    {
        key: 'references',
        fields: ['name', 'position', 'company', 'email', 'phone', 'relationship'],
    },
];
const SOCIAL_FIELDS = ['linkedin', 'github', 'portfolio', 'twitter', 'website'];
/**
 * Reduce a value to a comparable string.
 *
 * Whitespace and case are ignored so re-indenting a bullet list or fixing
 * capitalisation does not register as a change - a reviewer would not call that
 * a different CV either.
 */
const normalise = (value) => {
    if (value === undefined || value === null)
        return '';
    if (Array.isArray(value)) {
        return value
            .map((v) => normalise(v))
            .filter(Boolean)
            .join('|');
    }
    if (typeof value === 'boolean')
        return value ? 'true' : 'false';
    return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
};
/**
 * Flatten a CV into `path -> value` pairs.
 *
 * List entries are keyed by position (`workExperience[0].jobTitle`). Positional
 * keys mean reordering jobs reads as a change, which is the honest answer: the
 * order of a CV is part of what a reviewer approved.
 */
const flatten = (cv) => {
    const out = new Map();
    SCALAR_FIELDS.forEach((field) => {
        const value = normalise(cv[field]);
        if (value)
            out.set(field, value);
    });
    LIST_FIELDS.forEach(({ key, fields }) => {
        const entries = cv[key] ?? [];
        entries.forEach((entry, index) => {
            fields.forEach((field) => {
                const value = normalise(entry?.[field]);
                if (value)
                    out.set(`${key}[${index}].${field}`, value);
            });
        });
    });
    const social = (cv.socialLinks ?? {});
    SOCIAL_FIELDS.forEach((field) => {
        const value = normalise(social[field]);
        if (value)
            out.set(`socialLinks.${field}`, value);
    });
    return out;
};
/**
 * Sections whose wholesale rewrite means "this is a different CV", regardless
 * of how little of the document by field count they represent.
 */
const CORE_SECTIONS = new Set([
    'fullName',
    'workExperience',
    'education',
    'skills',
    'projects',
]);
/** Sections small enough that a single edit would swamp their percentage. */
const MIN_SECTION_FIELDS = 3;
/** `workExperience[2].jobTitle` -> `workExperience` */
const sectionOf = (path) => path.split(/[[.]/)[0];
const EMPTY_REPORT = {
    percent: 0,
    modified: 0,
    added: 0,
    removed: 0,
    total: 0,
    changedSections: [],
    sections: [],
    majorSectionPercent: 0,
};
/**
 * Compare a CV against the version that was approved.
 *
 * An empty baseline yields 0%: with nothing to compare against, treating the
 * whole CV as "100% changed" would send every legacy resume straight back into
 * the review queue the moment its owner fixed a typo.
 */
const measureCvChange = (approved, current) => {
    if (!approved)
        return EMPTY_REPORT;
    const before = flatten(approved);
    const after = flatten(current);
    if (before.size === 0 && after.size === 0)
        return EMPTY_REPORT;
    const paths = new Set([...before.keys(), ...after.keys()]);
    const changedSections = new Set();
    /** section -> [changed, total] */
    const perSection = new Map();
    const bump = (section, didChange) => {
        const entry = perSection.get(section) ?? [0, 0];
        entry[1]++;
        if (didChange)
            entry[0]++;
        perSection.set(section, entry);
    };
    let modified = 0;
    let added = 0;
    let removed = 0;
    paths.forEach((path) => {
        const section = sectionOf(path);
        const wasThere = before.has(path);
        const isThere = after.has(path);
        if (wasThere && isThere) {
            const didChange = before.get(path) !== after.get(path);
            if (didChange) {
                modified++;
                changedSections.add(section);
            }
            bump(section, didChange);
            return;
        }
        if (isThere)
            added++;
        else
            removed++;
        changedSections.add(section);
        bump(section, true);
    });
    const total = paths.size;
    const changed = modified + added + removed;
    const sections = [...perSection.entries()]
        .map(([section, [c, t]]) => ({
        section,
        changed: c,
        total: t,
        percent: t === 0 ? 0 : Math.round((c / t) * 100),
    }))
        .sort((a, b) => b.percent - a.percent);
    // Tiny sections are excluded: a two-field section hits 50% the moment one
    // value changes, which would send every trivial edit back for review.
    const major = sections.find((s) => s.percent > 0 &&
        CORE_SECTIONS.has(s.section) &&
        s.total >= MIN_SECTION_FIELDS);
    return {
        percent: total === 0 ? 0 : Math.round((changed / total) * 100),
        modified,
        added,
        removed,
        total,
        changedSections: [...changedSections],
        sections,
        majorSectionPercent: major?.percent ?? 0,
        ...(major ? { majorSection: major.section } : {}),
    };
};
exports.measureCvChange = measureCvChange;
//# sourceMappingURL=resume.diff.js.map