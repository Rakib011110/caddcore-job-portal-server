"use strict";
/**
 * Configuration for hidden member IDs
 *
 * These member IDs will be excluded from reference selection searches.
 * Add member IDs here to prevent them from appearing in the reference member search results.
 *
 * Usage:
 * - Add a member ID to the array to hide them from searches
 * - Remove a member ID to make them searchable again
 * - Keep the format as 'M-BASE-XXXXX'
 *
 * Example:
 * export const HIDDEN_MEMBER_IDS = [
 *   'M-BASE-00010',
 *   'M-BASE-00020',
 *   'M-BASE-00030',
 * ];
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHiddenMemberIds = exports.isHiddenMemberId = exports.HIDDEN_MEMBER_IDS = void 0;
exports.HIDDEN_MEMBER_IDS = [
    'M-BASE-00010', // Default hidden member ID
    // Add more member IDs below as needed:
    // 'M-BASE-00020',
    // 'M-BASE-00030',
];
/**
 * Check if a member ID is hidden
 * @param membershipId - The membership ID to check
 * @returns true if the member ID is hidden, false otherwise
 */
const isHiddenMemberId = (membershipId) => {
    return exports.HIDDEN_MEMBER_IDS.includes(membershipId);
};
exports.isHiddenMemberId = isHiddenMemberId;
/**
 * Get all hidden member IDs
 * @returns Array of hidden member IDs
 */
const getHiddenMemberIds = () => {
    return [...exports.HIDDEN_MEMBER_IDS];
};
exports.getHiddenMemberIds = getHiddenMemberIds;
//# sourceMappingURL=hiddenMembers.config.js.map