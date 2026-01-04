import express from 'express';
import { NotificationControllers } from './notification.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

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
router.get(
  '/',
  auth(),
  NotificationControllers.getNotifications
);

// Get unread count (total + by category)
// GET /api/notifications/unread-count
router.get(
  '/unread-count',
  auth(),
  NotificationControllers.getUnreadCount
);

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Mark single notification as read
// PATCH /api/notifications/:notificationId/read
router.patch(
  '/:notificationId/read',
  auth(),
  NotificationControllers.markAsRead
);

// Mark all as read (optionally by category)
// PATCH /api/notifications/read-all?category=JOB
router.patch(
  '/read-all',
  auth(),
  NotificationControllers.markAllAsRead
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Delete single notification
// DELETE /api/notifications/:notificationId
router.delete(
  '/:notificationId',
  auth(),
  NotificationControllers.deleteNotification
);

// Delete all by category
// DELETE /api/notifications/category/:category
router.delete(
  '/category/:category',
  auth(),
  NotificationControllers.deleteAllByCategory
);

export const NotificationRoutes = router;
