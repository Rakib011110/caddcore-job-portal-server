"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("./chat.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const chat_validation_1 = require("./chat.validation");
const router = express_1.default.Router();
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
router.get('/conversations', (0, auth_1.default)(), chat_controller_1.ChatControllers.getConversations);
// Get archived conversations
router.get('/conversations/archived', (0, auth_1.default)(), chat_controller_1.ChatControllers.getArchivedConversations);
// Create a new conversation
router.post('/conversations', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.createConversationSchema), chat_controller_1.ChatControllers.createConversation);
// Get single conversation
router.get('/conversations/:conversationId', (0, auth_1.default)(), chat_controller_1.ChatControllers.getConversationById);
// Delete conversation (soft delete for user)
router.delete('/conversations/:conversationId', (0, auth_1.default)(), chat_controller_1.ChatControllers.deleteConversation);
// Archive conversation
router.patch('/conversations/:conversationId/archive', (0, auth_1.default)(), chat_controller_1.ChatControllers.archiveConversation);
// Unarchive conversation
router.patch('/conversations/:conversationId/unarchive', (0, auth_1.default)(), chat_controller_1.ChatControllers.unarchiveConversation);
// Mark all messages in conversation as read
router.patch('/conversations/:conversationId/read', (0, auth_1.default)(), chat_controller_1.ChatControllers.markAllAsRead);
// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE ROUTES (Protected - All Authenticated Users)
// ─────────────────────────────────────────────────────────────────────────────
// Get messages for a conversation
router.get('/conversations/:conversationId/messages', (0, auth_1.default)(), chat_controller_1.ChatControllers.getMessages);
// Send a message
router.post('/conversations/:conversationId/messages', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.sendMessageSchema), chat_controller_1.ChatControllers.sendMessage);
// Mark single message as read
router.patch('/messages/:messageId/read', (0, auth_1.default)(), chat_controller_1.ChatControllers.markAsRead);
// Delete a message
router.delete('/messages/:messageId', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.deleteMessageSchema), chat_controller_1.ChatControllers.deleteMessage);
// ─────────────────────────────────────────────────────────────────────────────
// UTILITY ROUTES (Protected - All Authenticated Users)
// ─────────────────────────────────────────────────────────────────────────────
// Get total unread count
router.get('/unread-count', (0, auth_1.default)(), chat_controller_1.ChatControllers.getUnreadCount);
// Search users to start chat
router.get('/users/search', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.searchUsersSchema), chat_controller_1.ChatControllers.searchUsers);
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES (Protected - Admin Only)
// ─────────────────────────────────────────────────────────────────────────────
// Get all conversations (admin monitoring)
router.get('/admin/conversations', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), chat_controller_1.ChatControllers.adminGetAllConversations);
// Get any conversation by ID
router.get('/admin/conversations/:conversationId', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), chat_controller_1.ChatControllers.adminGetConversationById);
// Get messages from any conversation
router.get('/admin/conversations/:conversationId/messages', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), chat_controller_1.ChatControllers.adminGetMessages);
exports.ChatRoutes = router;
//# sourceMappingURL=chat.routes.js.map