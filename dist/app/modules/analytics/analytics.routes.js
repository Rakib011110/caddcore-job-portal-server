"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("./analytics.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS ROUTES - Admin Dashboard (Protected)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// Get all dashboard data at once
router.get("/dashboard", (0, auth_1.default)("ADMIN", "HR"), analytics_controller_1.AnalyticsControllers.getDashboardData);
// Individual stat endpoints
router.get("/overview", (0, auth_1.default)("ADMIN", "HR"), analytics_controller_1.AnalyticsControllers.getOverviewStats);
router.get("/users", (0, auth_1.default)("ADMIN", "HR"), analytics_controller_1.AnalyticsControllers.getUserStats);
router.get("/jobs", (0, auth_1.default)("ADMIN", "HR"), analytics_controller_1.AnalyticsControllers.getJobStats);
router.get("/applications", (0, auth_1.default)("ADMIN", "HR"), analytics_controller_1.AnalyticsControllers.getApplicationStats);
router.get("/conversions", (0, auth_1.default)("ADMIN", "HR"), analytics_controller_1.AnalyticsControllers.getConversionMetrics);
exports.AnalyticsRoutes = router;
//# sourceMappingURL=analytics.routes.js.map