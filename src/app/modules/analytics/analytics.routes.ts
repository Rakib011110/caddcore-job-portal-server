import express from "express";
import { AnalyticsControllers } from "./analytics.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS ROUTES - Admin Dashboard (Protected)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Get all dashboard data at once
router.get("/dashboard", auth("ADMIN", "HR"), AnalyticsControllers.getDashboardData);

// Individual stat endpoints
router.get("/overview", auth("ADMIN", "HR"), AnalyticsControllers.getOverviewStats);
router.get("/users", auth("ADMIN", "HR"), AnalyticsControllers.getUserStats);
router.get("/jobs", auth("ADMIN", "HR"), AnalyticsControllers.getJobStats);
router.get("/applications", auth("ADMIN", "HR"), AnalyticsControllers.getApplicationStats);
router.get("/conversions", auth("ADMIN", "HR"), AnalyticsControllers.getConversionMetrics);

export const AnalyticsRoutes = router;
