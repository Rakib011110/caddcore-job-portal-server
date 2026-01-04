import { z } from 'zod';
export declare const ChatValidation: {
    createConversationSchema: z.ZodObject<{
        body: z.ZodObject<{
            participantId: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    getConversationsSchema: z.ZodObject<{
        query: z.ZodObject<{
            page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
            limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
            includeArchived: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean, string | undefined>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    conversationIdParamSchema: z.ZodObject<{
        params: z.ZodObject<{
            conversationId: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    sendMessageSchema: z.ZodObject<{
        params: z.ZodObject<{
            conversationId: z.ZodString;
        }, z.core.$strip>;
        body: z.ZodObject<{
            content: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    getMessagesSchema: z.ZodObject<{
        params: z.ZodObject<{
            conversationId: z.ZodString;
        }, z.core.$strip>;
        query: z.ZodObject<{
            page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
            limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
            before: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    markAsReadSchema: z.ZodObject<{
        params: z.ZodObject<{
            messageId: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    deleteMessageSchema: z.ZodObject<{
        params: z.ZodObject<{
            messageId: z.ZodString;
        }, z.core.$strip>;
        body: z.ZodObject<{
            deleteType: z.ZodEnum<{
                SELF: "SELF";
                EVERYONE: "EVERYONE";
            }>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    searchUsersSchema: z.ZodObject<{
        query: z.ZodObject<{
            q: z.ZodString;
            role: z.ZodOptional<z.ZodEnum<{
                ADMIN: "ADMIN";
                COMPANY: "COMPANY";
                USER: "USER";
            }>>;
            limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    adminGetConversationsSchema: z.ZodObject<{
        query: z.ZodObject<{
            page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
            limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
            search: z.ZodOptional<z.ZodString>;
            includeArchived: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean, string | undefined>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
//# sourceMappingURL=chat.validation.d.ts.map