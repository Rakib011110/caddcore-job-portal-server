"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * HTTP request handlers for Company module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const company_service_1 = require("./company.service");
// ─────────────────────────────────────────────────────────────────────────────
// REGISTER COMPANY (Public)
// ─────────────────────────────────────────────────────────────────────────────
const registerCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await company_service_1.CompanyService.registerCompany(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Company registered successfully. Please wait for admin approval.',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// GET MY COMPANY (For logged-in company user)
// ─────────────────────────────────────────────────────────────────────────────
const getMyCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'User not authenticated',
            data: null,
        });
        return;
    }
    const result = await company_service_1.CompanyService.getMyCompany(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Company retrieved successfully',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// UPDATE MY COMPANY
// ─────────────────────────────────────────────────────────────────────────────
const updateMyCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'User not authenticated',
            data: null,
        });
        return;
    }
    const result = await company_service_1.CompanyService.updateMyCompany(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Company updated successfully',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// GET COMPANY BY ID (Public)
// ─────────────────────────────────────────────────────────────────────────────
const getCompanyById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Company ID is required',
            data: null,
        });
        return;
    }
    const result = await company_service_1.CompanyService.getCompanyById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Company retrieved successfully',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// GET COMPANY BY SLUG (Public)
// ─────────────────────────────────────────────────────────────────────────────
const getCompanyBySlug = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Company slug is required',
            data: null,
        });
        return;
    }
    const result = await company_service_1.CompanyService.getCompanyBySlug(slug);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Company retrieved successfully',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// GET ALL APPROVED COMPANIES (Public)
// ─────────────────────────────────────────────────────────────────────────────
const getAllApprovedCompanies = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await company_service_1.CompanyService.getAllApprovedCompanies(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Companies retrieved successfully',
        meta: result.meta,
        data: result.companies,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET ALL COMPANIES
// ─────────────────────────────────────────────────────────────────────────────
const getAllCompaniesForAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await company_service_1.CompanyService.getAllCompaniesForAdmin(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All companies retrieved successfully',
        meta: result.meta,
        data: result.companies,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET PENDING COMPANIES
// ─────────────────────────────────────────────────────────────────────────────
const getPendingCompanies = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await company_service_1.CompanyService.getPendingCompanies(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Pending companies retrieved successfully',
        meta: result.meta,
        data: result.companies,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: APPROVE/REJECT COMPANY
// ─────────────────────────────────────────────────────────────────────────────
const approveCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user?._id;
    if (!id) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Company ID is required',
            data: null,
        });
        return;
    }
    if (!adminId) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'Admin not authenticated',
            data: null,
        });
        return;
    }
    const result = await company_service_1.CompanyService.approveCompany(id, adminId, req.body);
    const statusMessage = req.body.status === 'APPROVED'
        ? 'Company approved successfully'
        : req.body.status === 'REJECTED'
            ? 'Company rejected'
            : 'Company suspended';
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: statusMessage,
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET COMPANY STATISTICS
// ─────────────────────────────────────────────────────────────────────────────
const getCompanyStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await company_service_1.CompanyService.getCompanyStats();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Company statistics retrieved successfully',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// CHECK IF COMPANY CAN POST JOB
// ─────────────────────────────────────────────────────────────────────────────
const canPostJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'User not authenticated',
            data: null,
        });
        return;
    }
    const result = await company_service_1.CompanyService.canCompanyPostJob(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.canPost ? 'You can post jobs' : result.reason || 'Cannot post jobs',
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
exports.CompanyController = {
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
//# sourceMappingURL=company.controller.js.map