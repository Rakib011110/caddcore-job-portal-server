"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSRoutes = void 0;
const express_1 = __importDefault(require("express"));
const sms_controller_1 = require("./sms.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
// import validateRequest from '../../middlewares/validateRequest';
// import { SMSValidation } from './sms.validation';
const router = express_1.default.Router();
// Test SMS endpoint (Admin only)
router.post('/send-test', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), 
// validateRequest(SMSValidation.sendTestSMSValidation),
sms_controller_1.SMSController.sendTestSMS);
// Check SMS balance (Admin only)
router.get('/balance', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), sms_controller_1.SMSController.checkBalance);
// Send membership interview SMS (Admin only)
router.post('/send-membership-interview', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), 
// validateRequest(SMSValidation.sendMembershipInterviewSMSValidation),
sms_controller_1.SMSController.sendMembershipInterviewSMS);
exports.SMSRoutes = router;
//# sourceMappingURL=sms.routes.js.map