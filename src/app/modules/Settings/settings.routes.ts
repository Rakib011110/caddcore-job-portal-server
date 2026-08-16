import express from 'express';
import { requireAdmin } from '../../middlewares/auth';
import { SettingsControllers } from './settings.controller';

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SETTINGS ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Public settings only (nested config object)
router.get('/public', SettingsControllers.getPublicSettings);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// All settings grouped with registry metadata (admin settings screen)
router.get('/', requireAdmin, SettingsControllers.getAllSettings);

// Full config as a nested object
router.get('/config', requireAdmin, SettingsControllers.getResolvedConfig);

// Bulk update
router.put('/', requireAdmin, SettingsControllers.updateSettings);

// Single setting read / update / reset
router.get('/:key', requireAdmin, SettingsControllers.getSetting);
router.patch('/:key', requireAdmin, SettingsControllers.updateSetting);
router.delete('/:key', requireAdmin, SettingsControllers.resetSetting);

export const SettingsRoutes = router;
