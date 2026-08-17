"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronRoutes = void 0;
const express_1 = __importDefault(require("express"));
const cron_controller_1 = require("./cron.controller");
const optionalAuth_1 = require("../../middlewares/optionalAuth");
const router = express_1.default.Router();
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CRON & CHECK-IN ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   POST /api/cron/run-daily      the scheduled run
 *   GET  /api/cron/check-in       what the candidate's link shows
 *   POST /api/cron/check-in       their answer
 *
 * SCHEDULING
 * ─────────────────────────────────────────────────────────────────────────────
 * The app is deployed to Vercel, where the process does not stay alive between
 * requests - an in-process timer would simply never fire. So the schedule lives
 * outside and calls in:
 *
 *   curl -X POST https://<api-host>/api/cron/run-daily \
 *        -H "x-cron-secret: $CRON_SECRET"
 *
 * Point Vercel Cron, GitHub Actions, cron-job.org or a server crontab at that.
 * Running it more than once a day is harmless - each job filters on what it has
 * already done.
 *
 * The check-in routes are deliberately unauthenticated: they are opened from an
 * email by a candidate who is very likely not logged in. The signed token in the
 * URL is the credential, and it is scoped to one application and expires.
 */
// `optionalAuth` so a logged-in admin can trigger a run from the settings page
// while an external scheduler, which has no session, still gets through on the
// shared secret alone. The controller decides which of the two applies.
router.post('/run-daily', optionalAuth_1.optionalAuth, cron_controller_1.CronControllers.runDaily);
router.get('/check-in', cron_controller_1.CronControllers.getCheckIn);
router.post('/check-in', cron_controller_1.CronControllers.submitCheckIn);
exports.CronRoutes = router;
//# sourceMappingURL=cron.routes.js.map