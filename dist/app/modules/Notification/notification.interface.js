"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationCategory = exports.NOTIFICATION_CATEGORY = exports.NOTIFICATION_PRIORITY = exports.NOTIFICATION_TYPES = void 0;
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
exports.NOTIFICATION_TYPES = {
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
};
// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION PRIORITY
// ─────────────────────────────────────────────────────────────────────────────
exports.NOTIFICATION_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
};
// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION CATEGORY (for grouping)
// ─────────────────────────────────────────────────────────────────────────────
exports.NOTIFICATION_CATEGORY = {
    MESSAGE: 'MESSAGE',
    JOB: 'JOB',
    APPLICATION: 'APPLICATION',
    ACCOUNT: 'ACCOUNT',
    SYSTEM: 'SYSTEM',
};
// ─────────────────────────────────────────────────────────────────────────────
// HELPER TO GET CATEGORY FROM TYPE
// ─────────────────────────────────────────────────────────────────────────────
const getNotificationCategory = (type) => {
    if (type === 'NEW_MESSAGE')
        return 'MESSAGE';
    if (type.startsWith('JOB_') || type === 'JOB_ALERT')
        return 'JOB';
    if (type.startsWith('APPLICATION_'))
        return 'APPLICATION';
    if (type.startsWith('COMPANY_') || type.startsWith('PROFILE_'))
        return 'ACCOUNT';
    return 'SYSTEM';
};
exports.getNotificationCategory = getNotificationCategory;
//# sourceMappingURL=notification.interface.js.map