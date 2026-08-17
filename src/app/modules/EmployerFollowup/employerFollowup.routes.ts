import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { EmployerFollowupControllers } from './employerFollowup.controller';
import { EmployerFollowupValidation } from './employerFollowup.validation';

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP ROUTES (Admin / HR only)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Every route here is placement-cell internal. Follow-up notes record what an
 * employer said in private - "they thought the last batch was weak" - so none
 * of this is exposed to COMPANY or USER roles, not even read-only.
 */

// ── Reporting ────────────────────────────────────────────────────────────────
// Registered before /:id so "stats" and "due" are not swallowed as ObjectIds.
router.get('/stats', auth('ADMIN', 'HR'), EmployerFollowupControllers.getFollowupStats);
router.get('/due', auth('ADMIN', 'HR'), EmployerFollowupControllers.getDueFollowups);

// ── Per-company history ──────────────────────────────────────────────────────
router.get(
  '/company/:companyId',
  auth('ADMIN', 'HR'),
  EmployerFollowupControllers.getFollowupsByCompany
);

// ── CRUD ─────────────────────────────────────────────────────────────────────
router.post(
  '/',
  auth('ADMIN', 'HR'),
  validateRequest(EmployerFollowupValidation.createFollowupValidationSchema),
  EmployerFollowupControllers.createFollowup
);

router.get('/', auth('ADMIN', 'HR'), EmployerFollowupControllers.getAllFollowups);

router.get('/:id', auth('ADMIN', 'HR'), EmployerFollowupControllers.getFollowupById);

router.patch(
  '/:id',
  auth('ADMIN', 'HR'),
  validateRequest(EmployerFollowupValidation.updateFollowupValidationSchema),
  EmployerFollowupControllers.updateFollowup
);

router.patch(
  '/:id/done',
  auth('ADMIN', 'HR'),
  EmployerFollowupControllers.markActionDone
);

router.delete('/:id', auth('ADMIN'), EmployerFollowupControllers.deleteFollowup);

export const EmployerFollowupRoutes = router;
