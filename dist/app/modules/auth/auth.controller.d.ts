export declare const isTokenBlacklisted: (token: string) => boolean;
export declare const AuthControllers: {
    registerUser: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    loginUser: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    logout: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    changePassword: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    refreshToken: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    verifyEmail: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    resendVerificationEmail: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    getMyProfile: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    forgotPassword: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    resetPassword: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    bulkRegisterUsers: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    isTokenBlacklisted: (token: string) => boolean;
};
//# sourceMappingURL=auth.controller.d.ts.map