export declare const ChatControllers: {
    createConversation: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    getConversations: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    getArchivedConversations: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    getConversationById: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    deleteConversation: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    archiveConversation: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    unarchiveConversation: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    sendMessage: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    getMessages: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    markAsRead: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    markAllAsRead: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    deleteMessage: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    getUnreadCount: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    searchUsers: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    adminGetAllConversations: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    adminGetConversationById: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    adminGetMessages: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=chat.controller.d.ts.map