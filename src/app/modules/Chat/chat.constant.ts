/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAT CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Constants and enums for the Chat System module.
 */

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE STATUS
// ─────────────────────────────────────────────────────────────────────────────

export const MESSAGE_STATUS = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION TYPE
// ─────────────────────────────────────────────────────────────────────────────

export const CONVERSATION_TYPE = {
  PRIVATE: 'PRIVATE',     // One-to-one chat
  GROUP: 'GROUP',         // Future: group chat support
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DELETE TYPE - For message deletion
// ─────────────────────────────────────────────────────────────────────────────

export const DELETE_TYPE = {
  SELF: 'SELF',           // Delete only for the user who deleted
  EVERYONE: 'EVERYONE',   // Delete for all participants (shows "Message deleted")
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CHAT LIMITS
// ─────────────────────────────────────────────────────────────────────────────

export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,           // Maximum characters per message
  MAX_MESSAGES_PER_PAGE: 50,          // Pagination limit for messages
  MAX_CONVERSATIONS_PER_PAGE: 20,     // Pagination limit for conversations
  MAX_SEARCH_RESULTS: 10,             // Maximum users in search results
  POLLING_INTERVAL_SECONDS: 5,        // Recommended polling interval
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SEARCHABLE FIELDS
// ─────────────────────────────────────────────────────────────────────────────

export const ConversationSearchableFields = [
  'participants',
];

export const MessageSearchableFields = [
  'content',
  'sender',
];
