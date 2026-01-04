import { z } from 'zod';

// Validation for sending test SMS
const sendTestSMSValidation = z.object({
  body: z.object({
    phoneNumber: z.string().nonempty('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
    message: z.string().nonempty('Message is required').min(1, 'Message cannot be empty').max(320, 'Message too long for SMS'),
  }),
});

// Validation for sending membership interview SMS
const sendMembershipInterviewSMSValidation = z.object({
  body: z.object({
    phoneNumber: z.string().nonempty('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
    userName: z.string().nonempty('User name is required'),
    membershipType: z.enum(['SENIOR_FELLOW', 'MEMBER', 'ASSOCIATE_MEMBER'] as const).refine(
      (val) => val !== undefined, 
      { message: 'Membership type is required' }
    ),
    applicationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED'] as const).refine(
      (val) => val !== undefined,
      { message: 'Application status is required' }
    ),
    interviewDate: z.string().optional(),
    interviewTime: z.string().optional(),
    adminNotes: z.string().optional(),
  }),
});

export const SMSValidation = {
  sendTestSMSValidation,
  sendMembershipInterviewSMSValidation,
};
