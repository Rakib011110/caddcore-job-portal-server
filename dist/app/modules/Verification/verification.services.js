"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationServices = void 0;
const user_model_1 = require("../User/user.model");
const verification_model_1 = require("./verification.model");
const verification_constant_1 = require("./verification.constant");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
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
const applyForVerification = async (userId, data) => {
    // Check if user exists
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Check if user already has a pending or approved verification
    const existingRequest = await verification_model_1.VerificationRequest.findOne({
        userId,
        status: { $in: ['pending', 'approved'] },
    });
    if (existingRequest) {
        if (existingRequest.status === 'pending') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You already have a pending verification request');
        }
        if (existingRequest.status === 'approved') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are already verified');
        }
    }
    // Create verification request
    const verificationRequest = await verification_model_1.VerificationRequest.create({
        userId,
        ...data,
        appliedAt: new Date(),
    });
    // Update user's verification status to pending
    await user_model_1.User.findByIdAndUpdate(userId, {
        'caddcoreVerification.verificationStatus': 'pending',
    });
    return verificationRequest;
};
/**
 * Get my verification status
 */
const getMyVerificationStatus = async (userId) => {
    const user = await user_model_1.User.findById(userId).select('caddcoreVerification');
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const latestRequest = await verification_model_1.VerificationRequest.findOne({ userId })
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
const updateVerificationRequest = async (requestId, userId, data) => {
    const request = await verification_model_1.VerificationRequest.findOne({
        _id: requestId,
        userId,
        status: 'pending',
    });
    if (!request) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Verification request not found or cannot be updated');
    }
    Object.assign(request, data);
    await request.save();
    return request;
};
/**
 * Cancel pending verification request
 */
const cancelVerificationRequest = async (requestId, userId) => {
    const request = await verification_model_1.VerificationRequest.findOne({
        _id: requestId,
        userId,
        status: 'pending',
    });
    if (!request) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Verification request not found or cannot be cancelled');
    }
    await verification_model_1.VerificationRequest.findByIdAndDelete(requestId);
    // Reset user's verification status
    await user_model_1.User.findByIdAndUpdate(userId, {
        'caddcoreVerification.verificationStatus': 'not_applied',
    });
    return { message: 'Verification request cancelled successfully' };
};
/**
 * Get predefined courses list
 */
const getCoursesList = () => {
    return verification_constant_1.CADDCORE_COURSES;
};
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SERVICES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get all verification requests (Admin)
 */
const getAllVerificationRequests = async (filters) => {
    const { status, page = 1, limit = 20, searchTerm } = filters;
    const skip = (page - 1) * limit;
    const query = {};
    if (status) {
        query.status = status;
    }
    // Get requests with user data
    let requests = await verification_model_1.VerificationRequest.find(query)
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
        requests = requests.filter((req) => {
            const user = req.userId;
            if (!user)
                return false;
            return (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.studentId?.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }
    const total = await verification_model_1.VerificationRequest.countDocuments(query);
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
const getSingleVerificationRequest = async (requestId) => {
    const request = await verification_model_1.VerificationRequest.findById(requestId)
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
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Verification request not found');
    }
    return request;
};
/**
 * Approve verification request (Admin)
 */
const approveVerification = async (requestId, adminId, data) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const request = await verification_model_1.VerificationRequest.findById(requestId).session(session);
        if (!request) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Verification request not found');
        }
        if (request.status !== 'pending') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This request has already been processed');
        }
        // Update verification request
        request.status = 'approved';
        request.processedAt = new Date();
        request.processedBy = new mongoose_1.default.Types.ObjectId(adminId);
        request.approvedBadgeType = data.badgeType;
        if (data.adminNotes !== undefined) {
            request.adminNotes = data.adminNotes;
        }
        await request.save({ session });
        // Calculate priority score
        const priorityScore = verification_constant_1.BADGE_PRIORITY_SCORES[data.badgeType] || 0;
        // Update user's verification data
        await user_model_1.User.findByIdAndUpdate(request.userId, {
            caddcoreVerification: {
                isVerified: true,
                verificationStatus: 'approved',
                badgeType: data.badgeType,
                verifiedAt: new Date(),
                verifiedBy: new mongoose_1.default.Types.ObjectId(adminId),
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
        }, { session });
        await session.commitTransaction();
        return request;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
/**
 * Reject verification request (Admin)
 */
const rejectVerification = async (requestId, adminId, data) => {
    const request = await verification_model_1.VerificationRequest.findById(requestId);
    if (!request) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Verification request not found');
    }
    if (request.status !== 'pending') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This request has already been processed');
    }
    // Update verification request
    request.status = 'rejected';
    request.processedAt = new Date();
    request.processedBy = new mongoose_1.default.Types.ObjectId(adminId);
    request.rejectionReason = data.rejectionReason;
    if (data.adminNotes !== undefined) {
        request.adminNotes = data.adminNotes;
    }
    await request.save();
    // Update user's verification status
    await user_model_1.User.findByIdAndUpdate(request.userId, {
        'caddcoreVerification.verificationStatus': 'rejected',
    });
    return request;
};
/**
 * Get verification stats (Admin Dashboard)
 */
const getVerificationStats = async () => {
    const [statusStats, badgeStats] = await Promise.all([
        verification_model_1.VerificationRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]),
        user_model_1.User.aggregate([
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
    const stats = {
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
        if (stat._id === 'pending')
            stats.pending = stat.count;
        if (stat._id === 'approved')
            stats.approved = stat.count;
        if (stat._id === 'rejected')
            stats.rejected = stat.count;
    });
    badgeStats.forEach((stat) => {
        if (stat._id && stats.badgeDistribution.hasOwnProperty(stat._id)) {
            stats.badgeDistribution[stat._id] = stat.count;
        }
    });
    return stats;
};
/**
 * Auto-assign Platinum badge when hired through CADDCORE
 */
const upgradeToPlatinum = async (userId, adminId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!user.caddcoreVerification?.isVerified) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User must be verified to upgrade to Platinum');
    }
    // Update to platinum
    await user_model_1.User.findByIdAndUpdate(userId, {
        'caddcoreVerification.badgeType': 'platinum',
        'caddcoreVerification.priorityScore': verification_constant_1.BADGE_PRIORITY_SCORES.platinum,
        'jobSeekingStatus': 'hired',
    });
    return { message: 'User upgraded to Platinum badge successfully' };
};
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SERVICES
// ─────────────────────────────────────────────────────────────────────────────
exports.VerificationServices = {
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
//# sourceMappingURL=verification.services.js.map