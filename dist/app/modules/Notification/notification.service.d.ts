import { Types } from 'mongoose';
import { INotification, ICreateNotificationPayload, IBulkCreateNotificationPayload, TNotificationCategory } from './notification.interface';
export declare const NotificationService: {
    create: (payload: ICreateNotificationPayload) => Promise<INotification>;
    createBulk: (payload: IBulkCreateNotificationPayload) => Promise<INotification[]>;
    getByUserId: (userId: string, options?: {
        page?: number;
        limit?: number;
        category?: TNotificationCategory;
        unreadOnly?: boolean;
    }) => Promise<{
        notifications: INotification[];
        total: number;
        unreadCount: number;
    }>;
    getUnreadCount: (userId: string) => Promise<number>;
    getUnreadCountByCategory: (userId: string) => Promise<Record<TNotificationCategory, number>>;
    markAsRead: (notificationId: string, userId: string) => Promise<INotification | null>;
    markAllAsRead: (userId: string, category?: TNotificationCategory) => Promise<number>;
    deleteNotification: (notificationId: string, userId: string) => Promise<boolean>;
    deleteAllByCategory: (userId: string, category: TNotificationCategory) => Promise<number>;
    notifyNewMessage: (userId: string | Types.ObjectId, senderName: string, conversationId: string, messagePreview?: string) => Promise<INotification>;
    notifyJobAlert: (userIds: (string | Types.ObjectId)[], job: {
        _id: string;
        title: string;
        company?: string;
    }) => Promise<INotification[]>;
    notifyApplicationStatus: (userId: string | Types.ObjectId, status: "VIEWED" | "SHORTLISTED" | "REJECTED" | "SELECTED", jobTitle: string, applicationId: string, jobId?: string) => Promise<INotification>;
    notifyNewApplication: (companyUserId: string | Types.ObjectId, applicantName: string, jobTitle: string, applicationId: string, jobId: string) => Promise<INotification>;
    notifyCompanyStatus: (userId: string | Types.ObjectId, status: "APPROVED" | "REJECTED" | "SUSPENDED", reason?: string) => Promise<INotification>;
    notifyWelcome: (userId: string | Types.ObjectId, userName: string) => Promise<INotification>;
    notifySystemAnnouncement: (userIds: (string | Types.ObjectId)[], title: string, message: string, link?: string) => Promise<INotification[]>;
};
//# sourceMappingURL=notification.service.d.ts.map