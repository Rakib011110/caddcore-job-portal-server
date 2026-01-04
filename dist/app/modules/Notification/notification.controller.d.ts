import { Request, Response } from 'express';
export declare const NotificationControllers: {
    getNotifications: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getUnreadCount: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    markAsRead: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    markAllAsRead: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteNotification: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteAllByCategory: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=notification.controller.d.ts.map