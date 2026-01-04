import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotificationService } from './notification.service';
import { TNotificationCategory } from './notification.interface';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  const { page = 1, limit = 20, category, unreadOnly } = req.query;
  
  const result = await NotificationService.getByUserId(userId, {
    page: Number(page),
    limit: Number(limit),
    category: category as TNotificationCategory,
    unreadOnly: unreadOnly === 'true',
  });
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result.notifications,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: result.total,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET UNREAD COUNT
// ─────────────────────────────────────────────────────────────────────────────

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  
  const [total, byCategory] = await Promise.all([
    NotificationService.getUnreadCount(userId),
    NotificationService.getUnreadCountByCategory(userId),
  ]);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Unread count retrieved successfully',
    data: {
      total,
      byCategory,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MARK SINGLE AS READ
// ─────────────────────────────────────────────────────────────────────────────

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  const notificationId = req.params.notificationId as string;
  
  const notification = await NotificationService.markAsRead(notificationId, userId);
  
  if (!notification) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Notification not found',
      data: null,
    });
  }
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MARK ALL AS READ
// ─────────────────────────────────────────────────────────────────────────────

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  const { category } = req.query;
  
  const count = await NotificationService.markAllAsRead(
    userId, 
    category as TNotificationCategory
  );
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${count} notifications marked as read`,
    data: { markedCount: count },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE SINGLE NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  const notificationId = req.params.notificationId as string;
  
  const deleted = await NotificationService.deleteNotification(notificationId, userId);
  
  if (!deleted) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Notification not found',
      data: null,
    });
  }
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification deleted',
    data: null,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE ALL BY CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

const deleteAllByCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  const category = req.params.category as TNotificationCategory;
  
  const count = await NotificationService.deleteAllByCategory(userId, category);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${count} notifications deleted`,
    data: { deletedCount: count },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

export const NotificationControllers = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllByCategory,
};
