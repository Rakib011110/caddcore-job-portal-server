/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONVERSATION MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Mongoose model for Conversation with all schemas and static methods.
 * Handles one-to-one conversations between users.
 */

import { Schema, model, Types } from 'mongoose';
import { IConversation, IConversationModel, IDeletedBy, IArchivedBy, ILastMessage } from './chat.interface';
import { CONVERSATION_TYPE } from './chat.constant';

// ─────────────────────────────────────────────────────────────────────────────
// SUB-SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const lastMessageSchema = new Schema<ILastMessage>(
  {
    content: { 
      type: String, 
      required: true,
      maxlength: 100  // Truncated preview
    },
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    sentAt: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
  },
  { _id: false }
);

const deletedBySchema = new Schema<IDeletedBy>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    deletedAt: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
  },
  { _id: false }
);

const archivedBySchema = new Schema<IArchivedBy>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    archivedAt: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONVERSATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const conversationSchema = new Schema<IConversation, IConversationModel>(
  {
    // ═══════════════════════════════════════════════════════════════════════════
    // PARTICIPANTS
    // ═══════════════════════════════════════════════════════════════════════════
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: [true, 'Participants are required'],
      validate: {
        validator: function(v: Types.ObjectId[]) {
          // Private chat must have exactly 2 participants
          return v.length >= 2;
        },
        message: 'A conversation must have at least 2 participants'
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CONVERSATION TYPE
    // ═══════════════════════════════════════════════════════════════════════════
    type: {
      type: String,
      enum: Object.values(CONVERSATION_TYPE),
      default: CONVERSATION_TYPE.PRIVATE,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LAST MESSAGE (For quick preview)
    // ═══════════════════════════════════════════════════════════════════════════
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // METADATA
    // ═══════════════════════════════════════════════════════════════════════════
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // DELETE & ARCHIVE TRACKING
    // ═══════════════════════════════════════════════════════════════════════════
    deletedBy: {
      type: [deletedBySchema],
      default: [],
    },

    archivedBy: {
      type: [archivedBySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: Record<string, unknown>) {
        delete ret['__v'];
        return ret;
      },
    },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

// Find conversations by participant
conversationSchema.index({ participants: 1 });

// Sort by last message time
conversationSchema.index({ 'lastMessage.sentAt': -1 });

// Find non-deleted conversations for a user
conversationSchema.index({ 'deletedBy.userId': 1 });

// Find archived conversations for a user
conversationSchema.index({ 'archivedBy.userId': 1 });

// Compound index for efficient queries
conversationSchema.index({ participants: 1, 'lastMessage.sentAt': -1 });

// Created time sorting
conversationSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find existing conversation between two users
 */
conversationSchema.statics.findExistingConversation = async function (
  userId1: Types.ObjectId | string,
  userId2: Types.ObjectId | string
): Promise<IConversation | null> {
  return await this.findOne({
    type: CONVERSATION_TYPE.PRIVATE,
    participants: { 
      $all: [
        new Types.ObjectId(userId1), 
        new Types.ObjectId(userId2)
      ] 
    },
  });
};

/**
 * Check if user is participant in conversation
 */
conversationSchema.statics.isParticipant = async function (
  conversationId: Types.ObjectId | string,
  userId: Types.ObjectId | string
): Promise<boolean> {
  const conversation = await this.findOne({
    _id: new Types.ObjectId(conversationId),
    participants: new Types.ObjectId(userId),
  });
  return !!conversation;
};

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL FIELDS
// ─────────────────────────────────────────────────────────────────────────────

// Check if conversation has messages
conversationSchema.virtual('hasMessages').get(function () {
  return !!this.lastMessage;
});

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

// Pre-save: Ensure unique participants (no self-chat)
conversationSchema.pre('save', function (next) {
  if (this.type === CONVERSATION_TYPE.PRIVATE && this.participants.length === 2) {
    const p1 = this.participants[0];
    const p2 = this.participants[1];
    if (p1 && p2 && p1.toString() === p2.toString()) {
      return next(new Error('Cannot create a conversation with yourself'));
    }
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────────────────────────────────────────────

export const Conversation = model<IConversation, IConversationModel>('Conversation', conversationSchema);
