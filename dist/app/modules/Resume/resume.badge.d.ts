import { ICaddcoreCredentials } from './resume.interface';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BADGE DERIVATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Which badge a set of CADD CORE credentials earns.
 *
 * The tiers were always a description of what the candidate completed, so the
 * badge is derived from the claims rather than picked from a dropdown. What a
 * reviewer actually decides is whether the claims are TRUE - and that is a
 * yes/no on approving the CV, not a separate tier choice.
 *
 * The reviewer can still override the suggestion, because "claims on-job
 * training but attached no certificate" is a real case and the honest answer
 * there is Bronze, not Silver.
 *
 * Platinum is not derivable and never appears here: it means "placed through
 * CADD CORE" and is awarded automatically when a candidate is hired.
 */
export type DerivableBadge = 'bronze' | 'silver' | 'gold';
export type BadgeType = DerivableBadge | 'platinum';
export interface BadgeSuggestion {
    /** null when the credentials do not earn any badge. */
    badge: DerivableBadge | null;
    /** Why this tier, in one line - shown to the reviewer next to the choice. */
    reason: string;
    priorityScore: number;
    label: string;
    description: string;
}
/**
 * Suggest a badge from what the candidate claimed.
 *
 * Tiering is by how far past "took a course" they got: a completed course earns
 * Bronze, one extra (on-job training OR internship) earns Silver, and both earn
 * Gold. Counting the extras rather than requiring on-job training specifically
 * means an internship-only candidate is not stuck at Bronze on a technicality.
 */
export declare const suggestBadge: (credentials?: ICaddcoreCredentials | null) => BadgeSuggestion;
/**
 * True when the credentials changed in a way that could change the badge.
 *
 * Used to tell a reviewer "these credentials are not the ones the current badge
 * was granted for". Editing a CV never revokes a badge - courses a person
 * completed do not un-complete - but a candidate who ADDS an internship should
 * have their tier looked at again rather than silently keeping Silver.
 */
export declare const badgeAffectingChange: (before?: ICaddcoreCredentials | null, after?: ICaddcoreCredentials | null) => boolean;
//# sourceMappingURL=resume.badge.d.ts.map