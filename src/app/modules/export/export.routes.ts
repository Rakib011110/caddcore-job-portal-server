import express from 'express';
import auth from '../../middlewares/auth';
import { ExportControllers } from './export.controller';

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPORT ROUTES (Admin / HR only)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * These files contain the whole database in one download - student phone
 * numbers, internal recruiter notes, employer follow-up remarks. There is no
 * public or company-scoped variant here on purpose: a COMPANY user must not be
 * able to export the student database or a rival's follow-up log.
 *
 * Every route is a GET so the browser can download it directly, but the auth
 * middleware still requires a Bearer token - meaning the client must fetch the
 * file and save the blob, not just point a link at the URL.
 *
 *   GET /api/export/catalogue                what reports exist (JSON)
 *   GET /api/export/full-workbook.xlsx       all 9 sheets in one file
 *   GET /api/export/:sheet.xlsx              one report
 *
 * Shared query params: ?from=YYYY-MM-DD&to=YYYY-MM-DD&status=&companyId=
 */

// Catalogue first - it is a JSON endpoint, not a download.
router.get('/catalogue', auth('ADMIN', 'HR'), ExportControllers.getReportCatalogue);

// Full workbook. Registered before /:sheet so it is not read as a report name.
router.get(
  '/full-workbook.xlsx',
  auth('ADMIN', 'HR'),
  ExportControllers.exportFullWorkbook
);
router.get('/full-workbook', auth('ADMIN', 'HR'), ExportControllers.exportFullWorkbook);

// Single report. The `.xlsx` suffix is optional; both forms hit the same
// handler, and the controller rejects any name not in the registry.
router.get('/:sheet.xlsx', auth('ADMIN', 'HR'), ExportControllers.exportSheet);
router.get('/:sheet', auth('ADMIN', 'HR'), ExportControllers.exportSheet);

export const ExportRoutes = router;
