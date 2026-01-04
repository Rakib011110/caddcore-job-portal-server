"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const chat_service_1 = require("./chat.service");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAT CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Request handlers for Chat API endpoints
 */
// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Create a new conversation
 */
const createConversation = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    const conversation = await chat_service_1.ChatServices.createConversation(userId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Conversation created successfully',
        data: conversation,
    });
});
/**
 * Get all conversations for current user
 */
const getConversations = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    const result = await chat_service_1.ChatServices.getConversations(userId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        includeArchived: req.query.includeArchived === 'true',
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Conversations fetched successfully',
        data: result.conversations,
        meta: result.pagination,
    });
});
/**
 * Get archived conversations
 */
const getArchivedConversations = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    const result = await chat_service_1.ChatServices.getArchivedConversations(userId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Archived conversations fetched successfully',
        data: result.conversations,
        meta: result.pagination,
    });
});
/**
 * Get single conversation
 */
const getConversationById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { conversationId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    const conversation = await chat_service_1.ChatServices.getConversationById(userId, conversationId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Conversation fetched successfully',
        data: conversation,
    });
});
/**
 * Delete conversation (soft delete)
 */
const deleteConversation = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { conversationId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    await chat_service_1.ChatServices.deleteConversation(userId, conversationId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Conversation deleted successfully',
        data: null,
    });
});
/**
 * Archive conversation
 */
const archiveConversation = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { conversationId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    await chat_service_1.ChatServices.archiveConversation(userId, conversationId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Conversation archived successfully',
        data: null,
    });
});
/**
 * Unarchive conversation
 */
const unarchiveConversation = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { conversationId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    await chat_service_1.ChatServices.unarchiveConversation(userId, conversationId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Conversation unarchived successfully',
        data: null,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Send a message
 */
const sendMessage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { conversationId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    const message = await chat_service_1.ChatServices.sendMessage(userId, conversationId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Message sent successfully',
        data: message,
    });
});
/**
 * Get messages for a conversation
 */
const getMessages = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { conversationId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    const result = await chat_service_1.ChatServices.getMessages(userId, conversationId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 50,
        before: req.query.before,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Messages fetched successfully',
        data: result.messages,
        meta: result.pagination,
    });
});
/**
 * Mark message as read
 */
const markAsRead = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { messageId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!messageId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Message ID is required',
            data: null,
        });
    }
    await chat_service_1.ChatServices.markMessageAsRead(userId, messageId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Message marked as read',
        data: null,
    });
});
/**
 * Mark all messages in conversation as read
 */
const markAllAsRead = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { conversationId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    await chat_service_1.ChatServices.markAllMessagesAsRead(userId, conversationId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'All messages marked as read',
        data: null,
    });
});
/**
 * Delete message
 */
const deleteMessage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const { messageId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    if (!messageId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Message ID is required',
            data: null,
        });
    }
    await chat_service_1.ChatServices.deleteMessage(userId, userRole || 'USER', messageId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Message deleted successfully',
        data: null,
    });
});
/**
 * Get unread count
 */
const getUnreadCount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    const count = await chat_service_1.ChatServices.getUnreadCount(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Unread count fetched successfully',
        data: { unreadCount: count },
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// SEARCH CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Search users for chat
 */
const searchUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: 'Authentication required',
            data: null,
        });
    }
    const users = await chat_service_1.ChatServices.searchUsers(userId, {
        q: req.query.q,
        role: req.query.role,
        limit: Number(req.query.limit) || 10,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Users found',
        data: { users },
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Admin: Get all conversations
 */
const adminGetAllConversations = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await chat_service_1.ChatServices.adminGetAllConversations({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        search: req.query.search,
        includeArchived: req.query.includeArchived === 'true',
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'All conversations fetched successfully',
        data: {
            conversations: result.conversations,
            stats: result.stats,
        },
        meta: result.pagination,
    });
});
/**
 * Admin: Get single conversation
 */
const adminGetConversationById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { conversationId } = req.params;
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    const conversation = await chat_service_1.ChatServices.adminGetConversationById(conversationId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Conversation fetched successfully',
        data: conversation,
    });
});
/**
 * Admin: Get messages from any conversation
 */
const adminGetMessages = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { conversationId } = req.params;
    if (!conversationId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Conversation ID is required',
            data: null,
        });
    }
    const result = await chat_service_1.ChatServices.adminGetMessages(conversationId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 50,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Messages fetched successfully',
        data: result.messages,
        meta: result.pagination,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
exports.ChatControllers = {
    // Conversations
    createConversation,
    getConversations,
    getArchivedConversations,
    getConversationById,
    deleteConversation,
    archiveConversation,
    unarchiveConversation,
    // Messages
    sendMessage,
    getMessages,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    getUnreadCount,
    // Search
    searchUsers,
    // Admin
    adminGetAllConversations,
    adminGetConversationById,
    adminGetMessages,
};
//# sourceMappingURL=chat.controller.js.map