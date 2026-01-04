"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const analytics_services_1 = require("./analytics.services");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS CONTROLLERS - Admin Dashboard
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const getOverviewStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await analytics_services_1.AnalyticsServices.getOverviewStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Overview stats fetched successfully",
        data: stats,
    });
});
const getUserStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await analytics_services_1.AnalyticsServices.getUserStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User stats fetched successfully",
        data: stats,
    });
});
const getJobStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await analytics_services_1.AnalyticsServices.getJobStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job stats fetched successfully",
        data: stats,
    });
});
const getApplicationStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await analytics_services_1.AnalyticsServices.getApplicationStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Application stats fetched successfully",
        data: stats,
    });
});
const getDashboardData = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await analytics_services_1.AnalyticsServices.getDashboardData();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Dashboard data fetched successfully",
        data,
    });
});
const getConversionMetrics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const metrics = await analytics_services_1.AnalyticsServices.getConversionMetrics();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Conversion metrics fetched successfully",
        data: metrics,
    });
});
exports.AnalyticsControllers = {
    getOverviewStats,
    getUserStats,
    getJobStats,
    getApplicationStats,
    getDashboardData,
    getConversionMetrics
};
//# sourceMappingURL=analytics.controller.js.map