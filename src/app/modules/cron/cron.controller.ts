import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';
import config from '../../../config';
import { CronService } from './cron.service';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CRON CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Guard for the scheduled-run endpoint.
 *
 * This URL sends real email, so it cannot be open. It accepts either a shared
 * secret (for an external scheduler, which has no user session) or an
 * authenticated staff account (for the "Run now" button in settings).
 *
 * With no `CRON_SECRET` configured, the secret route is closed entirely rather
 * than left open - an unset environment variable must never mean "allow
 * everyone".
 */
const assertCronAccess = (req: Request): void => {
  const provided = req.headers['x-cron-secret'];
  const expected = config.cron_secret;

  if (expected && provided === expected) return;

  const role = (req as any).user?.role;
  if (role === 'ADMIN' || role === 'HR') return;

  throw new AppError(
    httpStatus.UNAUTHORIZED,
    'This endpoint requires a valid cron secret or an admin session.'
  );
};

/** Run the daily schedule. Safe to call more than once a day. */
const runDaily = catchAsync(async (req: Request, res: Response) => {
  assertCronAccess(req);

  const results = await CronService.runDailyJobs();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily jobs completed',
    data: { ranAt: new Date(), results },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE CHECK-IN (public, token-gated)
// ─────────────────────────────────────────────────────────────────────────────

const getCheckIn = catchAsync(async (req: Request, res: Response) => {
  const token = req.query.token as string | undefined;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Check-in link is missing its token.');
  }

  const context = await CronService.getCheckInContext(token);

  if (!context) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This check-in link has expired or is no longer valid. Please contact the placement office.'
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check-in details fetched successfully',
    data: context,
  });
});

const submitCheckIn = catchAsync(async (req: Request, res: Response) => {
  const { token, answer, note } = req.body ?? {};

  if (!token || (answer !== 'working' && answer !== 'left')) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A token and an answer of "working" or "left" are required.'
    );
  }

  const result = await CronService.submitCheckInResponse(token, answer, note);

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This check-in link has expired or is no longer valid.'
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Thank you - your placement record has been updated.',
    data: result,
  });
});

export const CronControllers = {
  runDaily,
  getCheckIn,
  submitCheckIn,
};
