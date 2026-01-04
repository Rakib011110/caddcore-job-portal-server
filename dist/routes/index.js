"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = require("../app/modules/User/user.routes");
const auth_routes_1 = require("../app/modules/auth/auth.routes");
const job_routes_1 = require("../app/modules/jobs/job.routes");
const jobaplication_routes_1 = require("../app/modules/jobs/Jobaplications/jobaplication.routes");
const sms_routes_1 = require("../app/modules/sms/sms.routes");
const analytics_routes_1 = require("../app/modules/analytics/analytics.routes");
const banner_routes_1 = require("../app/modules/Banner/banner.routes");
const company_routes_1 = require("../app/modules/Company/company.routes");
const verification_routes_1 = require("../app/modules/Verification/verification.routes");
const category_routes_1 = require("../app/modules/category/category.routes");
const chat_routes_1 = require("../app/modules/Chat/chat.routes");
const notification_routes_1 = require("../app/modules/Notification/notification.routes");
const routes = (0, express_1.Router)();
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const moduleRoutes = [
    // Authentication
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes
    },
    // Users & Profile
    {
        path: "/users",
        route: user_routes_1.UserRoutes,
    },
    // Companies (Registration & Management)
    {
        path: "/company",
        route: company_routes_1.CompanyRoutes
    },
    // Jobs
    {
        path: "/jobs",
        route: job_routes_1.JobsRoutes
    },
    // Job Applications
    {
        path: "/job-applications",
        route: jobaplication_routes_1.ApplicationRoutes
    },
    // Analytics (Admin Dashboard)
    {
        path: "/analytics",
        route: analytics_routes_1.AnalyticsRoutes
    },
    // SMS
    {
        path: "/sms",
        route: sms_routes_1.SMSRoutes
    },
    // Banners
    {
        path: "/banner",
        route: banner_routes_1.BannerRoutes
    },
    // CADDCORE Verification
    {
        path: "/verification",
        route: verification_routes_1.VerificationRoutes
    },
    // Job Categories
    {
        path: "/categories",
        route: category_routes_1.CategoryRoutes
    },
    // Chat / Messages
    {
        path: "/chat",
        route: chat_routes_1.ChatRoutes
    },
    // Notifications
    {
        path: "/notifications",
        route: notification_routes_1.NotificationRoutes
    }
];
moduleRoutes.forEach((route) => routes.use(route.path, route.route));
exports.default = routes;
//# sourceMappingURL=index.js.map