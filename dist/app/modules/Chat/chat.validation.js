"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatValidation = void 0;
const zod_1 = require("zod");
const chat_constant_1 = require("./chat.constant");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAT VALIDATION SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Zod validation schemas for Chat API endpoints
 */
// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION VALIDATIONS
// ─────────────────────────────────────────────────────────────────────────────
const createConversationSchema = zod_1.z.object({
    body: zod_1.z.object({
        participantId: zod_1.z
            .string()
            .min(24, 'Invalid participant ID')
            .max(24, 'Invalid participant ID'),
    }),
});
const getConversationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : chat_constant_1.CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE),
        includeArchived: zod_1.z.string().optional().transform(val => val === 'true'),
    }),
});
const conversationIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        conversationId: zod_1.z
            .string()
            .min(24, 'Invalid conversation ID')
            .max(24, 'Invalid conversation ID'),
    }),
});
// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE VALIDATIONS
// ─────────────────────────────────────────────────────────────────────────────
const sendMessageSchema = zod_1.z.object({
    params: zod_1.z.object({
        conversationId: zod_1.z
            .string()
            .min(24, 'Invalid conversation ID'),
    }),
    body: zod_1.z.object({
        content: zod_1.z
            .string()
            .min(1, 'Message cannot be empty')
            .max(chat_constant_1.CHAT_LIMITS.MAX_MESSAGE_LENGTH, `Message cannot exceed ${chat_constant_1.CHAT_LIMITS.MAX_MESSAGE_LENGTH} characters`),
    }),
});
const getMessagesSchema = zod_1.z.object({
    params: zod_1.z.object({
        conversationId: zod_1.z
            .string()
            .min(24, 'Invalid conversation ID'),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : chat_constant_1.CHAT_LIMITS.MAX_MESSAGES_PER_PAGE),
        before: zod_1.z.string().optional(),
    }),
});
const markAsReadSchema = zod_1.z.object({
    params: zod_1.z.object({
        messageId: zod_1.z
            .string()
            .min(24, 'Invalid message ID')
            .max(24, 'Invalid message ID'),
    }),
});
const deleteMessageSchema = zod_1.z.object({
    params: zod_1.z.object({
        messageId: zod_1.z
            .string()
            .min(24, 'Invalid message ID'),
    }),
    body: zod_1.z.object({
        deleteType: zod_1.z.enum([chat_constant_1.DELETE_TYPE.SELF, chat_constant_1.DELETE_TYPE.EVERYONE]),
    }),
});
// ─────────────────────────────────────────────────────────────────────────────
// USER SEARCH VALIDATIONS
// ─────────────────────────────────────────────────────────────────────────────
const searchUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        q: zod_1.z
            .string()
            .min(1, 'Search query cannot be empty'),
        role: zod_1.z.enum(['USER', 'COMPANY', 'ADMIN']).optional(),
        limit: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : chat_constant_1.CHAT_LIMITS.MAX_SEARCH_RESULTS),
    }),
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN VALIDATIONS
// ─────────────────────────────────────────────────────────────────────────────
const adminGetConversationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : chat_constant_1.CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE),
        search: zod_1.z.string().optional(),
        includeArchived: zod_1.z.string().optional().transform(val => val === 'true'),
    }),
});
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
exports.ChatValidation = {
    // Conversation
    createConversationSchema,
    getConversationsSchema,
    conversationIdParamSchema,
    // Messages
    sendMessageSchema,
    getMessagesSchema,
    markAsReadSchema,
    deleteMessageSchema,
    // Search
    searchUsersSchema,
    // Admin
    adminGetConversationsSchema,
};
//# sourceMappingURL=chat.validation.js.map