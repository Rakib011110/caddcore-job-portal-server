import httpStatus  from 'http-status';
import config from "../../../config";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.services";
import sendResponse from '../../utils/sendResponse';

// Blacklist for revoked tokens (in production, use Redis or database)
const tokenBlacklist = new Set<string>();

const registerUser = catchAsync(async (req, res) => {
    const result = await AuthServices.registerUser(req.body);

    const {refreshToken, accessToken} = result;

    // Set secure HTTP-only cookies
    res.cookie('refreshToken', refreshToken, {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User registered successfully!',
      data: {
        accessToken,
        refreshToken,
      },
    });
});

const loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body);
    const { refreshToken, accessToken } = result;

    // Set secure HTTP-only cookies
    res.cookie('refreshToken', refreshToken, {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User logged in successfully!',
      data: {
        accessToken,
        refreshToken,
      },
    });
});

const logout = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  // Add token to blacklist if it exists
  if (token) {
    tokenBlacklist.add(token);
  }

  // Clear cookies
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged out successfully!',
    data: null,
  });
});

const changePassword = catchAsync(async (req, res) => {
    const { ...passwordData } = req.body;

    if (!req.user) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: 'User not authenticated',
        data: null,
      });
    }

    const result = await AuthServices.changePassword(req.user, passwordData);

    // Invalidate all existing tokens for this user (force re-login)
    // In production, you might want to implement token versioning

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Password updated successfully!',
      data: result,
    });
});

const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: 'Refresh token not found',
        data: null,
      });
    }

    const result = await AuthServices.refreshToken(refreshToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Access token retrieved successfully!',
      data: result,
    });
});

// Add this new controller
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;
  const result = await AuthServices.verifyEmail(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.user,
  });
});

const resendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthServices.resendVerificationEmail(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User ID not found in token',
      data: null,
    });
  }

  const result = await AuthServices.getMyProfile(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const bulkRegisterUsers = catchAsync(async (req, res) => {
  const result = await AuthServices.bulkRegisterUsers(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: {
      successful: result.successful,
      errors: result.errors,
      totalProcessed: result.totalProcessed,
      successCount: result.successCount,
      errorCount: result.errorCount
    },
  });
});

// Helper function to check if token is blacklisted
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// Clean up expired tokens from blacklist periodically (in production, use Redis TTL)
setInterval(() => {
  // In production, implement proper cleanup based on token expiry
  // For now, we'll keep a reasonable size limit
  if (tokenBlacklist.size > 10000) {
    tokenBlacklist.clear();
  }
}, 3600000); // Clean every hour

export const AuthControllers = {
  registerUser,
  loginUser,
  logout,
  changePassword,
  refreshToken,
  verifyEmail,
  resendVerificationEmail,
  getMyProfile,
  forgotPassword,
  resetPassword,
  bulkRegisterUsers,
  isTokenBlacklisted,
};