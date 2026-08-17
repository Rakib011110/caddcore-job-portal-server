import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';
import { EmployerFollowupService } from './employerFollowup.service';
import { IFollowupFilters } from './employerFollowup.interface';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const getStaffId = (req: Request): string => {
  const id = (req as any).user?._id || (req as any).user?.id;
  if (!id) throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required');
  return id;
};

/**
 * Read a required route param.
 *
 * `noUncheckedIndexedAccess` types `req.params.x` as possibly undefined, which
 * is honest - a mismatched route would leave it empty - so it is checked once
 * here rather than asserted away at every call site.
 */
const requireParam = (req: Request, name: string): string => {
  const value = req.params[name];
  if (!value) {
    throw new AppError(httpStatus.BAD_REQUEST, `Missing "${name}" in the request URL`);
  }
  return value;
};

/** Pull the supported filters off the query string, ignoring anything else. */
const readFilters = (req: Request): IFollowupFilters => ({
  companyId: req.query.companyId as string | undefined,
  contactMethod: req.query.contactMethod as string | undefined,
  purpose: req.query.purpose as string | undefined,
  outcome: req.query.outcome as string | undefined,
  hiringNeed: req.query.hiringNeed as string | undefined,
  pendingActionsOnly: req.query.pendingActionsOnly === 'true',
  from: req.query.from as string | undefined,
  to: req.query.to as string | undefined,
  search: req.query.search as string | undefined,
  page: req.query.page ? Number(req.query.page) : undefined,
  limit: req.query.limit ? Number(req.query.limit) : undefined,
});

const createFollowup = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerFollowupService.createFollowup(
    req.body,
    getStaffId(req)
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Follow-up recorded successfully',
    data: result,
  });
});

const getAllFollowups = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await EmployerFollowupService.getAllFollowups(
    readFilters(req)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Follow-ups fetched successfully',
    data,
    meta,
  });
});

const getFollowupById = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerFollowupService.getFollowupById(requireParam(req, 'id'));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Follow-up fetched successfully',
    data: result,
  });
});

const getFollowupsByCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerFollowupService.getFollowupsByCompany(
    requireParam(req, 'companyId')
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company follow-up history fetched successfully',
    data: result,
  });
});

const getDueFollowups = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await EmployerFollowupService.getDueFollowups(limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Due follow-up actions fetched successfully',
    data: result,
  });
});

const updateFollowup = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerFollowupService.updateFollowup(
    requireParam(req, 'id'),
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Follow-up updated successfully',
    data: result,
  });
});

const markActionDone = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerFollowupService.markActionDone(requireParam(req, 'id'));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Next action marked as done',
    data: result,
  });
});

const deleteFollowup = catchAsync(async (req: Request, res: Response) => {
  await EmployerFollowupService.deleteFollowup(requireParam(req, 'id'));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Follow-up deleted successfully',
    data: null,
  });
});

const getFollowupStats = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerFollowupService.getFollowupStats(
    req.query.from as string | undefined,
    req.query.to as string | undefined
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Follow-up stats fetched successfully',
    data: result,
  });
});

export const EmployerFollowupControllers = {
  createFollowup,
  getAllFollowups,
  getFollowupById,
  getFollowupsByCompany,
  getDueFollowups,
  updateFollowup,
  markActionDone,
  deleteFollowup,
  getFollowupStats,
};
