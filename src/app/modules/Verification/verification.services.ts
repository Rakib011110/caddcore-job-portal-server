import { User } from '../User/user.model';
import { VerificationRequest } from './verification.model';
import {
  IApplyVerificationInput,
  IApproveVerificationInput,
  IRejectVerificationInput,
  IVerificationStats,
  BadgeType,
} from './verification.interface';
import { BADGE_PRIORITY_SCORES, CADDCORE_COURSES } from './verification.constant';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VERIFICATION SERVICES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// USER SERVICES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply for CADDCORE verification
 */
const applyForVerification = async (userId: string, data: IApplyVerificationInput) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user already has a pending or approved verification
  const existingRequest = await VerificationRequest.findOne({
    userId,
    status: { $in: ['pending', 'approved'] },
  });

  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You already have a pending verification request'
      );
    }
    if (existingRequest.status === 'approved') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You are already verified'
      );
    }
  }

  // Create verification request
  const verificationRequest = await VerificationRequest.create({
    userId,
    ...data,
    appliedAt: new Date(),
  });

  // Update user's verification status to pending
  await User.findByIdAndUpdate(userId, {
    'caddcoreVerification.verificationStatus': 'pending',
  });

  return verificationRequest;
};

/**
 * Get my verification status
 */
const getMyVerificationStatus = async (userId: string) => {
  const user = await User.findById(userId).select('caddcoreVerification');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const latestRequest = await VerificationRequest.findOne({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    verification: user.caddcoreVerification || { verificationStatus: 'not_applied', isVerified: false },
    latestRequest,
  };
};

/**
 * Update pending verification request
 */
const updateVerificationRequest = async (
  requestId: string,
  userId: string,
  data: Partial<IApplyVerificationInput>
) => {
  const request = await VerificationRequest.findOne({
    _id: requestId,
    userId,
    status: 'pending',
  });

  if (!request) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Verification request not found or cannot be updated'
    );
  }

  Object.assign(request, data);
  await request.save();

  return request;
};

/**
 * Cancel pending verification request
 */
const cancelVerificationRequest = async (requestId: string, userId: string) => {
  const request = await VerificationRequest.findOne({
    _id: requestId,
    userId,
    status: 'pending',
  });

  if (!request) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Verification request not found or cannot be cancelled'
    );
  }

  await VerificationRequest.findByIdAndDelete(requestId);

  // Reset user's verification status
  await User.findByIdAndUpdate(userId, {
    'caddcoreVerification.verificationStatus': 'not_applied',
  });

  return { message: 'Verification request cancelled successfully' };
};

/**
 * Get predefined courses list
 */
const getCoursesList = () => {
  return CADDCORE_COURSES;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SERVICES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all verification requests (Admin)
 */
const getAllVerificationRequests = async (filters: {
  status?: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
}) => {
  const { status, page = 1, limit = 20, searchTerm } = filters;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (status) {
    query.status = status;
  }

  // Get requests with user data
  let requests = await VerificationRequest.find(query)
    .populate({
      path: 'userId',
      select: 'name email profilePhoto',
    })
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Filter by search term if provided
  if (searchTerm) {
    requests = requests.filter((req: any) => {
      const user = req.userId;
      if (!user) return false;
      return (
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  const total = await VerificationRequest.countDocuments(query);

  return {
    data: requests,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single verification request (Admin)
 */
const getSingleVerificationRequest = async (requestId: string) => {
  const request = await VerificationRequest.findById(requestId)
    .populate({
      path: 'userId',
      select: 'name email profilePhoto phone education workExperience skills',
    })
    .populate({
      path: 'processedBy',
      select: 'name email',
    })
    .lean();

  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, 'Verification request not found');
  }

  return request;
};

/**
 * Approve verification request (Admin)
 */
const approveVerification = async (
  requestId: string,
  adminId: string,
  data: IApproveVerificationInput
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await VerificationRequest.findById(requestId).session(session);

    if (!request) {
      throw new AppError(httpStatus.NOT_FOUND, 'Verification request not found');
    }

    if (request.status !== 'pending') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This request has already been processed'
      );
    }

    // Update verification request
    request.status = 'approved';
    request.processedAt = new Date();
    request.processedBy = new mongoose.Types.ObjectId(adminId);
    request.approvedBadgeType = data.badgeType;
    if (data.adminNotes !== undefined) {
      request.adminNotes = data.adminNotes;
    }
    await request.save({ session });

    // Calculate priority score
    const priorityScore = BADGE_PRIORITY_SCORES[data.badgeType] || 0;

    // Update user's verification data
    await User.findByIdAndUpdate(
      request.userId,
      {
        caddcoreVerification: {
          isVerified: true,
          verificationStatus: 'approved',
          badgeType: data.badgeType,
          verifiedAt: new Date(),
          verifiedBy: new mongoose.Types.ObjectId(adminId),
          studentId: request.studentId,
          batchNo: request.batchNo,
          courses: request.coursesClaimed.map((c) => ({
            courseId: c.courseId,
            courseName: c.courseName,
            completedAt: c.completionDate,
          })),
          hasOnJobTraining: request.claimsOnJobTraining,
          hasInternship: request.claimsInternship,
          priorityScore,
        },
      },
      { session }
    );

    await session.commitTransaction();

    return request;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Reject verification request (Admin)
 */
const rejectVerification = async (
  requestId: string,
  adminId: string,
  data: IRejectVerificationInput
) => {
  const request = await VerificationRequest.findById(requestId);

  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, 'Verification request not found');
  }

  if (request.status !== 'pending') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This request has already been processed'
    );
  }

  // Update verification request
  request.status = 'rejected';
  request.processedAt = new Date();
  request.processedBy = new mongoose.Types.ObjectId(adminId);
  request.rejectionReason = data.rejectionReason;
  if (data.adminNotes !== undefined) {
    request.adminNotes = data.adminNotes;
  }
  await request.save();

  // Update user's verification status
  await User.findByIdAndUpdate(request.userId, {
    'caddcoreVerification.verificationStatus': 'rejected',
  });

  return request;
};

/**
 * Get verification stats (Admin Dashboard)
 */
const getVerificationStats = async (): Promise<IVerificationStats> => {
  const [statusStats, badgeStats] = await Promise.all([
    VerificationRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      {
        $match: {
          'caddcoreVerification.isVerified': true,
        },
      },
      {
        $group: {
          _id: '$caddcoreVerification.badgeType',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stats: IVerificationStats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    badgeDistribution: {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    },
  };

  statusStats.forEach((stat) => {
    stats.total += stat.count;
    if (stat._id === 'pending') stats.pending = stat.count;
    if (stat._id === 'approved') stats.approved = stat.count;
    if (stat._id === 'rejected') stats.rejected = stat.count;
  });

  badgeStats.forEach((stat) => {
    if (stat._id && stats.badgeDistribution.hasOwnProperty(stat._id)) {
      stats.badgeDistribution[stat._id as BadgeType] = stat.count;
    }
  });

  return stats;
};

/**
 * Auto-assign Platinum badge when hired through CADDCORE
 */
const upgradeToPlatinum = async (userId: string, adminId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.caddcoreVerification?.isVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User must be verified to upgrade to Platinum'
    );
  }

  // Update to platinum
  await User.findByIdAndUpdate(userId, {
    'caddcoreVerification.badgeType': 'platinum',
    'caddcoreVerification.priorityScore': BADGE_PRIORITY_SCORES.platinum,
    'jobSeekingStatus': 'hired',
  });

  return { message: 'User upgraded to Platinum badge successfully' };
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export const VerificationServices = {
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
