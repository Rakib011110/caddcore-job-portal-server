"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerFollowupControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const employerFollowup_service_1 = require("./employerFollowup.service");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const getStaffId = (req) => {
    const id = req.user?._id || req.user?.id;
    if (!id)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Authentication required');
    return id;
};
/**
 * Read a required route param.
 *
 * `noUncheckedIndexedAccess` types `req.params.x` as possibly undefined, which
 * is honest - a mismatched route would leave it empty - so it is checked once
 * here rather than asserted away at every call site.
 */
const requireParam = (req, name) => {
    const value = req.params[name];
    if (!value) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Missing "${name}" in the request URL`);
    }
    return value;
};
/** Pull the supported filters off the query string, ignoring anything else. */
const readFilters = (req) => ({
    companyId: req.query.companyId,
    contactMethod: req.query.contactMethod,
    purpose: req.query.purpose,
    outcome: req.query.outcome,
    hiringNeed: req.query.hiringNeed,
    pendingActionsOnly: req.query.pendingActionsOnly === 'true',
    from: req.query.from,
    to: req.query.to,
    search: req.query.search,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
});
const createFollowup = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await employerFollowup_service_1.EmployerFollowupService.createFollowup(req.body, getStaffId(req));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Follow-up recorded successfully',
        data: result,
    });
});
const getAllFollowups = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { data, meta } = await employerFollowup_service_1.EmployerFollowupService.getAllFollowups(readFilters(req));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Follow-ups fetched successfully',
        data,
        meta,
    });
});
const getFollowupById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await employerFollowup_service_1.EmployerFollowupService.getFollowupById(requireParam(req, 'id'));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Follow-up fetched successfully',
        data: result,
    });
});
const getFollowupsByCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await employerFollowup_service_1.EmployerFollowupService.getFollowupsByCompany(requireParam(req, 'companyId'));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Company follow-up history fetched successfully',
        data: result,
    });
});
const getDueFollowups = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await employerFollowup_service_1.EmployerFollowupService.getDueFollowups(limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Due follow-up actions fetched successfully',
        data: result,
    });
});
const updateFollowup = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await employerFollowup_service_1.EmployerFollowupService.updateFollowup(requireParam(req, 'id'), req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Follow-up updated successfully',
        data: result,
    });
});
const markActionDone = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await employerFollowup_service_1.EmployerFollowupService.markActionDone(requireParam(req, 'id'));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Next action marked as done',
        data: result,
    });
});
const deleteFollowup = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await employerFollowup_service_1.EmployerFollowupService.deleteFollowup(requireParam(req, 'id'));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Follow-up deleted successfully',
        data: null,
    });
});
const getFollowupStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await employerFollowup_service_1.EmployerFollowupService.getFollowupStats(req.query.from, req.query.to);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Follow-up stats fetched successfully',
        data: result,
    });
});
exports.EmployerFollowupControllers = {
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
//# sourceMappingURL=employerFollowup.controller.js.map