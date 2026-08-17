import express from 'express';
import { CronControllers } from './cron.controller';
import { optionalAuth } from '../../middlewares/optionalAuth';

const router = express.Router();

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
router.post('/run-daily', optionalAuth, CronControllers.runDaily);

router.get('/check-in', CronControllers.getCheckIn);
router.post('/check-in', CronControllers.submitCheckIn);

export const CronRoutes = router;
