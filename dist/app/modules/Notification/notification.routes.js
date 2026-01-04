"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Base path: /api/notifications
 *
 * All routes require authentication.
 */
// ─────────────────────────────────────────────────────────────────────────────
// GET ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Get all notifications for current user
// GET /api/notifications?page=1&limit=20&category=JOB&unreadOnly=true
router.get('/', (0, auth_1.default)(), notification_controller_1.NotificationControllers.getNotifications);
// Get unread count (total + by category)
// GET /api/notifications/unread-count
router.get('/unread-count', (0, auth_1.default)(), notification_controller_1.NotificationControllers.getUnreadCount);
// ─────────────────────────────────────────────────────────────────────────────
// UPDATE ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Mark single notification as read
// PATCH /api/notifications/:notificationId/read
router.patch('/:notificationId/read', (0, auth_1.default)(), notification_controller_1.NotificationControllers.markAsRead);
// Mark all as read (optionally by category)
// PATCH /api/notifications/read-all?category=JOB
router.patch('/read-all', (0, auth_1.default)(), notification_controller_1.NotificationControllers.markAllAsRead);
// ─────────────────────────────────────────────────────────────────────────────
// DELETE ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Delete single notification
// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', (0, auth_1.default)(), notification_controller_1.NotificationControllers.deleteNotification);
// Delete all by category
// DELETE /api/notifications/category/:category
router.delete('/category/:category', (0, auth_1.default)(), notification_controller_1.NotificationControllers.deleteAllByCategory);
exports.NotificationRoutes = router;
//# sourceMappingURL=notification.routes.js.map