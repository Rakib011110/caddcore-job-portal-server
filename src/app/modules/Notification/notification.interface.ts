import { Types } from 'mongoose';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive notification system for:
 * - Messages
 * - Job Alerts
 * - Application Updates
 * - Company Approvals
 * - System Announcements
 */

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  // Chat/Messages
  NEW_MESSAGE: 'NEW_MESSAGE',
  
  // Job Related
  JOB_ALERT: 'JOB_ALERT',
  JOB_POSTED: 'JOB_POSTED',
  JOB_EXPIRED: 'JOB_EXPIRED',
  
  // Application Related
  APPLICATION_RECEIVED: 'APPLICATION_RECEIVED',
  APPLICATION_VIEWED: 'APPLICATION_VIEWED',
  APPLICATION_SHORTLISTED: 'APPLICATION_SHORTLISTED',
  APPLICATION_REJECTED: 'APPLICATION_REJECTED',
  APPLICATION_SELECTED: 'APPLICATION_SELECTED',
  
  // Company Related
  COMPANY_APPROVED: 'COMPANY_APPROVED',
  COMPANY_REJECTED: 'COMPANY_REJECTED',
  COMPANY_SUSPENDED: 'COMPANY_SUSPENDED',
  
  // User Related
  PROFILE_VERIFIED: 'PROFILE_VERIFIED',
  PROFILE_VIEW: 'PROFILE_VIEW',
  
  // System
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
  WELCOME: 'WELCOME',
} as const;

export type TNotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION PRIORITY
// ─────────────────────────────────────────────────────────────────────────────

export const NOTIFICATION_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TNotificationPriority = typeof NOTIFICATION_PRIORITY[keyof typeof NOTIFICATION_PRIORITY];

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION CATEGORY (for grouping)
// ─────────────────────────────────────────────────────────────────────────────

export const NOTIFICATION_CATEGORY = {
  MESSAGE: 'MESSAGE',
  JOB: 'JOB',
  APPLICATION: 'APPLICATION',
  ACCOUNT: 'ACCOUNT',
  SYSTEM: 'SYSTEM',
} as const;

export type TNotificationCategory = typeof NOTIFICATION_CATEGORY[keyof typeof NOTIFICATION_CATEGORY];

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface INotification {
  _id: Types.ObjectId;
  
  // Recipient
  userId: Types.ObjectId | string;
  
  // Content
  type: TNotificationType;
  category: TNotificationCategory;
  title: string;
  message: string;
  
  // Optional data for linking
  data?: {
    jobId?: Types.ObjectId | string;
    applicationId?: Types.ObjectId | string;
    conversationId?: Types.ObjectId | string;
    messageId?: Types.ObjectId | string;
    companyId?: Types.ObjectId | string;
    senderId?: Types.ObjectId | string;
    [key: string]: any;
  };
  
  // Link to redirect when clicked
  link?: string;
  
  // Status
  read: boolean;
  readAt?: Date;
  
  // Priority
  priority: TNotificationPriority;
  
  // Delivery
  emailSent: boolean;
  pushSent: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Soft delete
  isDeleted: boolean;
  deletedAt?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE NOTIFICATION PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────

export interface ICreateNotificationPayload {
  userId: string | Types.ObjectId;
  type: TNotificationType;
  title: string;
  message: string;
  data?: INotification['data'];
  link?: string;
  priority?: TNotificationPriority;
  sendEmail?: boolean;
  sendPush?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK CREATE PAYLOAD (for job alerts to multiple users)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBulkCreateNotificationPayload {
  userIds: (string | Types.ObjectId)[];
  type: TNotificationType;
  title: string;
  message: string;
  data?: INotification['data'];
  link?: string;
  priority?: TNotificationPriority;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY FILTERS
// ─────────────────────────────────────────────────────────────────────────────

export interface INotificationFilters {
  userId?: string;
  type?: TNotificationType;
  category?: TNotificationCategory;
  read?: boolean;
  priority?: TNotificationPriority;
  startDate?: Date;
  endDate?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER TO GET CATEGORY FROM TYPE
// ─────────────────────────────────────────────────────────────────────────────

export const getNotificationCategory = (type: TNotificationType): TNotificationCategory => {
  if (type === 'NEW_MESSAGE') return 'MESSAGE';
  if (type.startsWith('JOB_') || type === 'JOB_ALERT') return 'JOB';
  if (type.startsWith('APPLICATION_')) return 'APPLICATION';
  if (type.startsWith('COMPANY_') || type.startsWith('PROFILE_')) return 'ACCOUNT';
  return 'SYSTEM';
};
