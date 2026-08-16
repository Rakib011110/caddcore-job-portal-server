"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const settings_service_1 = require("./settings.service");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SETTINGS CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
/**
 * Public settings as a nested config object.
 * Used by the client to know whether resume approval is switched on.
 */
const getPublicSettings = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const result = await settings_service_1.SettingsService.getResolvedConfig({ publicOnly: true });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Public settings fetched successfully',
        data: result,
    });
});
/** Full registry + values, grouped for the admin settings screen */
const getAllSettings = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const result = await settings_service_1.SettingsService.getAllGrouped();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Settings fetched successfully',
        data: result,
    });
});
/** Full config as a nested object (admin) */
const getResolvedConfig = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const result = await settings_service_1.SettingsService.getResolvedConfig();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Configuration fetched successfully',
        data: result,
    });
});
/** Read one setting */
const getSetting = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { key } = req.params;
    const result = await settings_service_1.SettingsService.get(key);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Setting fetched successfully',
        data: { key, value: result },
    });
});
/** Update one setting */
const updateSetting = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { key } = req.params;
    const updatedBy = req.user?._id || req.user?.id;
    const result = await settings_service_1.SettingsService.set(key, req.body?.value, updatedBy);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Setting updated successfully',
        data: result,
    });
});
/** Update many settings at once */
const updateSettings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const updatedBy = req.user?._id || req.user?.id;
    const payload = req.body?.settings ?? req.body;
    const result = await settings_service_1.SettingsService.setMany(payload, updatedBy);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Settings updated successfully',
        data: result,
    });
});
/** Reset one setting back to its registry default */
const resetSetting = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { key } = req.params;
    const result = await settings_service_1.SettingsService.reset(key);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Setting reset to default successfully',
        data: result,
    });
});
exports.SettingsControllers = {
    getPublicSettings,
    getAllSettings,
    getResolvedConfig,
    getSetting,
    updateSetting,
    updateSettings,
    resetSetting,
};
//# sourceMappingURL=settings.controller.js.map