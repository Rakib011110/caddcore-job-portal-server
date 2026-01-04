import { Types } from 'mongoose';
import { Conversation } from './conversation.model';
import { Message } from './message.model';
import { User } from '../User/user.model';
import { 
  IConversation, 
  IMessage, 
  ICreateConversationPayload,
  ISendMessagePayload,
  IConversationQueryParams,
  IMessageQueryParams,
  IUserSearchParams,
  IDeleteMessagePayload,
} from './chat.interface';
import { CONVERSATION_TYPE, DELETE_TYPE, MESSAGE_STATUS, CHAT_LIMITS } from './chat.constant';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { NotificationService } from '../Notification/notification.service';

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
const createConversation = async (
  userId: string,
  payload: ICreateConversationPayload
): Promise<IConversation> => {
  const { participantId } = payload;

  // Validate: Can't create conversation with yourself
  if (userId === participantId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot create a conversation with yourself');
  }

  // Check if participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if conversation already exists
  const existingConversation = await Conversation.findExistingConversation(userId, participantId);
  if (existingConversation) {
    // If conversation exists but was deleted by current user, restore it
    const wasDeletedByUser = existingConversation.deletedBy.some(
      d => d.userId.toString() === userId
    );
    
    if (wasDeletedByUser) {
      await Conversation.findByIdAndUpdate(existingConversation._id, {
        $pull: { deletedBy: { userId: new Types.ObjectId(userId) } }
      });
    }
    
    return existingConversation;
  }

  // Create new conversation
  const newConversation = await Conversation.create({
    participants: [new Types.ObjectId(userId), new Types.ObjectId(participantId)],
    type: CONVERSATION_TYPE.PRIVATE,
    createdBy: new Types.ObjectId(userId),
  });

  return newConversation;
};

/**
 * Get all conversations for a user
 */
const getConversations = async (
  userId: string,
  params: IConversationQueryParams
) => {
  const { page = 1, limit = CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE, includeArchived = false } = params;
  const skip = (page - 1) * limit;

  const userObjectId = new Types.ObjectId(userId);

  // Base query: user is participant and hasn't deleted
  const query: any = {
    participants: userObjectId,
    'deletedBy.userId': { $ne: userObjectId },
  };

  // Exclude archived unless specifically requested
  if (!includeArchived) {
    query['archivedBy.userId'] = { $ne: userObjectId };
  }

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .populate({
        path: 'participants',
        select: 'name email profilePhoto role headline currentJobTitle',
      })
      .sort({ 'lastMessage.sentAt': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(query),
  ]);

  // Add unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.getUnreadCount(conv._id!.toString(), userId);
      return {
        ...conv.toObject(),
        unreadCount,
      };
    })
  );

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
const getArchivedConversations = async (
  userId: string,
  params: IConversationQueryParams
) => {
  const { page = 1, limit = CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE } = params;
  const skip = (page - 1) * limit;

  const userObjectId = new Types.ObjectId(userId);

  const query = {
    participants: userObjectId,
    'archivedBy.userId': userObjectId,
    'deletedBy.userId': { $ne: userObjectId },
  };

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .populate({
        path: 'participants',
        select: 'name email profilePhoto role headline',
      })
      .sort({ 'lastMessage.sentAt': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(query),
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
const getConversationById = async (
  userId: string,
  conversationId: string
): Promise<IConversation> => {
  const conversation = await Conversation.findById(conversationId)
    .populate({
      path: 'participants',
      select: 'name email profilePhoto role headline currentJobTitle',
    });

  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  // Check if user is participant
  const isParticipant = conversation.participants.some(
    (p: any) => p._id.toString() === userId
  );

  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant in this conversation');
  }

  return conversation;
};

/**
 * Delete conversation (soft delete for user)
 */
const deleteConversation = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  // Check if user is participant
  const isParticipant = await Conversation.isParticipant(conversationId, userId);
  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant in this conversation');
  }

  // Soft delete: add user to deletedBy array
  await Conversation.findByIdAndUpdate(conversationId, {
    $addToSet: {
      deletedBy: {
        userId: new Types.ObjectId(userId),
        deletedAt: new Date(),
      },
    },
  });
};

/**
 * Archive conversation
 */
const archiveConversation = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const isParticipant = await Conversation.isParticipant(conversationId, userId);
  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant in this conversation');
  }

  await Conversation.findByIdAndUpdate(conversationId, {
    $addToSet: {
      archivedBy: {
        userId: new Types.ObjectId(userId),
        archivedAt: new Date(),
      },
    },
  });
};

/**
 * Unarchive conversation
 */
const unarchiveConversation = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const isParticipant = await Conversation.isParticipant(conversationId, userId);
  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant in this conversation');
  }

  await Conversation.findByIdAndUpdate(conversationId, {
    $pull: { archivedBy: { userId: new Types.ObjectId(userId) } },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE SERVICES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a message
 */
const sendMessage = async (
  userId: string,
  conversationId: string,
  payload: ISendMessagePayload
): Promise<IMessage> => {
  const { content } = payload;

  // Check if user is participant
  const isParticipant = await Conversation.isParticipant(conversationId, userId);
  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant in this conversation');
  }

  // Get conversation to find recipient
  const conversation = await Conversation.findById(conversationId).populate({
    path: 'participants',
    select: 'name email',
  });

  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  // Create message
  const message = await Message.create({
    conversationId: new Types.ObjectId(conversationId),
    sender: new Types.ObjectId(userId),
    content: content.trim(),
    status: MESSAGE_STATUS.SENT,
    readBy: [{
      userId: new Types.ObjectId(userId),
      readAt: new Date(),
    }],
  });

  // Update conversation's last message
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: {
      content: content.length > 100 ? content.substring(0, 100) + '...' : content,
      sender: new Types.ObjectId(userId),
      sentAt: new Date(),
    },
    // Unarchive for all participants when new message is received
    $pull: { archivedBy: {} },
  });

  // Populate sender info before returning
  const populatedMessage = await Message.findById(message._id).populate({
    path: 'sender',
    select: 'name email profilePhoto role',
  });

  // 🔔 Create notification for recipient(s)
  try {
    const sender = await User.findById(userId).select('name');
    const senderName = sender?.name || 'Someone';
    
    // Find recipients (all participants except sender)
    const recipients = conversation.participants.filter(
      (p: any) => p._id.toString() !== userId
    );
    
    // Create notification for each recipient
    for (const recipient of recipients) {
      await NotificationService.notifyNewMessage(
        (recipient as any)._id.toString(),
        senderName,
        conversationId,
        content.length > 50 ? content.substring(0, 50) + '...' : content
      );
    }
  } catch (error) {
    // Don't fail message sending if notification fails
    console.error('Failed to create message notification:', error);
  }

  return populatedMessage!;
};

/**
 * Get messages for a conversation
 */
const getMessages = async (
  userId: string,
  conversationId: string,
  params: IMessageQueryParams
) => {
  const { page = 1, limit = CHAT_LIMITS.MAX_MESSAGES_PER_PAGE, before } = params;
  const skip = (page - 1) * limit;

  // Check if user is participant
  const isParticipant = await Conversation.isParticipant(conversationId, userId);
  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant in this conversation');
  }

  const userObjectId = new Types.ObjectId(userId);

  // Build query
  const query: any = {
    conversationId: new Types.ObjectId(conversationId),
    deletedForUsers: { $ne: userObjectId },
  };

  // Cursor-based pagination
  if (before) {
    query._id = { $lt: new Types.ObjectId(before) };
  }

  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate({
        path: 'sender',
        select: 'name email profilePhoto role',
      })
      .sort({ createdAt: -1 })
      .skip(before ? 0 : skip)
      .limit(limit),
    Message.countDocuments({
      conversationId: new Types.ObjectId(conversationId),
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
const markMessageAsRead = async (
  userId: string,
  messageId: string
): Promise<void> => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, 'Message not found');
  }

  // Check if user is participant in the conversation
  const isParticipant = await Conversation.isParticipant(
    message.conversationId.toString(),
    userId
  );

  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant in this conversation');
  }

  // Check if already read
  const alreadyRead = message.readBy.some(r => r.userId.toString() === userId);
  if (alreadyRead) {
    return;
  }

  // Add to readBy array
  await Message.findByIdAndUpdate(messageId, {
    $addToSet: {
      readBy: {
        userId: new Types.ObjectId(userId),
        readAt: new Date(),
      },
    },
    status: MESSAGE_STATUS.READ,
  });
};

/**
 * Mark all messages in conversation as read
 */
const markAllMessagesAsRead = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const isParticipant = await Conversation.isParticipant(conversationId, userId);
  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a participant in this conversation');
  }

  const userObjectId = new Types.ObjectId(userId);

  // Update all unread messages from other users
  await Message.updateMany(
    {
      conversationId: new Types.ObjectId(conversationId),
      sender: { $ne: userObjectId },
      'readBy.userId': { $ne: userObjectId },
    },
    {
      $addToSet: {
        readBy: {
          userId: userObjectId,
          readAt: new Date(),
        },
      },
      status: MESSAGE_STATUS.READ,
    }
  );
};

/**
 * Delete a message
 */
const deleteMessage = async (
  userId: string,
  userRole: string,
  messageId: string,
  payload: IDeleteMessagePayload
): Promise<void> => {
  const { deleteType } = payload;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, 'Message not found');
  }

  const isSender = message.sender.toString() === userId;
  const isAdmin = userRole === 'ADMIN';

  // Check permission
  if (!isSender && !isAdmin) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own messages');
  }

  // "Delete for everyone" - only sender or admin can do this
  if (deleteType === DELETE_TYPE.EVERYONE) {
    if (!isSender && !isAdmin) {
      throw new AppError(httpStatus.FORBIDDEN, 'Only the sender can delete for everyone');
    }

    await Message.findByIdAndUpdate(messageId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: new Types.ObjectId(userId),
      deleteType: DELETE_TYPE.EVERYONE,
    });
  } else {
    // "Delete for self" - hide from this user only
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedForUsers: new Types.ObjectId(userId) },
    });
  }
};

/**
 * Get unread count for user
 */
const getUnreadCount = async (userId: string): Promise<number> => {
  return await Message.getTotalUnreadCount(userId);
};

// ─────────────────────────────────────────────────────────────────────────────
// USER SEARCH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search users to start conversation with
 */
const searchUsers = async (
  currentUserId: string,
  params: IUserSearchParams
) => {
  const { q, role, limit = CHAT_LIMITS.MAX_SEARCH_RESULTS } = params;

  const query: any = {
    _id: { $ne: new Types.ObjectId(currentUserId) }, // Exclude self
    status: 'ACTIVE',
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
  };

  // Filter by role if specified
  if (role) {
    query.role = role;
  } else {
    // By default, show USER and COMPANY roles
    query.role = { $in: ['USER', 'COMPANY', 'ADMIN'] };
  }

  const users = await User.find(query)
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
const adminGetAllConversations = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  includeArchived?: boolean;
}) => {
  const { page = 1, limit = CHAT_LIMITS.MAX_CONVERSATIONS_PER_PAGE, search } = params;
  const skip = (page - 1) * limit;

  let query: any = {};

  // If search provided, find users matching search then find their conversations
  if (search) {
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');

    const userIds = matchingUsers.map(u => u._id);
    query.participants = { $in: userIds };
  }

  const [conversations, total, totalMessages] = await Promise.all([
    Conversation.find(query)
      .populate({
        path: 'participants',
        select: 'name email profilePhoto role',
      })
      .sort({ 'lastMessage.sentAt': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(query),
    Message.countDocuments(),
  ]);

  // Get active conversations today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeToday = await Conversation.countDocuments({
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
const adminGetConversationById = async (conversationId: string) => {
  const conversation = await Conversation.findById(conversationId)
    .populate({
      path: 'participants',
      select: 'name email profilePhoto role headline',
    });

  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  return conversation;
};

/**
 * Admin: Get messages from any conversation
 */
const adminGetMessages = async (
  conversationId: string,
  params: IMessageQueryParams
) => {
  const { page = 1, limit = CHAT_LIMITS.MAX_MESSAGES_PER_PAGE } = params;
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  const [messages, total] = await Promise.all([
    Message.find({ conversationId: new Types.ObjectId(conversationId) })
      .populate({
        path: 'sender',
        select: 'name email profilePhoto role',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversationId: new Types.ObjectId(conversationId) }),
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

export const ChatServices = {
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
