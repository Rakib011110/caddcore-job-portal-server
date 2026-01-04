import { JwtPayload } from 'jsonwebtoken';
import { TLoginUser, TRegisterUser, TBulkRegisterUser } from './auth.interface';
import { TForgotPassword, TResetPassword } from './auth.interface';
export declare const registerUser: (payload: TRegisterUser) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: "ADMIN" | "COMPANY" | "TEACHER" | "STUDENT" | "USER" | "HR" | "MARKETING_TEAM" | "CUSTOMER_SERVICE_TEAM";
        emailVerified: boolean | undefined;
    };
}>;
export declare const AuthServices: {
    registerUser: (payload: TRegisterUser) => Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            _id: string;
            name: string;
            email: string;
            role: "ADMIN" | "COMPANY" | "TEACHER" | "STUDENT" | "USER" | "HR" | "MARKETING_TEAM" | "CUSTOMER_SERVICE_TEAM";
            emailVerified: boolean | undefined;
        };
    }>;
    loginUser: (payload: TLoginUser) => Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout: (token: string) => Promise<{
        message: string;
    }>;
    changePassword: (userData: JwtPayload, payload: {
        oldPassword: string;
        newPassword: string;
    }) => Promise<null>;
    refreshToken: (token: string) => Promise<{
        accessToken: string;
    }>;
    verifyEmail: (token: string) => Promise<{
        message: string;
        user: {
            _id: string;
            name: string;
            email: string;
            emailVerified: boolean;
        };
    }>;
    resendVerificationEmail: (email: string) => Promise<{
        message: string;
    }>;
    getMyProfile: (userId: string) => Promise<any>;
    forgotPassword: (payload: TForgotPassword) => Promise<{
        message: string;
    }>;
    resetPassword: (payload: TResetPassword) => Promise<{
        message: string;
    }>;
    bulkRegisterUsers: (payload: TBulkRegisterUser) => Promise<{
        message: string;
        successful: {
            _id: string;
            name: string;
            email: string;
            role: "ADMIN" | "COMPANY" | "TEACHER" | "STUDENT" | "USER" | "HR" | "MARKETING_TEAM" | "CUSTOMER_SERVICE_TEAM";
            emailVerified: boolean | undefined;
        }[];
        errors: {
            email: string;
            error: any;
        }[];
        totalProcessed: number;
        successCount: number;
        errorCount: number;
    }>;
};
//# sourceMappingURL=auth.services.d.ts.map