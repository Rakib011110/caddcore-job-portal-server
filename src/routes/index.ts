import { Router } from "express";
import { UserRoutes } from "../app/modules/User/user.routes";
import { AuthRoutes } from "../app/modules/auth/auth.routes";
import { JobsRoutes } from "../app/modules/jobs/job.routes";
import { ApplicationRoutes } from "../app/modules/jobs/Jobaplications/jobaplication.routes";
import { SMSRoutes } from "../app/modules/sms/sms.routes";
import { AnalyticsRoutes } from "../app/modules/analytics/analytics.routes";
import { BannerRoutes } from "../app/modules/Banner/banner.routes";
import { CompanyRoutes } from "../app/modules/Company/company.routes";
import { VerificationRoutes } from "../app/modules/Verification/verification.routes";
import { CategoryRoutes } from "../app/modules/category/category.routes";
import { ChatRoutes } from "../app/modules/Chat/chat.routes";
import { NotificationRoutes } from "../app/modules/Notification/notification.routes";

const routes = Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const moduleRoutes = [
  // Authentication
  {
    path: "/auth",
    route: AuthRoutes
  },
  
  // Users & Profile
  {
    path: "/users",
    route: UserRoutes,
  },
  
  // Companies (Registration & Management)
  {
    path: "/company",
    route: CompanyRoutes
  },
  
  // Jobs
  {
    path: "/jobs",
    route: JobsRoutes
  },
  
  // Job Applications
  {
    path: "/job-applications",
    route: ApplicationRoutes
  },
  
  // Analytics (Admin Dashboard)
  {
    path: "/analytics",
    route: AnalyticsRoutes
  },
  
  // SMS
  {
    path: "/sms",
    route: SMSRoutes
  },
  
  // Banners
  {
    path: "/banner",
    route: BannerRoutes
  },
  
  // CADDCORE Verification
  {
    path: "/verification",
    route: VerificationRoutes
  },
  
  // Job Categories
  {
    path: "/categories",
    route: CategoryRoutes
  },
  
  // Chat / Messages
  {
    path: "/chat",
    route: ChatRoutes
  },
  
  // Notifications
  {
    path: "/notifications",
    route: NotificationRoutes
  }
];

moduleRoutes.forEach((route) => routes.use(route.path, route.route));

export default routes;

