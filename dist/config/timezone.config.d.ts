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
export declare const TIMEZONE_CONFIG: {
    DEFAULT_TIMEZONE: string;
    DATE_FORMAT: {
        weekday: "long";
        year: "numeric";
        month: "long";
        day: "numeric";
    };
    TIME_FORMAT: {
        hour: "2-digit";
        minute: "2-digit";
        hour12: true;
    };
};
/**
 * Format a date to localized date string
 */
export declare const formatDate: (date: Date) => string;
/**
 * Format a date to localized time string
 */
export declare const formatTime: (date: Date) => string;
/**
 * Format a date to both date and time strings
 */
export declare const formatDateTime: (date: Date) => {
    date: string;
    time: string;
};
//# sourceMappingURL=timezone.config.d.ts.map