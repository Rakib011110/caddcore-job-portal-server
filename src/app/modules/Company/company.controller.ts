/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * HTTP request handlers for Company module.
 */

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CompanyService } from './company.service';

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER COMPANY (Public)
// ─────────────────────────────────────────────────────────────────────────────

const registerCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.registerCompany(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Company registered successfully. Please wait for admin approval.',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET MY COMPANY (For logged-in company user)
// ─────────────────────────────────────────────────────────────────────────────

const getMyCompany = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
    return;
  }

  const result = await CompanyService.getMyCompany(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company retrieved successfully',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE MY COMPANY
// ─────────────────────────────────────────────────────────────────────────────

const updateMyCompany = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
    return;
  }

  const result = await CompanyService.updateMyCompany(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company updated successfully',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET COMPANY BY ID (Public)
// ─────────────────────────────────────────────────────────────────────────────

const getCompanyById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Company ID is required',
      data: null,
    });
    return;
  }

  const result = await CompanyService.getCompanyById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company retrieved successfully',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET COMPANY BY SLUG (Public)
// ─────────────────────────────────────────────────────────────────────────────

const getCompanyBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Company slug is required',
      data: null,
    });
    return;
  }

  const result = await CompanyService.getCompanyBySlug(slug);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company retrieved successfully',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL APPROVED COMPANIES (Public)
// ─────────────────────────────────────────────────────────────────────────────

const getAllApprovedCompanies = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.getAllApprovedCompanies(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Companies retrieved successfully',
    meta: result.meta,
    data: result.companies,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET ALL COMPANIES
// ─────────────────────────────────────────────────────────────────────────────

const getAllCompaniesForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.getAllCompaniesForAdmin(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All companies retrieved successfully',
    meta: result.meta,
    data: result.companies,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET PENDING COMPANIES
// ─────────────────────────────────────────────────────────────────────────────

const getPendingCompanies = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.getPendingCompanies(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pending companies retrieved successfully',
    meta: result.meta,
    data: result.companies,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: APPROVE/REJECT COMPANY
// ─────────────────────────────────────────────────────────────────────────────

const approveCompany = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?._id;

  if (!id) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Company ID is required',
      data: null,
    });
    return;
  }

  if (!adminId) {
    sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'Admin not authenticated',
      data: null,
    });
    return;
  }

  const result = await CompanyService.approveCompany(id, adminId, req.body);

  const statusMessage = req.body.status === 'APPROVED' 
    ? 'Company approved successfully' 
    : req.body.status === 'REJECTED'
    ? 'Company rejected'
    : 'Company suspended';

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: statusMessage,
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET COMPANY STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

const getCompanyStats = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.getCompanyStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company statistics retrieved successfully',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CHECK IF COMPANY CAN POST JOB
// ─────────────────────────────────────────────────────────────────────────────

const canPostJob = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
    return;
  }

  const result = await CompanyService.canCompanyPostJob(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.canPost ? 'You can post jobs' : result.reason || 'Cannot post jobs',
    data: result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

export const CompanyController = {
  registerCompany,
  getMyCompany,
  updateMyCompany,
  getCompanyById,
  getCompanyBySlug,
  getAllApprovedCompanies,
  getAllCompaniesForAdmin,
  getPendingCompanies,
  approveCompany,
  getCompanyStats,
  canPostJob,
};
