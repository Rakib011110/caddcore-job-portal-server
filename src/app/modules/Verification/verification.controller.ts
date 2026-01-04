import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { VerificationServices } from './verification.services';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VERIFICATION CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// USER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply for verification
 */
const applyForVerification = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  const result = await VerificationServices.applyForVerification(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Verification request submitted successfully',
    data: result,
  });
});

/**
 * Get my verification status
 */
const getMyVerificationStatus = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  const result = await VerificationServices.getMyVerificationStatus(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Verification status fetched successfully',
    data: result,
  });
});

/**
 * Update verification request
 */
const updateVerificationRequest = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Request ID is required',
      data: null,
    });
  }

  const result = await VerificationServices.updateVerificationRequest(id, userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Verification request updated successfully',
    data: result,
  });
});

/**
 * Cancel verification request
 */
const cancelVerificationRequest = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Request ID is required',
      data: null,
    });
  }

  const result = await VerificationServices.cancelVerificationRequest(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

/**
 * Get courses list
 */
const getCoursesList = catchAsync(async (req, res) => {
  const result = VerificationServices.getCoursesList();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Courses list fetched successfully',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all verification requests (Admin)
 */
const getAllVerificationRequests = catchAsync(async (req, res) => {
  const { status, page, limit, searchTerm } = req.query;

  const result = await VerificationServices.getAllVerificationRequests({
    status: status as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    searchTerm: searchTerm as string,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Verification requests fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * Get single verification request (Admin)
 */
const getSingleVerificationRequest = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Request ID is required',
      data: null,
    });
  }

  const result = await VerificationServices.getSingleVerificationRequest(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Verification request fetched successfully',
    data: result,
  });
});

/**
 * Approve verification request (Admin)
 */
const approveVerification = catchAsync(async (req, res) => {
  const adminId = req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!adminId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Request ID is required',
      data: null,
    });
  }

  const result = await VerificationServices.approveVerification(id, adminId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Verification request approved successfully',
    data: result,
  });
});

/**
 * Reject verification request (Admin)
 */
const rejectVerification = catchAsync(async (req, res) => {
  const adminId = req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!adminId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Request ID is required',
      data: null,
    });
  }

  const result = await VerificationServices.rejectVerification(id, adminId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Verification request rejected',
    data: result,
  });
});

/**
 * Get verification stats (Admin)
 */
const getVerificationStats = catchAsync(async (req, res) => {
  const result = await VerificationServices.getVerificationStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Verification stats fetched successfully',
    data: result,
  });
});

/**
 * Upgrade user to Platinum badge (Admin)
 */
const upgradeToPlatinum = catchAsync(async (req, res) => {
  const adminId = req.user?._id || req.user?.id;
  const { userId } = req.params;

  if (!adminId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      data: null,
    });
  }

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'User ID is required',
      data: null,
    });
  }

  const result = await VerificationServices.upgradeToPlatinum(userId, adminId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

export const VerificationControllers = {
  // User
  applyForVerification,
  getMyVerificationStatus,
  updateVerificationRequest,
  cancelVerificationRequest,
  getCoursesList,
  
  // Admin
  getAllVerificationRequests,
  getSingleVerificationRequest,
  approveVerification,
  rejectVerification,
  getVerificationStats,
  upgradeToPlatinum,
};
