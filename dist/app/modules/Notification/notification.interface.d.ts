import { Types } from 'mongoose';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive notification system for:
 * - Messages
 * - Job Alerts
 * - Application Updates
 * - Company Approvals
 * - System Announcements
 */
export declare const NOTIFICATION_TYPES: {
    readonly NEW_MESSAGE: "NEW_MESSAGE";
    readonly JOB_ALERT: "JOB_ALERT";
    readonly JOB_POSTED: "JOB_POSTED";
    readonly JOB_EXPIRED: "JOB_EXPIRED";
    readonly APPLICATION_RECEIVED: "APPLICATION_RECEIVED";
    readonly APPLICATION_VIEWED: "APPLICATION_VIEWED";
    readonly APPLICATION_SHORTLISTED: "APPLICATION_SHORTLISTED";
    readonly APPLICATION_REJECTED: "APPLICATION_REJECTED";
    readonly APPLICATION_SELECTED: "APPLICATION_SELECTED";
    readonly COMPANY_APPROVED: "COMPANY_APPROVED";
    readonly COMPANY_REJECTED: "COMPANY_REJECTED";
    readonly COMPANY_SUSPENDED: "COMPANY_SUSPENDED";
    readonly PROFILE_VERIFIED: "PROFILE_VERIFIED";
    readonly PROFILE_VIEW: "PROFILE_VIEW";
    readonly SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT";
    readonly WELCOME: "WELCOME";
};
export type TNotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export declare const NOTIFICATION_PRIORITY: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export type TNotificationPriority = typeof NOTIFICATION_PRIORITY[keyof typeof NOTIFICATION_PRIORITY];
export declare const NOTIFICATION_CATEGORY: {
    readonly MESSAGE: "MESSAGE";
    readonly JOB: "JOB";
    readonly APPLICATION: "APPLICATION";
    readonly ACCOUNT: "ACCOUNT";
    readonly SYSTEM: "SYSTEM";
};
export type TNotificationCategory = typeof NOTIFICATION_CATEGORY[keyof typeof NOTIFICATION_CATEGORY];
export interface INotification {
    _id: Types.ObjectId;
    userId: Types.ObjectId | string;
    type: TNotificationType;
    category: TNotificationCategory;
    title: string;
    message: string;
    data?: {
        jobId?: Types.ObjectId | string;
        applicationId?: Types.ObjectId | string;
        conversationId?: Types.ObjectId | string;
        messageId?: Types.ObjectId | string;
        companyId?: Types.ObjectId | string;
        senderId?: Types.ObjectId | string;
        [key: string]: any;
    };
    link?: string;
    read: boolean;
    readAt?: Date;
    priority: TNotificationPriority;
    emailSent: boolean;
    pushSent: boolean;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    deletedAt?: Date;
}
export interface ICreateNotificationPayload {
    userId: string | Types.ObjectId;
    type: TNotificationType;
    title: string;
    message: string;
    data?: INotification['data'];
    link?: string;
    priority?: TNotificationPriority;
    sendEmail?: boolean;
    sendPush?: boolean;
}
export interface IBulkCreateNotificationPayload {
    userIds: (string | Types.ObjectId)[];
    type: TNotificationType;
    title: string;
    message: string;
    data?: INotification['data'];
    link?: string;
    priority?: TNotificationPriority;
}
export interface INotificationFilters {
    userId?: string;
    type?: TNotificationType;
    category?: TNotificationCategory;
    read?: boolean;
    priority?: TNotificationPriority;
    startDate?: Date;
    endDate?: Date;
}
export declare const getNotificationCategory: (type: TNotificationType) => TNotificationCategory;
//# sourceMappingURL=notification.interface.d.ts.map