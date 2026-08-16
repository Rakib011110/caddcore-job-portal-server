import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';
import { ResumeService } from './resume.service';
import { IResumeFilters } from './resume.interface';
import { TResumeStatus } from './resume.constant';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const getUserId = (req: { user?: { _id?: string; id?: string } }): string => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  return userId;
};

// ─────────────────────────────────────────────────────────────────────────────
// USER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/** Create a resume (optionally pre-filled from the user's profile CV) */
const createResume = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.createResume(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Resume created successfully',
    data: result,
  });
});

/** List my resumes */
const getMyResumes = catchAsync(async (req, res) => {
  const userId = getUserId(req);

  const filters: IResumeFilters = {};
  if (req.query.status) {
    filters.status = req.query.status as TResumeStatus | 'all';
  }

  const result = await ResumeService.getMyResumes(userId, filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resumes fetched successfully',
    data: result,
  });
});

/** Get one of my resumes */
const getMyResumeById = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.getMyResumeById(
    userId,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume fetched successfully',
    data: result,
  });
});

/** My working CV — created from my profile on first access */
const getPrimaryResume = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.ensurePrimaryResume(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume fetched successfully',
    data: result,
  });
});

/** Re-pull resume content from my profile CV */
const syncFromProfile = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.syncFromProfile(
    userId,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume updated from your profile',
    data: result,
  });
});

/** Update a resume */
const updateResume = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.updateResume(
    userId,
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume updated successfully',
    data: result,
  });
});

/** Delete a resume (soft delete) */
const deleteResume = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.deleteResume(
    userId,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

/** Mark a resume as the default one */
const setDefaultResume = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.setDefaultResume(
    userId,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Default resume updated successfully',
    data: result,
  });
});

/** Submit a resume for review */
const submitForReview = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.submitForReview(
    userId,
    req.params.id as string,
    req.body || {}
  );

  const autoApproved = result.status === 'approved';

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: autoApproved
      ? 'Resume approved successfully'
      : 'Resume submitted for review. It is now pending approval.',
    data: result,
  });
});

/** Withdraw a resume from the review queue */
const withdrawSubmission = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.withdrawSubmission(
    userId,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume withdrawn from review',
    data: result,
  });
});

/** Can I apply for jobs yet? */
const getMyEligibility = catchAsync(async (req, res) => {
  const userId = getUserId(req);
  const result = await ResumeService.getEligibility(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Eligibility fetched successfully',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The approved CV behind a public candidate profile.
 *
 * `data: null` is a normal answer, not an error: the candidate is visible, they
 * just have no approved CV yet. The profile page shows their self-entered
 * details in that case and says so.
 */
const getPublicCandidateResume = catchAsync(async (req, res) => {
  const result = await ResumeService.getPublicCandidateResume(
    req.params.userId as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result
      ? 'Approved CV fetched successfully'
      : 'This candidate has no approved CV yet',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / REVIEWER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/** Review queue */
const getAllResumes = catchAsync(async (req, res) => {
  const filters: IResumeFilters = {
    ...(req.query.status ? { status: req.query.status as TResumeStatus } : {}),
    ...(req.query.userId ? { userId: req.query.userId as string } : {}),
    ...(req.query.searchTerm
      ? { searchTerm: req.query.searchTerm as string }
      : {}),
    ...(req.query.page ? { page: Number(req.query.page) } : {}),
    ...(req.query.limit ? { limit: Number(req.query.limit) } : {}),
    ...(req.query.sortBy ? { sortBy: req.query.sortBy as string } : {}),
    ...(req.query.sortOrder
      ? { sortOrder: req.query.sortOrder as 'asc' | 'desc' }
      : {}),
  };

  const { data, meta } = await ResumeService.getAllResumes(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resumes fetched successfully',
    data,
    meta,
  });
});

/** Full resume for the reviewer */
const getResumeById = catchAsync(async (req, res) => {
  const result = await ResumeService.getResumeById(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume fetched successfully',
    data: result,
  });
});

/** Approve */
const approveResume = catchAsync(async (req, res) => {
  const reviewerId = getUserId(req);
  const reviewerRole = req.user?.role || 'ADMIN';

  const result = await ResumeService.approveResume(
    req.params.id as string,
    reviewerId,
    reviewerRole,
    req.body || {}
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume approved successfully',
    data: result,
  });
});

/** Reject (feedback optional) */
const rejectResume = catchAsync(async (req, res) => {
  const reviewerId = getUserId(req);
  const reviewerRole = req.user?.role || 'ADMIN';

  const result = await ResumeService.rejectResume(
    req.params.id as string,
    reviewerId,
    reviewerRole,
    req.body || {}
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume rejected',
    data: result,
  });
});

/** Review queue counters */
const getResumeStats = catchAsync(async (_req, res) => {
  const result = await ResumeService.getResumeStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Resume stats fetched successfully',
    data: result,
  });
});

export const ResumeControllers = {
  // User
  createResume,
  getMyResumes,
  getMyResumeById,
  getPrimaryResume,
  syncFromProfile,
  updateResume,
  deleteResume,
  setDefaultResume,
  submitForReview,
  withdrawSubmission,
  getMyEligibility,

  // Public
  getPublicCandidateResume,

  // Admin
  getAllResumes,
  getResumeById,
  approveResume,
  rejectResume,
  getResumeStats,
};
