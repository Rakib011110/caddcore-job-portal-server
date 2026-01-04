import { Types } from 'mongoose';
import { IConversation, IMessage, ICreateConversationPayload, ISendMessagePayload, IConversationQueryParams, IMessageQueryParams, IUserSearchParams, IDeleteMessagePayload } from './chat.interface';
import { CONVERSATION_TYPE } from './chat.constant';
export declare const ChatServices: {
    createConversation: (userId: string, payload: ICreateConversationPayload) => Promise<IConversation>;
    getConversations: (userId: string, params: IConversationQueryParams) => Promise<{
        conversations: {
            unreadCount: number;
            _id: Types.ObjectId;
            participants: Types.ObjectId[];
            type: keyof typeof CONVERSATION_TYPE;
            lastMessage?: import("./chat.interface").ILastMessage;
            createdBy: Types.ObjectId;
            deletedBy: import("./chat.interface").IDeletedBy[];
            archivedBy: import("./chat.interface").IArchivedBy[];
            createdAt?: Date;
            updatedAt?: Date;
            __v: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getArchivedConversations: (userId: string, params: IConversationQueryParams) => Promise<{
        conversations: (import("mongoose").Document<unknown, {}, IConversation, {}, {}> & IConversation & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getConversationById: (userId: string, conversationId: string) => Promise<IConversation>;
    deleteConversation: (userId: string, conversationId: string) => Promise<void>;
    archiveConversation: (userId: string, conversationId: string) => Promise<void>;
    unarchiveConversation: (userId: string, conversationId: string) => Promise<void>;
    sendMessage: (userId: string, conversationId: string, payload: ISendMessagePayload) => Promise<IMessage>;
    getMessages: (userId: string, conversationId: string, params: IMessageQueryParams) => Promise<{
        messages: (import("mongoose").Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    markMessageAsRead: (userId: string, messageId: string) => Promise<void>;
    markAllMessagesAsRead: (userId: string, conversationId: string) => Promise<void>;
    deleteMessage: (userId: string, userRole: string, messageId: string, payload: IDeleteMessagePayload) => Promise<void>;
    getUnreadCount: (userId: string) => Promise<number>;
    searchUsers: (currentUserId: string, params: IUserSearchParams) => Promise<(import("mongoose").Document<unknown, {}, import("../User/user.interface").TUser, {}, {}> & import("../User/user.interface").TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    adminGetAllConversations: (params: {
        page?: number;
        limit?: number;
        search?: string;
        includeArchived?: boolean;
    }) => Promise<{
        conversations: (import("mongoose").Document<unknown, {}, IConversation, {}, {}> & IConversation & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        stats: {
            totalConversations: number;
            activeToday: number;
            totalMessages: number;
        };
    }>;
    adminGetConversationById: (conversationId: string) => Promise<import("mongoose").Document<unknown, {}, IConversation, {}, {}> & IConversation & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    adminGetMessages: (conversationId: string, params: IMessageQueryParams) => Promise<{
        messages: (import("mongoose").Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
};
//# sourceMappingURL=chat.service.d.ts.map