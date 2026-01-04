"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notification_interface_1 = require("./notification.interface");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: Object.values(notification_interface_1.NOTIFICATION_TYPES),
        required: true,
        index: true,
    },
    category: {
        type: String,
        enum: Object.values(notification_interface_1.NOTIFICATION_CATEGORY),
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    link: {
        type: String,
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
        index: true,
    },
    readAt: {
        type: Date,
    },
    priority: {
        type: String,
        enum: Object.values(notification_interface_1.NOTIFICATION_PRIORITY),
        default: 'MEDIUM',
    },
    emailSent: {
        type: Boolean,
        default: false,
    },
    pushSent: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────
// Compound index for efficient querying
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
// TTL index - auto-delete old read notifications after 90 days
NotificationSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
    partialFilterExpression: { read: true, isDeleted: false }
});
// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────
NotificationSchema.pre('save', function (next) {
    // Auto-set category based on type
    if (this.isNew && !this.category) {
        this.category = (0, notification_interface_1.getNotificationCategory)(this.type);
    }
    // Set readAt when read changes to true
    if (this.isModified('read') && this.read && !this.readAt) {
        this.readAt = new Date();
    }
    next();
});
// ─────────────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────────────
NotificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ userId, read: false, isDeleted: false });
};
NotificationSchema.statics.markAllAsRead = async function (userId) {
    await this.updateMany({ userId, read: false, isDeleted: false }, { $set: { read: true, readAt: new Date() } });
};
NotificationSchema.statics.markAsRead = async function (notificationId, userId) {
    return this.findOneAndUpdate({ _id: notificationId, userId, isDeleted: false }, { $set: { read: true, readAt: new Date() } }, { new: true });
};
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────────────────────────────────────────────
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
//# sourceMappingURL=notification.model.js.map