"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const sms_service_1 = require("./sms.service");
const sms_templates_1 = require("./sms.templates");
// Test SMS endpoint
const sendTestSMS = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Phone number and message are required',
            data: null,
        });
    }
    const result = await sms_service_1.SMSService.sendSMS(phoneNumber, message);
    (0, sendResponse_1.default)(res, {
        statusCode: result.success ? http_status_1.default.OK : http_status_1.default.BAD_REQUEST,
        success: result.success,
        message: result.message || 'SMS operation completed',
        data: result,
    });
});
// Check SMS balance
const checkBalance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await sms_service_1.SMSService.checkBalance();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'SMS balance retrieved successfully',
        data: result,
    });
});
// Send membership interview SMS (for testing)
const sendMembershipInterviewSMS = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { phoneNumber, userName, membershipType, applicationStatus, interviewDate, interviewTime, adminNotes } = req.body;
    if (!phoneNumber || !userName || !membershipType || !applicationStatus) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Required fields: phoneNumber, userName, membershipType, applicationStatus',
            data: null,
        });
    }
    // Create SMS message
    const smsMessage = (0, sms_templates_1.createMembershipInterviewSMS)(userName, membershipType, applicationStatus, interviewDate, interviewTime, adminNotes);
    console.log('📱 Generated SMS:', smsMessage);
    // Send SMS
    const result = await sms_service_1.SMSService.sendSMS(phoneNumber, smsMessage);
    (0, sendResponse_1.default)(res, {
        statusCode: result.success ? http_status_1.default.OK : http_status_1.default.BAD_REQUEST,
        success: result.success,
        message: result.message || 'SMS operation completed',
        data: {
            smsResult: result,
            generatedMessage: smsMessage
        },
    });
});
exports.SMSController = {
    sendTestSMS,
    checkBalance,
    sendMembershipInterviewSMS,
};
//# sourceMappingURL=sms.controller.js.map