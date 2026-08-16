import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SettingsService } from './settings.service';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SETTINGS CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Public settings as a nested config object.
 * Used by the client to know whether resume approval is switched on.
 */
const getPublicSettings = catchAsync(async (_req, res) => {
  const result = await SettingsService.getResolvedConfig({ publicOnly: true });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Public settings fetched successfully',
    data: result,
  });
});

/** Full registry + values, grouped for the admin settings screen */
const getAllSettings = catchAsync(async (_req, res) => {
  const result = await SettingsService.getAllGrouped();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Settings fetched successfully',
    data: result,
  });
});

/** Full config as a nested object (admin) */
const getResolvedConfig = catchAsync(async (_req, res) => {
  const result = await SettingsService.getResolvedConfig();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Configuration fetched successfully',
    data: result,
  });
});

/** Read one setting */
const getSetting = catchAsync(async (req, res) => {
  const { key } = req.params;
  const result = await SettingsService.get(key as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Setting fetched successfully',
    data: { key, value: result },
  });
});

/** Update one setting */
const updateSetting = catchAsync(async (req, res) => {
  const { key } = req.params;
  const updatedBy = req.user?._id || req.user?.id;

  const result = await SettingsService.set(key as string, req.body?.value, updatedBy);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Setting updated successfully',
    data: result,
  });
});

/** Update many settings at once */
const updateSettings = catchAsync(async (req, res) => {
  const updatedBy = req.user?._id || req.user?.id;
  const payload = req.body?.settings ?? req.body;

  const result = await SettingsService.setMany(payload, updatedBy);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Settings updated successfully',
    data: result,
  });
});

/** Reset one setting back to its registry default */
const resetSetting = catchAsync(async (req, res) => {
  const { key } = req.params;
  const result = await SettingsService.reset(key as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Setting reset to default successfully',
    data: result,
  });
});

export const SettingsControllers = {
  getPublicSettings,
  getAllSettings,
  getResolvedConfig,
  getSetting,
  updateSetting,
  updateSettings,
  resetSetting,
};
