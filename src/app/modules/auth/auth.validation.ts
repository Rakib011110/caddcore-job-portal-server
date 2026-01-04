import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Name is required',
    }),
    email: z
      .string({
        message: 'Email is required',
      })
      .email({
        message: 'Invalid email address',
      }),
    password: z
      .string({
        message: 'Password is required',
      })
      .min(6, {
        message: 'Password must be at least 6 characters',
      }),
    mobileNumber: z.string({
      message: 'Mobile number is required',
    }),
    nid: z.string().optional(),
    address: z.string().optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: 'Email is required',
      })
      .email({
        message: 'Invalid email address',
      }),
    password: z.string({
      message: 'Password is required',
    }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      message: 'Old password is required',
    }),
    newPassword: z
      .string({
        message: 'New password is required',
      })
      .min(6, {
        message: 'Password must be at least 6 characters',
      }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      message: 'Refresh token is required',
    }),
  }),
});

const verifyEmailValidationSchema = z.object({
  body: z.object({
    token: z.string({
      message: 'Verification token is required',
    }),
  }),
});

const resendVerificationEmailValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: 'Email is required',
      })
      .email({
        message: 'Invalid email address',
      }),
  }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: 'Email is required',
      })
      .email({
        message: 'Invalid email address',
      }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string({
      message: 'Reset token is required',
    }),
    newPassword: z
      .string({
        message: 'New password is required',
      })
      .min(6, {
        message: 'Password must be at least 6 characters',
      }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  verifyEmailValidationSchema,
  resendVerificationEmailValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
