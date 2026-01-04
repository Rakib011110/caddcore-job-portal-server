"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const mongoose_1 = require("mongoose");
const notification_model_1 = require("./notification.model");
const notification_interface_1 = require("./notification.interface");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Developer-friendly service with helper functions for easy notification creation.
 *
 * USAGE EXAMPLES:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * // Simple notification
 * await NotificationService.create({
 *   userId: user._id,
 *   type: 'JOB_ALERT',
 *   title: 'New Job Match!',
 *   message: '5 new jobs match your preferences',
 *   link: '/jobs'
 * });
 *
 * // Quick helper for application status
 * await NotificationService.notifyApplicationStatus(
 *   applicantId,
 *   'SHORTLISTED',
 *   jobTitle,
 *   applicationId
 * );
 *
 * // Bulk notification for job alerts
 * await NotificationService.notifyJobAlert(userIds, job);
 *
 */
// ─────────────────────────────────────────────────────────────────────────────
// CORE CRUD OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────
const create = async (payload) => {
    const notification = await notification_model_1.Notification.create({
        userId: payload.userId,
        type: payload.type,
        category: (0, notification_interface_1.getNotificationCategory)(payload.type),
        title: payload.title,
        message: payload.message,
        data: payload.data || {},
        link: payload.link,
        priority: payload.priority || 'MEDIUM',
        read: false,
        emailSent: false,
        pushSent: false,
    });
    // TODO: Optionally send email/push notification here
    // if (payload.sendEmail) { ... }
    // if (payload.sendPush) { ... }
    return notification;
};
const createBulk = async (payload) => {
    const notifications = payload.userIds.map(userId => {
        const notification = {
            userId,
            type: payload.type,
            category: (0, notification_interface_1.getNotificationCategory)(payload.type),
            title: payload.title,
            message: payload.message,
            data: payload.data || {},
            priority: payload.priority || 'MEDIUM',
            read: false,
            emailSent: false,
            pushSent: false,
        };
        if (payload.link) {
            notification.link = payload.link;
        }
        return notification;
    });
    return notification_model_1.Notification.insertMany(notifications);
};
const getByUserId = async (userId, options = {}) => {
    const { page = 1, limit = 20, category, unreadOnly = false } = options;
    const filter = { userId, isDeleted: false };
    if (category)
        filter.category = category;
    if (unreadOnly)
        filter.read = false;
    const [notifications, total, unreadCount] = await Promise.all([
        notification_model_1.Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        notification_model_1.Notification.countDocuments(filter),
        notification_model_1.Notification.countDocuments({ userId, read: false, isDeleted: false }),
    ]);
    return { notifications: notifications, total, unreadCount };
};
const getUnreadCount = async (userId) => {
    return notification_model_1.Notification.countDocuments({ userId, read: false, isDeleted: false });
};
const getUnreadCountByCategory = async (userId) => {
    const result = await notification_model_1.Notification.aggregate([
        { $match: { userId: new mongoose_1.Types.ObjectId(userId), read: false, isDeleted: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const counts = {
        MESSAGE: 0,
        JOB: 0,
        APPLICATION: 0,
        ACCOUNT: 0,
        SYSTEM: 0,
    };
    result.forEach(item => {
        counts[item._id] = item.count;
    });
    return counts;
};
const markAsRead = async (notificationId, userId) => {
    return notification_model_1.Notification.findOneAndUpdate({ _id: notificationId, userId, isDeleted: false }, { $set: { read: true, readAt: new Date() } }, { new: true });
};
const markAllAsRead = async (userId, category) => {
    const filter = { userId, read: false, isDeleted: false };
    if (category)
        filter.category = category;
    const result = await notification_model_1.Notification.updateMany(filter, { $set: { read: true, readAt: new Date() } });
    return result.modifiedCount;
};
const deleteNotification = async (notificationId, userId) => {
    const result = await notification_model_1.Notification.findOneAndUpdate({ _id: notificationId, userId }, { $set: { isDeleted: true, deletedAt: new Date() } });
    return !!result;
};
const deleteAllByCategory = async (userId, category) => {
    const result = await notification_model_1.Notification.updateMany({ userId, category, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } });
    return result.modifiedCount;
};
// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPER-FRIENDLY HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Notify user about new message
 */
const notifyNewMessage = async (userId, senderName, conversationId, messagePreview) => {
    return create({
        userId,
        type: notification_interface_1.NOTIFICATION_TYPES.NEW_MESSAGE,
        title: `New message from ${senderName}`,
        message: messagePreview || 'You have a new message',
        data: { conversationId },
        link: `/user-profile/messages?conversation=${conversationId}`,
        priority: 'MEDIUM',
    });
};
/**
 * Notify users about matching job alert
 */
const notifyJobAlert = async (userIds, job) => {
    return createBulk({
        userIds,
        type: notification_interface_1.NOTIFICATION_TYPES.JOB_ALERT,
        title: 'New Job Match!',
        message: `${job.title}${job.company ? ` at ${job.company}` : ''} matches your preferences`,
        data: { jobId: job._id },
        link: `/jobs/${job._id}`,
        priority: 'MEDIUM',
    });
};
/**
 * Notify about application status change
 */
const notifyApplicationStatus = async (userId, status, jobTitle, applicationId, jobId) => {
    const statusMessages = {
        VIEWED: {
            type: notification_interface_1.NOTIFICATION_TYPES.APPLICATION_VIEWED,
            title: 'Application Viewed',
            message: `Your application for "${jobTitle}" was viewed`
        },
        SHORTLISTED: {
            type: notification_interface_1.NOTIFICATION_TYPES.APPLICATION_SHORTLISTED,
            title: '🎉 You\'re Shortlisted!',
            message: `Congratulations! You've been shortlisted for "${jobTitle}"`,
            priority: 'HIGH'
        },
        REJECTED: {
            type: notification_interface_1.NOTIFICATION_TYPES.APPLICATION_REJECTED,
            title: 'Application Update',
            message: `Your application for "${jobTitle}" was not selected`
        },
        SELECTED: {
            type: notification_interface_1.NOTIFICATION_TYPES.APPLICATION_SELECTED,
            title: '🎉 Congratulations!',
            message: `You've been selected for "${jobTitle}"!`,
            priority: 'URGENT'
        },
    };
    const info = statusMessages[status];
    // Build data object conditionally to avoid undefined values
    const data = { applicationId };
    if (jobId) {
        data.jobId = jobId;
    }
    return create({
        userId,
        type: info.type,
        title: info.title,
        message: info.message,
        data,
        link: `/user-profile/applications`,
        priority: info.priority || 'MEDIUM',
    });
};
/**
 * Notify company about new application
 */
const notifyNewApplication = async (companyUserId, applicantName, jobTitle, applicationId, jobId) => {
    return create({
        userId: companyUserId,
        type: notification_interface_1.NOTIFICATION_TYPES.APPLICATION_RECEIVED,
        title: 'New Application Received',
        message: `${applicantName} applied for "${jobTitle}"`,
        data: { applicationId, jobId },
        link: `/company/applications/${applicationId}`,
        priority: 'MEDIUM',
    });
};
/**
 * Notify company about approval status
 */
const notifyCompanyStatus = async (userId, status, reason) => {
    const statusInfo = {
        APPROVED: {
            type: notification_interface_1.NOTIFICATION_TYPES.COMPANY_APPROVED,
            title: '🎉 Company Approved!',
            message: 'Your company has been approved. You can now post jobs!',
            priority: 'HIGH',
        },
        REJECTED: {
            type: notification_interface_1.NOTIFICATION_TYPES.COMPANY_REJECTED,
            title: 'Company Application Rejected',
            message: reason || 'Your company application was not approved.',
            priority: 'HIGH',
        },
        SUSPENDED: {
            type: notification_interface_1.NOTIFICATION_TYPES.COMPANY_SUSPENDED,
            title: 'Company Suspended',
            message: reason || 'Your company has been suspended.',
            priority: 'URGENT',
        },
    };
    const info = statusInfo[status];
    return create({
        userId,
        type: info.type,
        title: info.title,
        message: info.message,
        link: '/company',
        priority: info.priority,
    });
};
/**
 * Send welcome notification to new user
 */
const notifyWelcome = async (userId, userName) => {
    return create({
        userId,
        type: notification_interface_1.NOTIFICATION_TYPES.WELCOME,
        title: `Welcome to CADDCORE, ${userName}!`,
        message: 'Complete your profile to get started and find your dream job.',
        link: '/user-profile/profile',
        priority: 'LOW',
    });
};
/**
 * Send system announcement to multiple users
 */
const notifySystemAnnouncement = async (userIds, title, message, link) => {
    const payload = {
        userIds,
        type: notification_interface_1.NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
        title,
        message,
        priority: 'LOW',
    };
    if (link) {
        payload.link = link;
    }
    return createBulk(payload);
};
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SERVICE
// ─────────────────────────────────────────────────────────────────────────────
exports.NotificationService = {
    // Core CRUD
    create,
    createBulk,
    getByUserId,
    getUnreadCount,
    getUnreadCountByCategory,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllByCategory,
    // Developer-friendly helpers
    notifyNewMessage,
    notifyJobAlert,
    notifyApplicationStatus,
    notifyNewApplication,
    notifyCompanyStatus,
    notifyWelcome,
    notifySystemAnnouncement,
};
//# sourceMappingURL=notification.service.js.map