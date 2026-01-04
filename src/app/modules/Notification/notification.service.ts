import { Types } from 'mongoose';
import { Notification } from './notification.model';
import {
  INotification,
  ICreateNotificationPayload,
  IBulkCreateNotificationPayload,
  INotificationFilters,
  TNotificationType,
  TNotificationCategory,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  getNotificationCategory,
} from './notification.interface';

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

const create = async (payload: ICreateNotificationPayload): Promise<INotification> => {
  const notification = await Notification.create({
    userId: payload.userId,
    type: payload.type,
    category: getNotificationCategory(payload.type),
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

const createBulk = async (payload: IBulkCreateNotificationPayload): Promise<INotification[]> => {
  const notifications = payload.userIds.map(userId => {
    const notification: Record<string, unknown> = {
      userId,
      type: payload.type,
      category: getNotificationCategory(payload.type),
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
  
  return Notification.insertMany(notifications) as unknown as Promise<INotification[]>;
};

const getByUserId = async (
  userId: string, 
  options: { 
    page?: number; 
    limit?: number; 
    category?: TNotificationCategory;
    unreadOnly?: boolean;
  } = {}
): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> => {
  const { page = 1, limit = 20, category, unreadOnly = false } = options;
  
  const filter: any = { userId, isDeleted: false };
  if (category) filter.category = category;
  if (unreadOnly) filter.read = false;
  
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, read: false, isDeleted: false }),
  ]);
  
  return { notifications: notifications as INotification[], total, unreadCount };
};

const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ userId, read: false, isDeleted: false });
};

const getUnreadCountByCategory = async (userId: string): Promise<Record<TNotificationCategory, number>> => {
  const result = await Notification.aggregate([
    { $match: { userId: new Types.ObjectId(userId), read: false, isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const counts: Record<string, number> = {
    MESSAGE: 0,
    JOB: 0,
    APPLICATION: 0,
    ACCOUNT: 0,
    SYSTEM: 0,
  };
  
  result.forEach(item => {
    counts[item._id] = item.count;
  });
  
  return counts as Record<TNotificationCategory, number>;
};

const markAsRead = async (notificationId: string, userId: string): Promise<INotification | null> => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId, isDeleted: false },
    { $set: { read: true, readAt: new Date() } },
    { new: true }
  );
};

const markAllAsRead = async (userId: string, category?: TNotificationCategory): Promise<number> => {
  const filter: any = { userId, read: false, isDeleted: false };
  if (category) filter.category = category;
  
  const result = await Notification.updateMany(
    filter,
    { $set: { read: true, readAt: new Date() } }
  );
  
  return result.modifiedCount;
};

const deleteNotification = async (notificationId: string, userId: string): Promise<boolean> => {
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );
  return !!result;
};

const deleteAllByCategory = async (userId: string, category: TNotificationCategory): Promise<number> => {
  const result = await Notification.updateMany(
    { userId, category, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );
  return result.modifiedCount;
};

// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPER-FRIENDLY HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notify user about new message
 */
const notifyNewMessage = async (
  userId: string | Types.ObjectId,
  senderName: string,
  conversationId: string,
  messagePreview?: string
): Promise<INotification> => {
  return create({
    userId,
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
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
const notifyJobAlert = async (
  userIds: (string | Types.ObjectId)[],
  job: { _id: string; title: string; company?: string }
): Promise<INotification[]> => {
  return createBulk({
    userIds,
    type: NOTIFICATION_TYPES.JOB_ALERT,
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
const notifyApplicationStatus = async (
  userId: string | Types.ObjectId,
  status: 'VIEWED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED',
  jobTitle: string,
  applicationId: string,
  jobId?: string
): Promise<INotification> => {
  const statusMessages = {
    VIEWED: { 
      type: NOTIFICATION_TYPES.APPLICATION_VIEWED, 
      title: 'Application Viewed', 
      message: `Your application for "${jobTitle}" was viewed` 
    },
    SHORTLISTED: { 
      type: NOTIFICATION_TYPES.APPLICATION_SHORTLISTED, 
      title: '🎉 You\'re Shortlisted!', 
      message: `Congratulations! You've been shortlisted for "${jobTitle}"`,
      priority: 'HIGH' as const
    },
    REJECTED: { 
      type: NOTIFICATION_TYPES.APPLICATION_REJECTED, 
      title: 'Application Update', 
      message: `Your application for "${jobTitle}" was not selected` 
    },
    SELECTED: { 
      type: NOTIFICATION_TYPES.APPLICATION_SELECTED, 
      title: '🎉 Congratulations!', 
      message: `You've been selected for "${jobTitle}"!`,
      priority: 'URGENT' as const
    },
  };
  
  const info = statusMessages[status];
  
  // Build data object conditionally to avoid undefined values
  const data: { applicationId: string; jobId?: string } = { applicationId };
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
    priority: (info as any).priority || 'MEDIUM',
  });
};

/**
 * Notify company about new application
 */
const notifyNewApplication = async (
  companyUserId: string | Types.ObjectId,
  applicantName: string,
  jobTitle: string,
  applicationId: string,
  jobId: string
): Promise<INotification> => {
  return create({
    userId: companyUserId,
    type: NOTIFICATION_TYPES.APPLICATION_RECEIVED,
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
const notifyCompanyStatus = async (
  userId: string | Types.ObjectId,
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  reason?: string
): Promise<INotification> => {
  const statusInfo = {
    APPROVED: {
      type: NOTIFICATION_TYPES.COMPANY_APPROVED,
      title: '🎉 Company Approved!',
      message: 'Your company has been approved. You can now post jobs!',
      priority: 'HIGH' as const,
    },
    REJECTED: {
      type: NOTIFICATION_TYPES.COMPANY_REJECTED,
      title: 'Company Application Rejected',
      message: reason || 'Your company application was not approved.',
      priority: 'HIGH' as const,
    },
    SUSPENDED: {
      type: NOTIFICATION_TYPES.COMPANY_SUSPENDED,
      title: 'Company Suspended',
      message: reason || 'Your company has been suspended.',
      priority: 'URGENT' as const,
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
const notifyWelcome = async (
  userId: string | Types.ObjectId,
  userName: string
): Promise<INotification> => {
  return create({
    userId,
    type: NOTIFICATION_TYPES.WELCOME,
    title: `Welcome to CADDCORE, ${userName}!`,
    message: 'Complete your profile to get started and find your dream job.',
    link: '/user-profile/profile',
    priority: 'LOW',
  });
};

/**
 * Send system announcement to multiple users
 */
const notifySystemAnnouncement = async (
  userIds: (string | Types.ObjectId)[],
  title: string,
  message: string,
  link?: string
): Promise<INotification[]> => {
  const payload: Parameters<typeof createBulk>[0] = {
    userIds,
    type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
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

export const NotificationService = {
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
