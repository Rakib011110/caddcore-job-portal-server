"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.post('/register', auth_controller_1.AuthControllers.registerUser);
router.post('/login', auth_controller_1.AuthControllers.loginUser);
router.post('/refresh-token', auth_controller_1.AuthControllers.refreshToken);
router.post('/verify-email', auth_controller_1.AuthControllers.verifyEmail);
router.post('/resend-verification', auth_controller_1.AuthControllers.resendVerificationEmail);
router.post('/forgot-password', auth_controller_1.AuthControllers.forgotPassword);
router.post('/reset-password', auth_controller_1.AuthControllers.resetPassword);
// Protected routes (authentication required)
router.post('/logout', auth_1.requireAuth, auth_controller_1.AuthControllers.logout);
router.post('/change-password', auth_1.requireAuth, auth_controller_1.AuthControllers.changePassword);
// Admin only routes
router.post('/bulk-register', auth_1.requireAdmin, auth_controller_1.AuthControllers.bulkRegisterUsers);
// User profile route (requires authentication)
router.get('/me', auth_1.requireAuth, auth_controller_1.AuthControllers.getMyProfile);
exports.AuthRoutes = router;
//# sourceMappingURL=auth.routes.js.map