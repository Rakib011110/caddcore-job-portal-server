"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCvCompleteness = void 0;
const filled = (value) => typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
/** Full credit at `target` entries, proportional credit below it. */
const listScore = (list, target) => {
    const count = Array.isArray(list) ? list.length : 0;
    return Math.min(count / target, 1);
};
/**
 * The weights add up to 100.
 *
 * Contact and experience carry the most because a CV missing either is not a
 * CV. Awards and references are worth little - they are nice to have, and a
 * candidate should never be told their CV is half-finished for lacking them.
 */
const SECTION_RULES = [
    {
        id: 'contact',
        label: 'Contact details',
        weight: 15,
        essential: true,
        hint: 'Add your full name, email and phone number so employers can reach you.',
        score: (cv) => {
            const parts = [cv.fullName, cv.email, cv.phone, cv.city];
            return parts.filter(filled).length / parts.length;
        },
    },
    {
        id: 'photo',
        label: 'Profile photo',
        weight: 5,
        essential: false,
        hint: 'Upload a clear headshot. Employers open CVs with a photo far more often.',
        score: (cv) => (filled(cv.profilePhoto) ? 1 : 0),
    },
    {
        id: 'headline',
        label: 'Headline and summary',
        weight: 12,
        essential: true,
        hint: 'Write a one-line headline and a short summary - this is the first thing a recruiter reads.',
        score: (cv) => {
            const hasHeadline = filled(cv.headline) || filled(cv.currentJobTitle);
            const hasSummary = filled(cv.summary) && String(cv.summary).trim().length >= 40;
            return (Number(hasHeadline) + Number(hasSummary)) / 2;
        },
    },
    {
        id: 'education',
        label: 'Education',
        weight: 15,
        essential: true,
        hint: 'Add at least one degree or diploma, with the institution and years.',
        score: (cv) => listScore(cv.education, 1),
    },
    {
        id: 'experience',
        label: 'Work experience',
        weight: 18,
        essential: false,
        hint: 'Add any jobs, internships or on-job training. Freshers can list training projects here.',
        score: (cv) => listScore(cv.workExperience, 1),
    },
    {
        id: 'skills',
        label: 'Skills',
        weight: 15,
        essential: true,
        hint: 'List at least four skills - this is what employers filter candidates by.',
        score: (cv) => listScore(cv.skills, 4),
    },
    {
        id: 'certifications',
        label: 'Certifications',
        weight: 8,
        essential: false,
        hint: 'Add your CADD CORE course certificates and any others you hold.',
        score: (cv) => listScore(cv.certifications, 1),
    },
    {
        id: 'projects',
        label: 'Projects',
        weight: 6,
        essential: false,
        hint: 'Add one or two projects with what you did and which tools you used.',
        score: (cv) => listScore(cv.projects, 1),
    },
    {
        id: 'languages',
        label: 'Languages',
        weight: 3,
        essential: false,
        hint: 'Add the languages you speak and how fluently.',
        score: (cv) => listScore(cv.languages, 1),
    },
    {
        id: 'links',
        label: 'Portfolio or LinkedIn',
        weight: 3,
        essential: false,
        hint: 'Add a LinkedIn, GitHub or portfolio link.',
        score: (cv) => {
            const links = cv.socialLinks;
            return links &&
                (filled(links.linkedin) ||
                    filled(links.github) ||
                    filled(links.portfolio) ||
                    filled(links.website))
                ? 1
                : 0;
        },
    },
];
/**
 * Score a CV.
 *
 * `readyThreshold` comes from settings so the institute can decide how complete
 * counts as job-ready without a code change.
 */
const calculateCvCompleteness = (cv, readyThreshold = 80) => {
    const content = cv || {};
    const sections = SECTION_RULES.map((rule) => {
        const ratio = Math.max(0, Math.min(1, rule.score(content)));
        const earned = Math.round(rule.weight * ratio);
        return {
            id: rule.id,
            label: rule.label,
            weight: rule.weight,
            hint: rule.hint,
            essential: rule.essential,
            earned,
            // Rounding can hand a section its full weight while a field is still
            // missing, so completeness is judged on the raw ratio, not on `earned`.
            complete: ratio >= 0.999,
        };
    });
    const percentage = Math.min(100, sections.reduce((total, section) => total + section.earned, 0));
    const nextSteps = sections
        .filter((section) => !section.complete)
        .sort((a, b) => {
        if (a.essential !== b.essential)
            return a.essential ? -1 : 1;
        return b.weight - a.weight;
    })
        .map((section) => ({
        id: section.id,
        label: section.label,
        hint: section.hint,
        pointsAvailable: section.weight - section.earned,
        essential: section.essential,
    }));
    return {
        percentage,
        sections,
        nextSteps,
        potential: Math.min(100, percentage + nextSteps.reduce((sum, step) => sum + step.pointsAvailable, 0)),
        isJobReady: percentage >= readyThreshold,
        readyThreshold,
    };
};
exports.calculateCvCompleteness = calculateCvCompleteness;
//# sourceMappingURL=resume.completeness.js.map