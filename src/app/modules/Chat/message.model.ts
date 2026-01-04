/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MESSAGE MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Mongoose model for Message with all schemas and static methods.
 * Handles individual messages within conversations.
 */

import { Schema, model, Types } from 'mongoose';
import { IMessage, IMessageModel, IReadBy, IAttachment } from './chat.interface';
import { MESSAGE_STATUS, DELETE_TYPE, CHAT_LIMITS } from './chat.constant';

// ─────────────────────────────────────────────────────────────────────────────
// SUB-SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const readBySchema = new Schema<IReadBy>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    readAt: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
  },
  { _id: false }
);

const attachmentSchema = new Schema<IAttachment>(
  {
    url: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['image', 'file', 'video'],
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    size: { 
      type: Number 
    },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MESSAGE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const messageSchema = new Schema<IMessage, IMessageModel>(
  {
    // ═══════════════════════════════════════════════════════════════════════════
    // MESSAGE CONTENT
    // ═══════════════════════════════════════════════════════════════════════════
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },

    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [CHAT_LIMITS.MAX_MESSAGE_LENGTH, `Message cannot exceed ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} characters`],
      trim: true,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ATTACHMENTS (Future feature)
    // ═══════════════════════════════════════════════════════════════════════════
    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // READ TRACKING
    // ═══════════════════════════════════════════════════════════════════════════
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUS),
      default: MESSAGE_STATUS.SENT,
    },

    readBy: {
      type: [readBySchema],
      default: [],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // DELETE TRACKING
    // ═══════════════════════════════════════════════════════════════════════════
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    deleteType: {
      type: String,
      enum: Object.values(DELETE_TYPE),
    },

    // Users who deleted this message for themselves only
    deletedForUsers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: Record<string, unknown>) {
        delete ret['__v'];
        
        // If message is deleted for everyone, hide content
        if (ret['isDeleted'] && ret['deleteType'] === DELETE_TYPE.EVERYONE) {
          ret['content'] = 'This message was deleted';
          delete ret['attachments'];
        }
        
        return ret;
      },
    },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

// Primary query: messages in a conversation sorted by time
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Find messages by sender
messageSchema.index({ sender: 1 });

// Find unread messages
messageSchema.index({ conversationId: 1, 'readBy.userId': 1 });

// Find non-deleted messages
messageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: -1 });

// For deleted-for-self queries
messageSchema.index({ deletedForUsers: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get unread count for a user in a specific conversation
 */
messageSchema.statics.getUnreadCount = async function (
  conversationId: Types.ObjectId | string,
  userId: Types.ObjectId | string
): Promise<number> {
  const userObjectId = new Types.ObjectId(userId);
  
  return await this.countDocuments({
    conversationId: new Types.ObjectId(conversationId),
    sender: { $ne: userObjectId },  // Not sent by this user
    'readBy.userId': { $ne: userObjectId },  // Not read by this user
    isDeleted: { $ne: true },  // Not deleted for everyone
    deletedForUsers: { $ne: userObjectId },  // Not deleted for this user
  });
};

/**
 * Get total unread count across all conversations for a user
 */
messageSchema.statics.getTotalUnreadCount = async function (
  userId: Types.ObjectId | string
): Promise<number> {
  const userObjectId = new Types.ObjectId(userId);
  
  // First, get all conversations the user is part of
  const Conversation = model('Conversation');
  const conversations = await Conversation.find({
    participants: userObjectId,
    'deletedBy.userId': { $ne: userObjectId },  // Not deleted by user
  }).select('_id');
  
  const conversationIds = conversations.map(c => c._id);
  
  // Then count unread messages across all those conversations
  return await this.countDocuments({
    conversationId: { $in: conversationIds },
    sender: { $ne: userObjectId },
    'readBy.userId': { $ne: userObjectId },
    isDeleted: { $ne: true },
    deletedForUsers: { $ne: userObjectId },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL FIELDS
// ─────────────────────────────────────────────────────────────────────────────

// Check if message has attachments
messageSchema.virtual('hasAttachments').get(function () {
  return this.attachments && this.attachments.length > 0;
});

// Check if message was edited (for future feature)
messageSchema.virtual('isEdited').get(function () {
  if (!this.createdAt || !this.updatedAt) return false;
  return this.updatedAt.getTime() - this.createdAt.getTime() > 1000; // More than 1 second difference
});

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

// Pre-save: Validate content is not empty after trim
messageSchema.pre('save', function (next) {
  if (!this.content || this.content.trim().length === 0) {
    return next(new Error('Message content cannot be empty'));
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────────────────────────────────────────────

export const Message = model<IMessage, IMessageModel>('Message', messageSchema);
