/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAT CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Constants and enums for the Chat System module.
 */
export declare const MESSAGE_STATUS: {
    readonly SENT: "SENT";
    readonly DELIVERED: "DELIVERED";
    readonly READ: "READ";
};
export declare const CONVERSATION_TYPE: {
    readonly PRIVATE: "PRIVATE";
    readonly GROUP: "GROUP";
};
export declare const DELETE_TYPE: {
    readonly SELF: "SELF";
    readonly EVERYONE: "EVERYONE";
};
export declare const CHAT_LIMITS: {
    readonly MAX_MESSAGE_LENGTH: 2000;
    readonly MAX_MESSAGES_PER_PAGE: 50;
    readonly MAX_CONVERSATIONS_PER_PAGE: 20;
    readonly MAX_SEARCH_RESULTS: 10;
    readonly POLLING_INTERVAL_SECONDS: 5;
};
export declare const ConversationSearchableFields: string[];
export declare const MessageSearchableFields: string[];
//# sourceMappingURL=chat.constant.d.ts.map