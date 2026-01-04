"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const registerValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            message: 'Name is required',
        }),
        email: zod_1.z
            .string({
            message: 'Email is required',
        })
            .email({
            message: 'Invalid email address',
        }),
        password: zod_1.z
            .string({
            message: 'Password is required',
        })
            .min(6, {
            message: 'Password must be at least 6 characters',
        }),
        mobileNumber: zod_1.z.string({
            message: 'Mobile number is required',
        }),
        nid: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    }),
});
const loginValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            message: 'Email is required',
        })
            .email({
            message: 'Invalid email address',
        }),
        password: zod_1.z.string({
            message: 'Password is required',
        }),
    }),
});
const changePasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string({
            message: 'Old password is required',
        }),
        newPassword: zod_1.z
            .string({
            message: 'New password is required',
        })
            .min(6, {
            message: 'Password must be at least 6 characters',
        }),
    }),
});
const refreshTokenValidationSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string({
            message: 'Refresh token is required',
        }),
    }),
});
const verifyEmailValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string({
            message: 'Verification token is required',
        }),
    }),
});
const resendVerificationEmailValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            message: 'Email is required',
        })
            .email({
            message: 'Invalid email address',
        }),
    }),
});
const forgotPasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            message: 'Email is required',
        })
            .email({
            message: 'Invalid email address',
        }),
    }),
});
const resetPasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string({
            message: 'Reset token is required',
        }),
        newPassword: zod_1.z
            .string({
            message: 'New password is required',
        })
            .min(6, {
            message: 'Password must be at least 6 characters',
        }),
    }),
});
exports.AuthValidation = {
    registerValidationSchema,
    loginValidationSchema,
    changePasswordValidationSchema,
    refreshTokenValidationSchema,
    verifyEmailValidationSchema,
    resendVerificationEmailValidationSchema,
    forgotPasswordValidationSchema,
    resetPasswordValidationSchema,
};
//# sourceMappingURL=auth.validation.js.map