import { z } from 'zod';
export declare const SMSValidation: {
    sendTestSMSValidation: z.ZodObject<{
        body: z.ZodObject<{
            phoneNumber: z.ZodString;
            message: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    sendMembershipInterviewSMSValidation: z.ZodObject<{
        body: z.ZodObject<{
            phoneNumber: z.ZodString;
            userName: z.ZodString;
            membershipType: z.ZodEnum<{
                SENIOR_FELLOW: "SENIOR_FELLOW";
                MEMBER: "MEMBER";
                ASSOCIATE_MEMBER: "ASSOCIATE_MEMBER";
            }>;
            applicationStatus: z.ZodEnum<{
                PENDING: "PENDING";
                REJECTED: "REJECTED";
                APPROVED: "APPROVED";
            }>;
            interviewDate: z.ZodOptional<z.ZodString>;
            interviewTime: z.ZodOptional<z.ZodString>;
            adminNotes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
//# sourceMappingURL=sms.validation.d.ts.map