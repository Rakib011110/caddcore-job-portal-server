import mongoose, { Schema, model, Model } from 'mongoose';
import {
  INotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_CATEGORY,
  getNotificationCategory,
} from './notification.interface';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(NOTIFICATION_CATEGORY),
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
      type: Schema.Types.Mixed,
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
      enum: Object.values(NOTIFICATION_PRIORITY),
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
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

// Compound index for efficient querying
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

// TTL index - auto-delete old read notifications after 90 days
NotificationSchema.index(
  { createdAt: 1 },
  { 
    expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
    partialFilterExpression: { read: true, isDeleted: false }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

NotificationSchema.pre('save', function (next) {
  // Auto-set category based on type
  if (this.isNew && !this.category) {
    this.category = getNotificationCategory(this.type);
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

NotificationSchema.statics.getUnreadCount = async function (userId: string): Promise<number> {
  return this.countDocuments({ userId, read: false, isDeleted: false });
};

NotificationSchema.statics.markAllAsRead = async function (userId: string): Promise<void> {
  await this.updateMany(
    { userId, read: false, isDeleted: false },
    { $set: { read: true, readAt: new Date() } }
  );
};

NotificationSchema.statics.markAsRead = async function (notificationId: string, userId: string): Promise<INotification | null> {
  return this.findOneAndUpdate(
    { _id: notificationId, userId, isDeleted: false },
    { $set: { read: true, readAt: new Date() } },
    { new: true }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE FOR STATIC METHODS
// ─────────────────────────────────────────────────────────────────────────────

interface INotificationModel extends Model<INotification> {
  getUnreadCount(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<void>;
  markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────────────────────────────────────────────

export const Notification = model<INotification, INotificationModel>('Notification', NotificationSchema);
