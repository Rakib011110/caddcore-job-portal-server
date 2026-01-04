/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { CONVERSATION_TYPE, DELETE_TYPE, MESSAGE_STATUS } from './chat.constant';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAT INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * TypeScript interfaces for the Chat System module.
 * Includes Conversation and Message interfaces with all related sub-types.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SUB-INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

/** Last message preview for conversation list */
export interface ILastMessage {
  content: string;                    // Message text (truncated for preview)
  sender: Types.ObjectId;             // Who sent the last message
  sentAt: Date;                       // When it was sent
}

/** Track who deleted the conversation (for soft delete) */
export interface IDeletedBy {
  userId: Types.ObjectId;             // User who deleted
  deletedAt: Date;                    // When they deleted
}

/** Track who archived the conversation */
export interface IArchivedBy {
  userId: Types.ObjectId;             // User who archived
  archivedAt: Date;                   // When they archived
}

/** Track who has read a message */
export interface IReadBy {
  userId: Types.ObjectId;             // User who read the message
  readAt: Date;                       // When they read it
}

/** Attachment for messages (future feature) */
export interface IAttachment {
  url: string;                        // File URL
  type: 'image' | 'file' | 'video';   // File type
  name: string;                       // Original file name
  size?: number;                      // File size in bytes
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface IConversation {
  _id?: Types.ObjectId;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PARTICIPANTS
  // ═══════════════════════════════════════════════════════════════════════════
  participants: Types.ObjectId[];     // Array of User IDs (2 for private chat)
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERSATION TYPE
  // ═══════════════════════════════════════════════════════════════════════════
  type: keyof typeof CONVERSATION_TYPE;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LAST MESSAGE (For quick preview in conversation list)
  // ═══════════════════════════════════════════════════════════════════════════
  lastMessage?: ILastMessage;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════════════════════
  createdBy: Types.ObjectId;          // Who started the conversation
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE & ARCHIVE TRACKING (Per-user soft delete/archive)
  // ═══════════════════════════════════════════════════════════════════════════
  deletedBy: IDeletedBy[];            // Users who deleted this conversation
  archivedBy: IArchivedBy[];          // Users who archived this conversation
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIMESTAMPS
  // ═══════════════════════════════════════════════════════════════════════════
  createdAt?: Date;
  updatedAt?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface IMessage {
  _id?: Types.ObjectId;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE CONTENT
  // ═══════════════════════════════════════════════════════════════════════════
  conversationId: Types.ObjectId;     // Reference to Conversation
  sender: Types.ObjectId;             // Who sent the message (User ID)
  content: string;                    // Message text
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ATTACHMENTS (Future feature)
  // ═══════════════════════════════════════════════════════════════════════════
  attachments?: IAttachment[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // READ TRACKING
  // ═══════════════════════════════════════════════════════════════════════════
  status: keyof typeof MESSAGE_STATUS;
  readBy: IReadBy[];                  // Array of users who have read
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE TRACKING
  // ═══════════════════════════════════════════════════════════════════════════
  isDeleted: boolean;                 // Soft delete flag
  deletedAt?: Date;                   // When deleted
  deletedBy?: Types.ObjectId;         // Who deleted (sender or admin)
  deleteType?: keyof typeof DELETE_TYPE;  // 'SELF' or 'EVERYONE'
  
  // Users who deleted this message for themselves only
  deletedForUsers: Types.ObjectId[];  // Array of user IDs who deleted for self
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIMESTAMPS
  // ═══════════════════════════════════════════════════════════════════════════
  createdAt?: Date;
  updatedAt?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL INTERFACES (Static methods)
// ─────────────────────────────────────────────────────────────────────────────

export interface IConversationModel extends Model<IConversation> {
  /**
   * Find existing conversation between two users
   */
  findExistingConversation(
    userId1: Types.ObjectId | string,
    userId2: Types.ObjectId | string
  ): Promise<IConversation | null>;
  
  /**
   * Check if user is participant in conversation
   */
  isParticipant(
    conversationId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<boolean>;
}

export interface IMessageModel extends Model<IMessage> {
  /**
   * Get unread count for a user in a conversation
   */
  getUnreadCount(
    conversationId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<number>;
  
  /**
   * Get total unread count across all conversations for a user
   */
  getTotalUnreadCount(
    userId: Types.ObjectId | string
  ): Promise<number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// API REQUEST/RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Create conversation request body */
export interface ICreateConversationPayload {
  participantId: string;              // User ID to start conversation with
}

/** Send message request body */
export interface ISendMessagePayload {
  content: string;                    // Message text
}

/** Delete message request body */
export interface IDeleteMessagePayload {
  deleteType: keyof typeof DELETE_TYPE;  // 'SELF' or 'EVERYONE'
}

/** Conversation list query params */
export interface IConversationQueryParams {
  page?: number;
  limit?: number;
  includeArchived?: boolean;
}

/** Messages query params */
export interface IMessageQueryParams {
  page?: number;
  limit?: number;
  before?: string;                    // Message ID for cursor-based pagination
}

/** User search query params */
export interface IUserSearchParams {
  q: string;                          // Search query
  role?: string;                      // Filter by role (USER, COMPANY)
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// POPULATED TYPES (For API responses with populated data)
// ─────────────────────────────────────────────────────────────────────────────

/** Populated participant info in conversation */
export interface IPopulatedParticipant {
  _id: Types.ObjectId;
  name: string;
  email: string;
  profilePhoto?: string;
  role: string;
  headline?: string;
}

/** Conversation with populated participants */
export interface IPopulatedConversation extends Omit<IConversation, 'participants'> {
  participants: IPopulatedParticipant[];
  unreadCount?: number;               // Calculated field
}

/** Message with populated sender */
export interface IPopulatedMessage extends Omit<IMessage, 'sender'> {
  sender: IPopulatedParticipant;
}
