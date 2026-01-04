export declare const SECURITY_CONFIG: {
    RATE_LIMIT: {
        WINDOW_MS: number;
        MAX_ATTEMPTS: number;
        SKIP_SUCCESSFUL_REQUESTS: boolean;
        SKIP_FAILED_REQUESTS: boolean;
    };
    CORS: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    HELMET: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: string[];
                styleSrc: string[];
                scriptSrc: string[];
                imgSrc: string[];
                connectSrc: string[];
                fontSrc: string[];
                objectSrc: string[];
                mediaSrc: string[];
                frameSrc: string[];
            };
        };
        hsts: {
            maxAge: number;
            includeSubDomains: boolean;
            preload: boolean;
        };
    };
    JWT: {
        ACCESS_SECRET: string | undefined;
        REFRESH_SECRET: string | undefined;
        ACCESS_EXPIRES_IN: string;
        REFRESH_EXPIRES_IN: string;
    };
    BCRYPT: {
        SALT_ROUNDS: number;
    };
    FILE_UPLOAD: {
        MAX_FILE_SIZE: number;
        ALLOWED_TYPES: string[];
        MAX_FILES: number;
    };
    SESSION: {
        SECRET: string;
        RESAVE: boolean;
        SAVE_UNINITIALIZED: boolean;
        COOKIE: {
            SECURE: boolean;
            HTTP_ONLY: boolean;
            MAX_AGE: number;
            SAME_SITE: string;
        };
    };
};
export declare class SecurityUtils {
    static isValidEmail(email: string): boolean;
    static sanitizeString(input: string): string;
    static hasSQLInjection(input: string): boolean;
    static hasXSS(input: string): boolean;
    static generateSecureToken(length?: number): string;
    static hashPassword(password: string): Promise<string>;
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    static logSecurityEvent(event: string, details: any, req?: any): void;
    static isSuspiciousRequest(req: any): boolean;
}
//# sourceMappingURL=security.d.ts.map