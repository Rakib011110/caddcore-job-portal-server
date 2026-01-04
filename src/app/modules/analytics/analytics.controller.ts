import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AnalyticsServices } from "./analytics.services";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS CONTROLLERS - Admin Dashboard
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const getOverviewStats = catchAsync(async (req, res) => {
  const stats = await AnalyticsServices.getOverviewStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Overview stats fetched successfully",
    data: stats,
  });
});

const getUserStats = catchAsync(async (req, res) => {
  const stats = await AnalyticsServices.getUserStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User stats fetched successfully",
    data: stats,
  });
});

const getJobStats = catchAsync(async (req, res) => {
  const stats = await AnalyticsServices.getJobStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Job stats fetched successfully",
    data: stats,
  });
});

const getApplicationStats = catchAsync(async (req, res) => {
  const stats = await AnalyticsServices.getApplicationStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Application stats fetched successfully",
    data: stats,
  });
});

const getDashboardData = catchAsync(async (req, res) => {
  const data = await AnalyticsServices.getDashboardData();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard data fetched successfully",
    data,
  });
});

const getConversionMetrics = catchAsync(async (req, res) => {
  const metrics = await AnalyticsServices.getConversionMetrics();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Conversion metrics fetched successfully",
    data: metrics,
  });
});

export const AnalyticsControllers = {
  getOverviewStats,
  getUserStats,
  getJobStats,
  getApplicationStats,
  getDashboardData,
  getConversionMetrics
};
