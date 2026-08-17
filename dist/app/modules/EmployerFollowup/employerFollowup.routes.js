"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerFollowupRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const employerFollowup_controller_1 = require("./employerFollowup.controller");
const employerFollowup_validation_1 = require("./employerFollowup.validation");
const router = express_1.default.Router();
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
router.get('/stats', (0, auth_1.default)('ADMIN', 'HR'), employerFollowup_controller_1.EmployerFollowupControllers.getFollowupStats);
router.get('/due', (0, auth_1.default)('ADMIN', 'HR'), employerFollowup_controller_1.EmployerFollowupControllers.getDueFollowups);
// ── Per-company history ──────────────────────────────────────────────────────
router.get('/company/:companyId', (0, auth_1.default)('ADMIN', 'HR'), employerFollowup_controller_1.EmployerFollowupControllers.getFollowupsByCompany);
// ── CRUD ─────────────────────────────────────────────────────────────────────
router.post('/', (0, auth_1.default)('ADMIN', 'HR'), (0, validateRequest_1.default)(employerFollowup_validation_1.EmployerFollowupValidation.createFollowupValidationSchema), employerFollowup_controller_1.EmployerFollowupControllers.createFollowup);
router.get('/', (0, auth_1.default)('ADMIN', 'HR'), employerFollowup_controller_1.EmployerFollowupControllers.getAllFollowups);
router.get('/:id', (0, auth_1.default)('ADMIN', 'HR'), employerFollowup_controller_1.EmployerFollowupControllers.getFollowupById);
router.patch('/:id', (0, auth_1.default)('ADMIN', 'HR'), (0, validateRequest_1.default)(employerFollowup_validation_1.EmployerFollowupValidation.updateFollowupValidationSchema), employerFollowup_controller_1.EmployerFollowupControllers.updateFollowup);
router.patch('/:id/done', (0, auth_1.default)('ADMIN', 'HR'), employerFollowup_controller_1.EmployerFollowupControllers.markActionDone);
router.delete('/:id', (0, auth_1.default)('ADMIN'), employerFollowup_controller_1.EmployerFollowupControllers.deleteFollowup);
exports.EmployerFollowupRoutes = router;
//# sourceMappingURL=employerFollowup.routes.js.map