import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ChatServices } from './chat.service';

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
const createConversation = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  const conversation = await ChatServices.createConversation(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Conversation created successfully',
    data: conversation,
  });
});

/**
 * Get all conversations for current user
 */
const getConversations = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  const result = await ChatServices.getConversations(userId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    includeArchived: req.query.includeArchived === 'true',
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Conversations fetched successfully',
    data: result.conversations,
    meta: result.pagination,
  });
});

/**
 * Get archived conversations
 */
const getArchivedConversations = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  const result = await ChatServices.getArchivedConversations(userId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Archived conversations fetched successfully',
    data: result.conversations,
    meta: result.pagination,
  });
});

/**
 * Get single conversation
 */
const getConversationById = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  const conversation = await ChatServices.getConversationById(userId, conversationId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Conversation fetched successfully',
    data: conversation,
  });
});

/**
 * Delete conversation (soft delete)
 */
const deleteConversation = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  await ChatServices.deleteConversation(userId, conversationId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Conversation deleted successfully',
    data: null,
  });
});

/**
 * Archive conversation
 */
const archiveConversation = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  await ChatServices.archiveConversation(userId, conversationId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Conversation archived successfully',
    data: null,
  });
});

/**
 * Unarchive conversation
 */
const unarchiveConversation = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  await ChatServices.unarchiveConversation(userId, conversationId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
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
const sendMessage = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  const message = await ChatServices.sendMessage(userId, conversationId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Message sent successfully',
    data: message,
  });
});

/**
 * Get messages for a conversation
 */
const getMessages = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  const result = await ChatServices.getMessages(userId, conversationId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
    before: req.query.before as string,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Messages fetched successfully',
    data: result.messages,
    meta: result.pagination,
  });
});

/**
 * Mark message as read
 */
const markAsRead = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { messageId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!messageId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Message ID is required',
      data: null,
    });
  }

  await ChatServices.markMessageAsRead(userId, messageId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Message marked as read',
    data: null,
  });
});

/**
 * Mark all messages in conversation as read
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  await ChatServices.markAllMessagesAsRead(userId, conversationId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All messages marked as read',
    data: null,
  });
});

/**
 * Delete message
 */
const deleteMessage = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { messageId } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!messageId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Message ID is required',
      data: null,
    });
  }

  await ChatServices.deleteMessage(userId, userRole || 'USER', messageId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Message deleted successfully',
    data: null,
  });
});

/**
 * Get unread count
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  const count = await ChatServices.getUnreadCount(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
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
const searchUsers = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  const users = await ChatServices.searchUsers(userId, {
    q: req.query.q as string,
    role: req.query.role as string,
    limit: Number(req.query.limit) || 10,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
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
const adminGetAllConversations = catchAsync(async (req, res) => {
  const result = await ChatServices.adminGetAllConversations({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search as string,
    includeArchived: req.query.includeArchived === 'true',
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
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
const adminGetConversationById = catchAsync(async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  const conversation = await ChatServices.adminGetConversationById(conversationId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Conversation fetched successfully',
    data: conversation,
  });
});

/**
 * Admin: Get messages from any conversation
 */
const adminGetMessages = catchAsync(async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Conversation ID is required',
      data: null,
    });
  }

  const result = await ChatServices.adminGetMessages(conversationId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Messages fetched successfully',
    data: result.messages,
    meta: result.pagination,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const ChatControllers = {
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
