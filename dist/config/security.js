"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityUtils = exports.SECURITY_CONFIG = void 0;
// Backend Security Configuration
exports.SECURITY_CONFIG = {
    // Rate limiting
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_ATTEMPTS: 20, // Increased from 5 to 20 for development
        SKIP_SUCCESSFUL_REQUESTS: true,
        SKIP_FAILED_REQUESTS: false,
    },
    // CORS configuration
    CORS: {
        origin: process.env.NODE_ENV === 'production'
            ? [
                process.env.FRONTEND_URL || 'https://basebd.org',
                process.env.CLIENT_URL || 'http://localhost:3000'
            ]
            : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    // Helmet security headers
    HELMET: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
    },
    // Token security
    JWT: {
        ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '2d',
        REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    // Password security
    BCRYPT: {
        SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    },
    // File upload security
    FILE_UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        MAX_FILES: 5,
    },
    // Session security
    SESSION: {
        SECRET: process.env.SESSION_SECRET || 'your-super-secret-session-key',
        RESAVE: false,
        SAVE_UNINITIALIZED: false,
        COOKIE: {
            SECURE: process.env.NODE_ENV === 'production',
            HTTP_ONLY: true,
            MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
            SAME_SITE: 'strict',
        },
    },
};
// Security utility functions
class SecurityUtils {
    // Validate email format
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Sanitize string input
    static sanitizeString(input) {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    }
    // Check for SQL injection patterns
    static hasSQLInjection(input) {
        const sqlPatterns = [
            /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
            /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\%27)|(\%22)|(\%3B)|(\%2F\*))/i,
        ];
        return sqlPatterns.some(pattern => pattern.test(input));
    }
    // Check for XSS patterns
    static hasXSS(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        ];
        return xssPatterns.some(pattern => pattern.test(input));
    }
    // Generate secure random string
    static generateSecureToken(length = 32) {
        return require('crypto').randomBytes(length).toString('hex');
    }
    // Hash password
    static async hashPassword(password) {
        const bcrypt = require('bcryptjs');
        return await bcrypt.hash(password, exports.SECURITY_CONFIG.BCRYPT.SALT_ROUNDS);
    }
    // Verify password
    static async verifyPassword(password, hash) {
        const bcrypt = require('bcryptjs');
        return await bcrypt.compare(password, hash);
    }
    // Log security events
    static logSecurityEvent(event, details, req) {
        const timestamp = new Date().toISOString();
        const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
        const userAgent = req?.headers?.['user-agent'] || 'unknown';
        console.warn(`[SECURITY EVENT] ${timestamp} | IP: ${ip} | UA: ${userAgent}`);
        console.warn(`Event: ${event}`, details);
    }
    // Check if request is suspicious
    static isSuspiciousRequest(req) {
        const userAgent = req.headers?.['user-agent'] || '';
        const suspiciousPatterns = [
            /sqlmap/i,
            /nmap/i,
            /nikto/i,
            /dirbuster/i,
            /gobuster/i,
            /burpsuite/i,
            /owasp/i,
            /acunetix/i,
            /metasploit/i,
        ];
        return suspiciousPatterns.some(pattern => pattern.test(userAgent));
    }
}
exports.SecurityUtils = SecurityUtils;
//# sourceMappingURL=security.js.map