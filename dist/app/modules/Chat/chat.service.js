"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServices = void 0;
const mongoose_1 = require("mongoose");
const conversation_model_1 = require("./conversation.model");
const message_model_1 = require("./message.model");
const user_model_1 = require("../User/user.model");
const chat_constant_1 = require("./chat.constant");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const notification_service_1 = require("../Notification/notification.service");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAT SERVICES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Business logic for Chat System operations
 */
// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION SERVICES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Create or get existing conversation between two users
 */
const createConversation = async (userId, payload) => {
    const { participantId } = payload;
    // Validate: Can't create conversation with yourself
    if (userId === participantId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot create a conversation with yourself');
    }
    // Check if participant exists
    const participant = await user_model_1.User.findById(participantId);
    if (!participant) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Check if conversation already exists
    const existingConversation = await conversation_model_1.Conversation.findExistingConversation(userId, participantId);
    if (existingConversation) {
        // If conversation exists but was deleted by current user, restore it
        const wasDeletedByUser = existingConversation.deletedBy.some(d => d.userId.toString() === userId);
        if (wasDeletedByUser) {
            await conversation_model_1.Conversation.findByIdAndUpdate(existingConversation._id, {
                $pull: { deletedBy: { userId: new mongoose_1.Types.ObjectId(userId) } }
            });
        }
        return existingConversation;
    }
    // Create new conversation
    const newConversation = await conversation_model_1.Conversation.create({
        participants: [new mongoose_1.Types.ObjectId(userId), new mongoose_1.Types.ObjectId(participantId)],
        type: chat_constant_1.CONVERSATION_TYPE.PRIVATE,
        createdBy: new mongoose_1.Types.ObjectId(userId),
    });
    return newConversation;
};
/**
 * Get all conversations for a user
 */
const getConversations = async (userId, params) => {
    const { page = 1, limit = chat_constant_1.CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE, includeArchived = false } = params;
    const skip = (page - 1) * limit;
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    // Base query: user is participant and hasn't deleted
    const query = {
        participants: userObjectId,
        'deletedBy.userId': { $ne: userObjectId },
    };
    // Exclude archived unless specifically requested
    if (!includeArchived) {
        query['archivedBy.userId'] = { $ne: userObjectId };
    }
    const [conversations, total] = await Promise.all([
        conversation_model_1.Conversation.find(query)
            .populate({
            path: 'participants',
            select: 'name email profilePhoto role headline currentJobTitle',
        })
            .sort({ 'lastMessage.sentAt': -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
        conversation_model_1.Conversation.countDocuments(query),
    ]);
    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
        const unreadCount = await message_model_1.Message.getUnreadCount(conv._id.toString(), userId);
        return {
            ...conv.toObject(),
            unreadCount,
        };
    }));
    return {
        conversations: conversationsWithUnread,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
/**
 * Get archived conversations
 */
const getArchivedConversations = async (userId, params) => {
    const { page = 1, limit = chat_constant_1.CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE } = params;
    const skip = (page - 1) * limit;
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    const query = {
        participants: userObjectId,
        'archivedBy.userId': userObjectId,
        'deletedBy.userId': { $ne: userObjectId },
    };
    const [conversations, total] = await Promise.all([
        conversation_model_1.Conversation.find(query)
            .populate({
            path: 'participants',
            select: 'name email profilePhoto role headline',
        })
            .sort({ 'lastMessage.sentAt': -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
        conversation_model_1.Conversation.countDocuments(query),
    ]);
    return {
        conversations,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
/**
 * Get single conversation by ID
 */
const getConversationById = async (userId, conversationId) => {
    const conversation = await conversation_model_1.Conversation.findById(conversationId)
        .populate({
        path: 'participants',
        select: 'name email profilePhoto role headline currentJobTitle',
    });
    if (!conversation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Conversation not found');
    }
    // Check if user is participant
    const isParticipant = conversation.participants.some((p) => p._id.toString() === userId);
    if (!isParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant in this conversation');
    }
    return conversation;
};
/**
 * Delete conversation (soft delete for user)
 */
const deleteConversation = async (userId, conversationId) => {
    const conversation = await conversation_model_1.Conversation.findById(conversationId);
    if (!conversation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Conversation not found');
    }
    // Check if user is participant
    const isParticipant = await conversation_model_1.Conversation.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant in this conversation');
    }
    // Soft delete: add user to deletedBy array
    await conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
        $addToSet: {
            deletedBy: {
                userId: new mongoose_1.Types.ObjectId(userId),
                deletedAt: new Date(),
            },
        },
    });
};
/**
 * Archive conversation
 */
const archiveConversation = async (userId, conversationId) => {
    const isParticipant = await conversation_model_1.Conversation.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant in this conversation');
    }
    await conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
        $addToSet: {
            archivedBy: {
                userId: new mongoose_1.Types.ObjectId(userId),
                archivedAt: new Date(),
            },
        },
    });
};
/**
 * Unarchive conversation
 */
const unarchiveConversation = async (userId, conversationId) => {
    const isParticipant = await conversation_model_1.Conversation.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant in this conversation');
    }
    await conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
        $pull: { archivedBy: { userId: new mongoose_1.Types.ObjectId(userId) } },
    });
};
// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE SERVICES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Send a message
 */
const sendMessage = async (userId, conversationId, payload) => {
    const { content } = payload;
    // Check if user is participant
    const isParticipant = await conversation_model_1.Conversation.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant in this conversation');
    }
    // Get conversation to find recipient
    const conversation = await conversation_model_1.Conversation.findById(conversationId).populate({
        path: 'participants',
        select: 'name email',
    });
    if (!conversation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Conversation not found');
    }
    // Create message
    const message = await message_model_1.Message.create({
        conversationId: new mongoose_1.Types.ObjectId(conversationId),
        sender: new mongoose_1.Types.ObjectId(userId),
        content: content.trim(),
        status: chat_constant_1.MESSAGE_STATUS.SENT,
        readBy: [{
                userId: new mongoose_1.Types.ObjectId(userId),
                readAt: new Date(),
            }],
    });
    // Update conversation's last message
    await conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
            content: content.length > 100 ? content.substring(0, 100) + '...' : content,
            sender: new mongoose_1.Types.ObjectId(userId),
            sentAt: new Date(),
        },
        // Unarchive for all participants when new message is received
        $pull: { archivedBy: {} },
    });
    // Populate sender info before returning
    const populatedMessage = await message_model_1.Message.findById(message._id).populate({
        path: 'sender',
        select: 'name email profilePhoto role',
    });
    // 🔔 Create notification for recipient(s)
    try {
        const sender = await user_model_1.User.findById(userId).select('name');
        const senderName = sender?.name || 'Someone';
        // Find recipients (all participants except sender)
        const recipients = conversation.participants.filter((p) => p._id.toString() !== userId);
        // Create notification for each recipient
        for (const recipient of recipients) {
            await notification_service_1.NotificationService.notifyNewMessage(recipient._id.toString(), senderName, conversationId, content.length > 50 ? content.substring(0, 50) + '...' : content);
        }
    }
    catch (error) {
        // Don't fail message sending if notification fails
        console.error('Failed to create message notification:', error);
    }
    return populatedMessage;
};
/**
 * Get messages for a conversation
 */
const getMessages = async (userId, conversationId, params) => {
    const { page = 1, limit = chat_constant_1.CHAT_LIMITS.MAX_MESSAGES_PER_PAGE, before } = params;
    const skip = (page - 1) * limit;
    // Check if user is participant
    const isParticipant = await conversation_model_1.Conversation.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant in this conversation');
    }
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    // Build query
    const query = {
        conversationId: new mongoose_1.Types.ObjectId(conversationId),
        deletedForUsers: { $ne: userObjectId },
    };
    // Cursor-based pagination
    if (before) {
        query._id = { $lt: new mongoose_1.Types.ObjectId(before) };
    }
    const [messages, total] = await Promise.all([
        message_model_1.Message.find(query)
            .populate({
            path: 'sender',
            select: 'name email profilePhoto role',
        })
            .sort({ createdAt: -1 })
            .skip(before ? 0 : skip)
            .limit(limit),
        message_model_1.Message.countDocuments({
            conversationId: new mongoose_1.Types.ObjectId(conversationId),
            deletedForUsers: { $ne: userObjectId },
        }),
    ]);
    return {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: messages.length === limit,
        },
    };
};
/**
 * Mark message as read
 */
const markMessageAsRead = async (userId, messageId) => {
    const message = await message_model_1.Message.findById(messageId);
    if (!message) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Message not found');
    }
    // Check if user is participant in the conversation
    const isParticipant = await conversation_model_1.Conversation.isParticipant(message.conversationId.toString(), userId);
    if (!isParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant in this conversation');
    }
    // Check if already read
    const alreadyRead = message.readBy.some(r => r.userId.toString() === userId);
    if (alreadyRead) {
        return;
    }
    // Add to readBy array
    await message_model_1.Message.findByIdAndUpdate(messageId, {
        $addToSet: {
            readBy: {
                userId: new mongoose_1.Types.ObjectId(userId),
                readAt: new Date(),
            },
        },
        status: chat_constant_1.MESSAGE_STATUS.READ,
    });
};
/**
 * Mark all messages in conversation as read
 */
const markAllMessagesAsRead = async (userId, conversationId) => {
    const isParticipant = await conversation_model_1.Conversation.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant in this conversation');
    }
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    // Update all unread messages from other users
    await message_model_1.Message.updateMany({
        conversationId: new mongoose_1.Types.ObjectId(conversationId),
        sender: { $ne: userObjectId },
        'readBy.userId': { $ne: userObjectId },
    }, {
        $addToSet: {
            readBy: {
                userId: userObjectId,
                readAt: new Date(),
            },
        },
        status: chat_constant_1.MESSAGE_STATUS.READ,
    });
};
/**
 * Delete a message
 */
const deleteMessage = async (userId, userRole, messageId, payload) => {
    const { deleteType } = payload;
    const message = await message_model_1.Message.findById(messageId);
    if (!message) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Message not found');
    }
    const isSender = message.sender.toString() === userId;
    const isAdmin = userRole === 'ADMIN';
    // Check permission
    if (!isSender && !isAdmin) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own messages');
    }
    // "Delete for everyone" - only sender or admin can do this
    if (deleteType === chat_constant_1.DELETE_TYPE.EVERYONE) {
        if (!isSender && !isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only the sender can delete for everyone');
        }
        await message_model_1.Message.findByIdAndUpdate(messageId, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: new mongoose_1.Types.ObjectId(userId),
            deleteType: chat_constant_1.DELETE_TYPE.EVERYONE,
        });
    }
    else {
        // "Delete for self" - hide from this user only
        await message_model_1.Message.findByIdAndUpdate(messageId, {
            $addToSet: { deletedForUsers: new mongoose_1.Types.ObjectId(userId) },
        });
    }
};
/**
 * Get unread count for user
 */
const getUnreadCount = async (userId) => {
    return await message_model_1.Message.getTotalUnreadCount(userId);
};
// ─────────────────────────────────────────────────────────────────────────────
// USER SEARCH
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Search users to start conversation with
 */
const searchUsers = async (currentUserId, params) => {
    const { q, role, limit = chat_constant_1.CHAT_LIMITS.MAX_SEARCH_RESULTS } = params;
    const query = {
        _id: { $ne: new mongoose_1.Types.ObjectId(currentUserId) }, // Exclude self
        status: 'ACTIVE',
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
        ],
    };
    // Filter by role if specified
    if (role) {
        query.role = role;
    }
    else {
        // By default, show USER and COMPANY roles
        query.role = { $in: ['USER', 'COMPANY', 'ADMIN'] };
    }
    const users = await user_model_1.User.find(query)
        .select('name email profilePhoto role headline currentJobTitle')
        .limit(limit);
    return users;
};
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SERVICES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Admin: Get all conversations
 */
const adminGetAllConversations = async (params) => {
    const { page = 1, limit = chat_constant_1.CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE, search } = params;
    const skip = (page - 1) * limit;
    let query = {};
    // If search provided, find users matching search then find their conversations
    if (search) {
        const matchingUsers = await user_model_1.User.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }).select('_id');
        const userIds = matchingUsers.map(u => u._id);
        query.participants = { $in: userIds };
    }
    const [conversations, total, totalMessages] = await Promise.all([
        conversation_model_1.Conversation.find(query)
            .populate({
            path: 'participants',
            select: 'name email profilePhoto role',
        })
            .sort({ 'lastMessage.sentAt': -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
        conversation_model_1.Conversation.countDocuments(query),
        message_model_1.Message.countDocuments(),
    ]);
    // Get active conversations today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await conversation_model_1.Conversation.countDocuments({
        'lastMessage.sentAt': { $gte: today },
    });
    return {
        conversations,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        stats: {
            totalConversations: total,
            activeToday,
            totalMessages,
        },
    };
};
/**
 * Admin: Get any conversation by ID
 */
const adminGetConversationById = async (conversationId) => {
    const conversation = await conversation_model_1.Conversation.findById(conversationId)
        .populate({
        path: 'participants',
        select: 'name email profilePhoto role headline',
    });
    if (!conversation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Conversation not found');
    }
    return conversation;
};
/**
 * Admin: Get messages from any conversation
 */
const adminGetMessages = async (conversationId, params) => {
    const { page = 1, limit = chat_constant_1.CHAT_LIMITS.MAX_MESSAGES_PER_PAGE } = params;
    const skip = (page - 1) * limit;
    const conversation = await conversation_model_1.Conversation.findById(conversationId);
    if (!conversation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Conversation not found');
    }
    const [messages, total] = await Promise.all([
        message_model_1.Message.find({ conversationId: new mongoose_1.Types.ObjectId(conversationId) })
            .populate({
            path: 'sender',
            select: 'name email profilePhoto role',
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        message_model_1.Message.countDocuments({ conversationId: new mongoose_1.Types.ObjectId(conversationId) }),
    ]);
    return {
        messages: messages.reverse(),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
exports.ChatServices = {
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
    markMessageAsRead,
    markAllMessagesAsRead,
    deleteMessage,
    getUnreadCount,
    // Search
    searchUsers,
    // Admin
    adminGetAllConversations,
    adminGetConversationById,
    adminGetMessages,
};
//# sourceMappingURL=chat.service.js.map