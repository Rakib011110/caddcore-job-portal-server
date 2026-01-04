"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSValidation = void 0;
const zod_1 = require("zod");
// Validation for sending test SMS
const sendTestSMSValidation = zod_1.z.object({
    body: zod_1.z.object({
        phoneNumber: zod_1.z.string().nonempty('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
        message: zod_1.z.string().nonempty('Message is required').min(1, 'Message cannot be empty').max(320, 'Message too long for SMS'),
    }),
});
// Validation for sending membership interview SMS
const sendMembershipInterviewSMSValidation = zod_1.z.object({
    body: zod_1.z.object({
        phoneNumber: zod_1.z.string().nonempty('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
        userName: zod_1.z.string().nonempty('User name is required'),
        membershipType: zod_1.z.enum(['SENIOR_FELLOW', 'MEMBER', 'ASSOCIATE_MEMBER']).refine((val) => val !== undefined, { message: 'Membership type is required' }),
        applicationStatus: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).refine((val) => val !== undefined, { message: 'Application status is required' }),
        interviewDate: zod_1.z.string().optional(),
        interviewTime: zod_1.z.string().optional(),
        adminNotes: zod_1.z.string().optional(),
    }),
});
exports.SMSValidation = {
    sendTestSMSValidation,
    sendMembershipInterviewSMSValidation,
};
//# sourceMappingURL=sms.validation.js.map