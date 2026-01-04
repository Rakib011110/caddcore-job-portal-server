"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const notification_service_1 = require("./notification.service");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// GET ALL NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
const getNotifications = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { page = 1, limit = 20, category, unreadOnly } = req.query;
    const result = await notification_service_1.NotificationService.getByUserId(userId, {
        page: Number(page),
        limit: Number(limit),
        category: category,
        unreadOnly: unreadOnly === 'true',
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
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
const getUnreadCount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const [total, byCategory] = await Promise.all([
        notification_service_1.NotificationService.getUnreadCount(userId),
        notification_service_1.NotificationService.getUnreadCountByCategory(userId),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
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
const markAsRead = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const notificationId = req.params.notificationId;
    const notification = await notification_service_1.NotificationService.markAsRead(notificationId, userId);
    if (!notification) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: 'Notification not found',
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notification marked as read',
        data: notification,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// MARK ALL AS READ
// ─────────────────────────────────────────────────────────────────────────────
const markAllAsRead = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { category } = req.query;
    const count = await notification_service_1.NotificationService.markAllAsRead(userId, category);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `${count} notifications marked as read`,
        data: { markedCount: count },
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// DELETE SINGLE NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
const deleteNotification = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const notificationId = req.params.notificationId;
    const deleted = await notification_service_1.NotificationService.deleteNotification(notificationId, userId);
    if (!deleted) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: 'Notification not found',
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notification deleted',
        data: null,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// DELETE ALL BY CATEGORY
// ─────────────────────────────────────────────────────────────────────────────
const deleteAllByCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    const category = req.params.category;
    const count = await notification_service_1.NotificationService.deleteAllByCategory(userId, category);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `${count} notifications deleted`,
        data: { deletedCount: count },
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
exports.NotificationControllers = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllByCategory,
};
//# sourceMappingURL=notification.controller.js.map