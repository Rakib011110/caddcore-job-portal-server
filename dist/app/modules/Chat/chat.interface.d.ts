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
/** Last message preview for conversation list */
export interface ILastMessage {
    content: string;
    sender: Types.ObjectId;
    sentAt: Date;
}
/** Track who deleted the conversation (for soft delete) */
export interface IDeletedBy {
    userId: Types.ObjectId;
    deletedAt: Date;
}
/** Track who archived the conversation */
export interface IArchivedBy {
    userId: Types.ObjectId;
    archivedAt: Date;
}
/** Track who has read a message */
export interface IReadBy {
    userId: Types.ObjectId;
    readAt: Date;
}
/** Attachment for messages (future feature) */
export interface IAttachment {
    url: string;
    type: 'image' | 'file' | 'video';
    name: string;
    size?: number;
}
export interface IConversation {
    _id?: Types.ObjectId;
    participants: Types.ObjectId[];
    type: keyof typeof CONVERSATION_TYPE;
    lastMessage?: ILastMessage;
    createdBy: Types.ObjectId;
    deletedBy: IDeletedBy[];
    archivedBy: IArchivedBy[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IMessage {
    _id?: Types.ObjectId;
    conversationId: Types.ObjectId;
    sender: Types.ObjectId;
    content: string;
    attachments?: IAttachment[];
    status: keyof typeof MESSAGE_STATUS;
    readBy: IReadBy[];
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: Types.ObjectId;
    deleteType?: keyof typeof DELETE_TYPE;
    deletedForUsers: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IConversationModel extends Model<IConversation> {
    /**
     * Find existing conversation between two users
     */
    findExistingConversation(userId1: Types.ObjectId | string, userId2: Types.ObjectId | string): Promise<IConversation | null>;
    /**
     * Check if user is participant in conversation
     */
    isParticipant(conversationId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<boolean>;
}
export interface IMessageModel extends Model<IMessage> {
    /**
     * Get unread count for a user in a conversation
     */
    getUnreadCount(conversationId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<number>;
    /**
     * Get total unread count across all conversations for a user
     */
    getTotalUnreadCount(userId: Types.ObjectId | string): Promise<number>;
}
/** Create conversation request body */
export interface ICreateConversationPayload {
    participantId: string;
}
/** Send message request body */
export interface ISendMessagePayload {
    content: string;
}
/** Delete message request body */
export interface IDeleteMessagePayload {
    deleteType: keyof typeof DELETE_TYPE;
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
    before?: string;
}
/** User search query params */
export interface IUserSearchParams {
    q: string;
    role?: string;
    limit?: number;
}
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
    unreadCount?: number;
}
/** Message with populated sender */
export interface IPopulatedMessage extends Omit<IMessage, 'sender'> {
    sender: IPopulatedParticipant;
}
//# sourceMappingURL=chat.interface.d.ts.map