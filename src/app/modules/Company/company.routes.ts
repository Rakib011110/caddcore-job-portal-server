/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Express routes for Company module with proper authentication.
 */

import express from 'express';
import { CompanyController } from './company.controller';
import auth from '../../middlewares/auth';
import { requireVerifiedViewer } from '../../middlewares/requireVerifiedViewer';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/company/register
 * @desc    Register a new company (creates user + company)
 * @access  Public
 */
router.post(
  '/register',
  CompanyController.registerCompany
);

/**
 * @route   GET /api/v1/company/teaser
 * @desc    Logo/name/count only, for the homepage shop window
 * @access  Public
 *
 * Declared before `/public` so it can never be read as a slug.
 */
router.get(
  '/teaser',
  CompanyController.getPublicCompanyTeasers
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY DIRECTORY — MEMBERS ONLY
// ═══════════════════════════════════════════════════════════════════════════════
//
// Still called "public" because clients depend on the URLs, but these are not
// public: the full record populates the owner's email address, so an open
// endpoint handed anyone a scrapeable list of every employer's contact details.
// Readers must be a verified job seeker, an approved company, or staff — the
// same rule the listing page applies in the browser.
//
// Anonymous marketing surfaces use `/teaser` above instead.

/**
 * @route   GET /api/v1/company/public
 * @desc    Get all approved companies (directory listing)
 * @access  Verified members, approved companies, staff
 */
router.get(
  '/public',
  auth(),
  requireVerifiedViewer,
  CompanyController.getAllApprovedCompanies
);

/**
 * @route   GET /api/v1/company/public/:slug
 * @desc    Get company by slug (company profile page)
 * @access  Verified members, approved companies, staff
 */
router.get(
  '/public/:slug',
  auth(),
  requireVerifiedViewer,
  CompanyController.getCompanyBySlug
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY AUTHENTICATED ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/company/me
 * @desc    Get my company details
 * @access  COMPANY
 */
router.get(
  '/me',
  auth('COMPANY' as any),
  CompanyController.getMyCompany
);

/**
 * @route   PATCH /api/v1/company/me
 * @desc    Update my company details
 * @access  COMPANY
 */
router.patch(
  '/me',
  auth('COMPANY' as any),
  CompanyController.updateMyCompany
);

/**
 * @route   GET /api/v1/company/can-post-job
 * @desc    Check if company can post a new job
 * @access  COMPANY
 */
router.get(
  '/can-post-job',
  auth('COMPANY' as any),
  CompanyController.canPostJob
);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/company/admin/all
 * @desc    Get all companies (including pending, rejected, suspended)
 * @access  ADMIN
 */
router.get(
  '/admin/all',
  auth('ADMIN'),
  CompanyController.getAllCompaniesForAdmin
);

/**
 * @route   GET /api/v1/company/admin/pending
 * @desc    Get all pending companies (for approval queue)
 * @access  ADMIN
 */
router.get(
  '/admin/pending',
  auth('ADMIN'),
  CompanyController.getPendingCompanies
);

/**
 * @route   GET /api/v1/company/admin/stats
 * @desc    Get company statistics for admin dashboard
 * @access  ADMIN
 */
router.get(
  '/admin/stats',
  auth('ADMIN'),
  CompanyController.getCompanyStats
);

/**
 * @route   GET /api/v1/company/admin/:id
 * @desc    Get company by ID (for admin review)
 * @access  ADMIN
 */
router.get(
  '/admin/:id',
  auth('ADMIN'),
  CompanyController.getCompanyById
);

/**
 * @route   PATCH /api/v1/company/admin/:id/status
 * @desc    Approve, reject, or suspend a company
 * @access  ADMIN
 */
router.patch(
  '/admin/:id/status',
  auth('ADMIN'),
  CompanyController.approveCompany
);

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

export const CompanyRoutes = router;
