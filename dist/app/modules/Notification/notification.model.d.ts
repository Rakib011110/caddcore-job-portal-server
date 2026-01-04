import { Model } from 'mongoose';
import { INotification } from './notification.interface';
interface INotificationModel extends Model<INotification> {
    getUnreadCount(userId: string): Promise<number>;
    markAllAsRead(userId: string): Promise<void>;
    markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
}
export declare const Notification: INotificationModel;
export {};
//# sourceMappingURL=notification.model.d.ts.map