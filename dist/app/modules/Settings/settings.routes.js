"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const settings_controller_1 = require("./settings.controller");
const router = express_1.default.Router();
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SETTINGS ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// Public settings only (nested config object)
router.get('/public', settings_controller_1.SettingsControllers.getPublicSettings);
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// All settings grouped with registry metadata (admin settings screen)
router.get('/', auth_1.requireAdmin, settings_controller_1.SettingsControllers.getAllSettings);
// Full config as a nested object
router.get('/config', auth_1.requireAdmin, settings_controller_1.SettingsControllers.getResolvedConfig);
// Bulk update
router.put('/', auth_1.requireAdmin, settings_controller_1.SettingsControllers.updateSettings);
// Single setting read / update / reset
router.get('/:key', auth_1.requireAdmin, settings_controller_1.SettingsControllers.getSetting);
router.patch('/:key', auth_1.requireAdmin, settings_controller_1.SettingsControllers.updateSetting);
router.delete('/:key', auth_1.requireAdmin, settings_controller_1.SettingsControllers.resetSetting);
exports.SettingsRoutes = router;
//# sourceMappingURL=settings.routes.js.map