"use strict";
/**
 * Timezone Configuration
 *
 * Configure the timezone for date/time formatting in emails and SMS
 *
 * Common timezones:
 * - 'Asia/Dhaka' - Bangladesh (UTC+6)
 * - 'Asia/Karachi' - Pakistan (UTC+5)
 * - 'Asia/Kolkata' - India (UTC+5:30)
 * - 'UTC' - Coordinated Universal Time
 * - 'America/New_York' - Eastern Time (UTC-5/-4)
 * - 'Europe/London' - UK (UTC+0/+1)
 *
 * See full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateTime = exports.formatTime = exports.formatDate = exports.TIMEZONE_CONFIG = void 0;
exports.TIMEZONE_CONFIG = {
    // Default timezone for the application
    DEFAULT_TIMEZONE: 'Asia/Dhaka', // Bangladesh timezone (UTC+6)
    // Date format options
    DATE_FORMAT: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    },
    // Time format options
    TIME_FORMAT: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }
};
/**
 * Format a date to localized date string
 */
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        ...exports.TIMEZONE_CONFIG.DATE_FORMAT,
        timeZone: exports.TIMEZONE_CONFIG.DEFAULT_TIMEZONE
    });
};
exports.formatDate = formatDate;
/**
 * Format a date to localized time string
 */
const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
        ...exports.TIMEZONE_CONFIG.TIME_FORMAT,
        timeZone: exports.TIMEZONE_CONFIG.DEFAULT_TIMEZONE
    });
};
exports.formatTime = formatTime;
/**
 * Format a date to both date and time strings
 */
const formatDateTime = (date) => {
    return {
        date: (0, exports.formatDate)(date),
        time: (0, exports.formatTime)(date)
    };
};
exports.formatDateTime = formatDateTime;
//# sourceMappingURL=timezone.config.js.map