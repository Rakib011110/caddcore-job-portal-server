"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const config_1 = __importDefault(require("../../../config"));
const cron_service_1 = require("./cron.service");
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
const assertCronAccess = (req) => {
    const provided = req.headers['x-cron-secret'];
    const expected = config_1.default.cron_secret;
    if (expected && provided === expected)
        return;
    const role = req.user?.role;
    if (role === 'ADMIN' || role === 'HR')
        return;
    throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'This endpoint requires a valid cron secret or an admin session.');
};
/** Run the daily schedule. Safe to call more than once a day. */
const runDaily = (0, catchAsync_1.catchAsync)(async (req, res) => {
    assertCronAccess(req);
    const results = await cron_service_1.CronService.runDailyJobs();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Daily jobs completed',
        data: { ranAt: new Date(), results },
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE CHECK-IN (public, token-gated)
// ─────────────────────────────────────────────────────────────────────────────
const getCheckIn = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const token = req.query.token;
    if (!token) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Check-in link is missing its token.');
    }
    const context = await cron_service_1.CronService.getCheckInContext(token);
    if (!context) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This check-in link has expired or is no longer valid. Please contact the placement office.');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Check-in details fetched successfully',
        data: context,
    });
});
const submitCheckIn = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { token, answer, note } = req.body ?? {};
    if (!token || (answer !== 'working' && answer !== 'left')) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'A token and an answer of "working" or "left" are required.');
    }
    const result = await cron_service_1.CronService.submitCheckInResponse(token, answer, note);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This check-in link has expired or is no longer valid.');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Thank you - your placement record has been updated.',
        data: result,
    });
});
exports.CronControllers = {
    runDaily,
    getCheckIn,
    submitCheckIn,
};
//# sourceMappingURL=cron.controller.js.map