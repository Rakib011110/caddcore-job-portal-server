import { z } from 'zod';
import { DELETE_TYPE, CHAT_LIMITS } from './chat.constant';

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

const createConversationSchema = z.object({
  body: z.object({
    participantId: z
      .string()
      .min(24, 'Invalid participant ID')
      .max(24, 'Invalid participant ID'),
  }),
});

const getConversationsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE),
    includeArchived: z.string().optional().transform(val => val === 'true'),
  }),
});

const conversationIdParamSchema = z.object({
  params: z.object({
    conversationId: z
      .string()
      .min(24, 'Invalid conversation ID')
      .max(24, 'Invalid conversation ID'),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE VALIDATIONS
// ─────────────────────────────────────────────────────────────────────────────

const sendMessageSchema = z.object({
  params: z.object({
    conversationId: z
      .string()
      .min(24, 'Invalid conversation ID'),
  }),
  body: z.object({
    content: z
      .string()
      .min(1, 'Message cannot be empty')
      .max(CHAT_LIMITS.MAX_MESSAGE_LENGTH, `Message cannot exceed ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} characters`),
  }),
});

const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z
      .string()
      .min(24, 'Invalid conversation ID'),
  }),
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : CHAT_LIMITS.MAX_MESSAGES_PER_PAGE),
    before: z.string().optional(),
  }),
});

const markAsReadSchema = z.object({
  params: z.object({
    messageId: z
      .string()
      .min(24, 'Invalid message ID')
      .max(24, 'Invalid message ID'),
  }),
});

const deleteMessageSchema = z.object({
  params: z.object({
    messageId: z
      .string()
      .min(24, 'Invalid message ID'),
  }),
  body: z.object({
    deleteType: z.enum([DELETE_TYPE.SELF, DELETE_TYPE.EVERYONE]),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// USER SEARCH VALIDATIONS
// ─────────────────────────────────────────────────────────────────────────────

const searchUsersSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, 'Search query cannot be empty'),
    role: z.enum(['USER', 'COMPANY', 'ADMIN']).optional(),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : CHAT_LIMITS.MAX_SEARCH_RESULTS),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN VALIDATIONS
// ─────────────────────────────────────────────────────────────────────────────

const adminGetConversationsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE),
    search: z.string().optional(),
    includeArchived: z.string().optional().transform(val => val === 'true'),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const ChatValidation = {
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
