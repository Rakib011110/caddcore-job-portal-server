import express from 'express';
import { ChatControllers } from './chat.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ChatValidation } from './chat.validation';

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAT ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * API endpoints for the Chat System
 * Base path: /api/v1/chat
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION ROUTES (Protected - All Authenticated Users)
// ─────────────────────────────────────────────────────────────────────────────

// Get all conversations for current user
router.get(
  '/conversations',
  auth(),
  ChatControllers.getConversations
);

// Get archived conversations
router.get(
  '/conversations/archived',
  auth(),
  ChatControllers.getArchivedConversations
);

// Create a new conversation
router.post(
  '/conversations',
  auth(),
  validateRequest(ChatValidation.createConversationSchema),
  ChatControllers.createConversation
);

// Get single conversation
router.get(
  '/conversations/:conversationId',
  auth(),
  ChatControllers.getConversationById
);

// Delete conversation (soft delete for user)
router.delete(
  '/conversations/:conversationId',
  auth(),
  ChatControllers.deleteConversation
);

// Archive conversation
router.patch(
  '/conversations/:conversationId/archive',
  auth(),
  ChatControllers.archiveConversation
);

// Unarchive conversation
router.patch(
  '/conversations/:conversationId/unarchive',
  auth(),
  ChatControllers.unarchiveConversation
);

// Mark all messages in conversation as read
router.patch(
  '/conversations/:conversationId/read',
  auth(),
  ChatControllers.markAllAsRead
);

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE ROUTES (Protected - All Authenticated Users)
// ─────────────────────────────────────────────────────────────────────────────

// Get messages for a conversation
router.get(
  '/conversations/:conversationId/messages',
  auth(),
  ChatControllers.getMessages
);

// Send a message
router.post(
  '/conversations/:conversationId/messages',
  auth(),
  validateRequest(ChatValidation.sendMessageSchema),
  ChatControllers.sendMessage
);

// Mark single message as read
router.patch(
  '/messages/:messageId/read',
  auth(),
  ChatControllers.markAsRead
);

// Delete a message
router.delete(
  '/messages/:messageId',
  auth(),
  validateRequest(ChatValidation.deleteMessageSchema),
  ChatControllers.deleteMessage
);

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY ROUTES (Protected - All Authenticated Users)
// ─────────────────────────────────────────────────────────────────────────────

// Get total unread count
router.get(
  '/unread-count',
  auth(),
  ChatControllers.getUnreadCount
);

// Search users to start chat
router.get(
  '/users/search',
  auth(),
  validateRequest(ChatValidation.searchUsersSchema),
  ChatControllers.searchUsers
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES (Protected - Admin Only)
// ─────────────────────────────────────────────────────────────────────────────

// Get all conversations (admin monitoring)
router.get(
  '/admin/conversations',
  auth(USER_ROLE.ADMIN),
  ChatControllers.adminGetAllConversations
);

// Get any conversation by ID
router.get(
  '/admin/conversations/:conversationId',
  auth(USER_ROLE.ADMIN),
  ChatControllers.adminGetConversationById
);

// Get messages from any conversation
router.get(
  '/admin/conversations/:conversationId/messages',
  auth(USER_ROLE.ADMIN),
  ChatControllers.adminGetMessages
);

export const ChatRoutes = router;
