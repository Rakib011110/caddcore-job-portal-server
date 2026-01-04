"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Express routes for Company module with proper authentication.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const company_controller_1 = require("./company.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @route   POST /api/v1/company/register
 * @desc    Register a new company (creates user + company)
 * @access  Public
 */
router.post('/register', company_controller_1.CompanyController.registerCompany);
/**
 * @route   GET /api/v1/company/public
 * @desc    Get all approved companies (for public listing)
 * @access  Public
 */
router.get('/public', company_controller_1.CompanyController.getAllApprovedCompanies);
/**
 * @route   GET /api/v1/company/public/:slug
 * @desc    Get company by slug (for public profile page)
 * @access  Public
 */
router.get('/public/:slug', company_controller_1.CompanyController.getCompanyBySlug);
// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY AUTHENTICATED ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @route   GET /api/v1/company/me
 * @desc    Get my company details
 * @access  COMPANY
 */
router.get('/me', (0, auth_1.default)('COMPANY'), company_controller_1.CompanyController.getMyCompany);
/**
 * @route   PATCH /api/v1/company/me
 * @desc    Update my company details
 * @access  COMPANY
 */
router.patch('/me', (0, auth_1.default)('COMPANY'), company_controller_1.CompanyController.updateMyCompany);
/**
 * @route   GET /api/v1/company/can-post-job
 * @desc    Check if company can post a new job
 * @access  COMPANY
 */
router.get('/can-post-job', (0, auth_1.default)('COMPANY'), company_controller_1.CompanyController.canPostJob);
// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @route   GET /api/v1/company/admin/all
 * @desc    Get all companies (including pending, rejected, suspended)
 * @access  ADMIN
 */
router.get('/admin/all', (0, auth_1.default)('ADMIN'), company_controller_1.CompanyController.getAllCompaniesForAdmin);
/**
 * @route   GET /api/v1/company/admin/pending
 * @desc    Get all pending companies (for approval queue)
 * @access  ADMIN
 */
router.get('/admin/pending', (0, auth_1.default)('ADMIN'), company_controller_1.CompanyController.getPendingCompanies);
/**
 * @route   GET /api/v1/company/admin/stats
 * @desc    Get company statistics for admin dashboard
 * @access  ADMIN
 */
router.get('/admin/stats', (0, auth_1.default)('ADMIN'), company_controller_1.CompanyController.getCompanyStats);
/**
 * @route   GET /api/v1/company/admin/:id
 * @desc    Get company by ID (for admin review)
 * @access  ADMIN
 */
router.get('/admin/:id', (0, auth_1.default)('ADMIN'), company_controller_1.CompanyController.getCompanyById);
/**
 * @route   PATCH /api/v1/company/admin/:id/status
 * @desc    Approve, reject, or suspend a company
 * @access  ADMIN
 */
router.patch('/admin/:id/status', (0, auth_1.default)('ADMIN'), company_controller_1.CompanyController.approveCompany);
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ROUTER
// ═══════════════════════════════════════════════════════════════════════════════
exports.CompanyRoutes = router;
//# sourceMappingURL=company.routes.js.map