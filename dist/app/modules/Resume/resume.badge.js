"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeAffectingChange = exports.suggestBadge = void 0;
const verification_constant_1 = require("../Verification/verification.constant");
const EMPTY = {
    badge: null,
    reason: 'No CADD CORE courses claimed, so no badge is earned.',
    priorityScore: 0,
    label: '',
    description: '',
};
/**
 * Suggest a badge from what the candidate claimed.
 *
 * Tiering is by how far past "took a course" they got: a completed course earns
 * Bronze, one extra (on-job training OR internship) earns Silver, and both earn
 * Gold. Counting the extras rather than requiring on-job training specifically
 * means an internship-only candidate is not stuck at Bronze on a technicality.
 */
const suggestBadge = (credentials) => {
    if (!credentials?.isCaddcoreStudent)
        return EMPTY;
    const courseCount = credentials.courses?.length ?? 0;
    if (courseCount === 0)
        return EMPTY;
    const hasOjt = Boolean(credentials.hasOnJobTraining);
    const hasInternship = Boolean(credentials.hasInternship);
    const extras = Number(hasOjt) + Number(hasInternship);
    const badge = extras >= 2 ? 'gold' : extras === 1 ? 'silver' : 'bronze';
    const completed = [
        `${courseCount} course${courseCount === 1 ? '' : 's'}`,
        hasOjt ? 'on-job training' : null,
        hasInternship ? 'internship' : null,
    ].filter(Boolean);
    return {
        badge,
        reason: `Completed ${completed.join(' + ')}.`,
        priorityScore: verification_constant_1.BADGE_PRIORITY_SCORES[badge],
        label: verification_constant_1.BADGE_LABELS[badge],
        description: verification_constant_1.BADGE_DESCRIPTIONS[badge],
    };
};
exports.suggestBadge = suggestBadge;
/**
 * True when the credentials changed in a way that could change the badge.
 *
 * Used to tell a reviewer "these credentials are not the ones the current badge
 * was granted for". Editing a CV never revokes a badge - courses a person
 * completed do not un-complete - but a candidate who ADDS an internship should
 * have their tier looked at again rather than silently keeping Silver.
 */
const badgeAffectingChange = (before, after) => {
    const shape = (credentials) => ({
        isStudent: Boolean(credentials?.isCaddcoreStudent),
        courses: (credentials?.courses ?? [])
            .map((course) => course.courseId)
            .sort()
            .join(','),
        ojt: Boolean(credentials?.hasOnJobTraining),
        internship: Boolean(credentials?.hasInternship),
    });
    const a = shape(before);
    const b = shape(after);
    return (a.isStudent !== b.isStudent ||
        a.courses !== b.courses ||
        a.ojt !== b.ojt ||
        a.internship !== b.internship);
};
exports.badgeAffectingChange = badgeAffectingChange;
//# sourceMappingURL=resume.badge.js.map