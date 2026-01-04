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

export const TIMEZONE_CONFIG = {
  // Default timezone for the application
  DEFAULT_TIMEZONE: 'Asia/Dhaka', // Bangladesh timezone (UTC+6)
  
  // Date format options
  DATE_FORMAT: {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  },
  
  // Time format options
  TIME_FORMAT: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    hour12: true as const,
  }
};

/**
 * Format a date to localized date string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    ...TIMEZONE_CONFIG.DATE_FORMAT,
    timeZone: TIMEZONE_CONFIG.DEFAULT_TIMEZONE
  });
};

/**
 * Format a date to localized time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    ...TIMEZONE_CONFIG.TIME_FORMAT,
    timeZone: TIMEZONE_CONFIG.DEFAULT_TIMEZONE
  });
};

/**
 * Format a date to both date and time strings
 */
export const formatDateTime = (date: Date): { date: string; time: string } => {
  return {
    date: formatDate(date),
    time: formatTime(date)
  };
};
