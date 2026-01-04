"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAT CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Constants and enums for the Chat System module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSearchableFields = exports.ConversationSearchableFields = exports.CHAT_LIMITS = exports.DELETE_TYPE = exports.CONVERSATION_TYPE = exports.MESSAGE_STATUS = void 0;
// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE STATUS
// ─────────────────────────────────────────────────────────────────────────────
exports.MESSAGE_STATUS = {
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
};
// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION TYPE
// ─────────────────────────────────────────────────────────────────────────────
exports.CONVERSATION_TYPE = {
    PRIVATE: 'PRIVATE', // One-to-one chat
    GROUP: 'GROUP', // Future: group chat support
};
// ─────────────────────────────────────────────────────────────────────────────
// DELETE TYPE - For message deletion
// ─────────────────────────────────────────────────────────────────────────────
exports.DELETE_TYPE = {
    SELF: 'SELF', // Delete only for the user who deleted
    EVERYONE: 'EVERYONE', // Delete for all participants (shows "Message deleted")
};
// ─────────────────────────────────────────────────────────────────────────────
// CHAT LIMITS
// ─────────────────────────────────────────────────────────────────────────────
exports.CHAT_LIMITS = {
    MAX_MESSAGE_LENGTH: 2000, // Maximum characters per message
    MAX_MESSAGES_PER_PAGE: 50, // Pagination limit for messages
    MAX_CONVERSATIONS_PER_PAGE: 20, // Pagination limit for conversations
    MAX_SEARCH_RESULTS: 10, // Maximum users in search results
    POLLING_INTERVAL_SECONDS: 5, // Recommended polling interval
};
// ─────────────────────────────────────────────────────────────────────────────
// SEARCHABLE FIELDS
// ─────────────────────────────────────────────────────────────────────────────
exports.ConversationSearchableFields = [
    'participants',
];
exports.MessageSearchableFields = [
    'content',
    'sender',
];
//# sourceMappingURL=chat.constant.js.map