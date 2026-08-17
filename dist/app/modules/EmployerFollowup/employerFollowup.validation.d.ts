import { z } from 'zod';
export declare const EmployerFollowupValidation: {
    createFollowupValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            companyId: z.ZodString;
            contactPerson: z.ZodOptional<z.ZodString>;
            contactDesignation: z.ZodOptional<z.ZodString>;
            contactPhone: z.ZodOptional<z.ZodString>;
            contactEmail: z.ZodOptional<z.ZodString>;
            contactDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
            contactMethod: z.ZodEnum<{
                Other: "Other";
                Phone: "Phone";
                Email: "Email";
                WhatsApp: "WhatsApp";
                Visit: "Visit";
                Meeting: "Meeting";
                LinkedIn: "LinkedIn";
            }>;
            purpose: z.ZodEnum<{
                Other: "Other";
                "Initial Contact": "Initial Contact";
                "Vacancy Collection": "Vacancy Collection";
                "CV Submission": "CV Submission";
                "Interview Coordination": "Interview Coordination";
                "Placement Confirmation": "Placement Confirmation";
                "Relationship Building": "Relationship Building";
                "Feedback Collection": "Feedback Collection";
            }>;
            response: z.ZodOptional<z.ZodString>;
            outcome: z.ZodOptional<z.ZodEnum<{
                Pending: "Pending";
                "No Response": "No Response";
                Positive: "Positive";
                Neutral: "Neutral";
                Negative: "Negative";
            }>>;
            hiringNeed: z.ZodOptional<z.ZodEnum<{
                Unknown: "Unknown";
                Immediate: "Immediate";
                "Within 1 Month": "Within 1 Month";
                "Within 3 Months": "Within 3 Months";
                Future: "Future";
                None: "None";
            }>>;
            rolesDiscussed: z.ZodOptional<z.ZodArray<z.ZodString>>;
            vacanciesOffered: z.ZodOptional<z.ZodNumber>;
            nextAction: z.ZodOptional<z.ZodString>;
            nextActionDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
            isNextActionDone: z.ZodOptional<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    updateFollowupValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            contactPerson: z.ZodOptional<z.ZodString>;
            contactDesignation: z.ZodOptional<z.ZodString>;
            contactPhone: z.ZodOptional<z.ZodString>;
            contactEmail: z.ZodOptional<z.ZodString>;
            contactDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
            contactMethod: z.ZodOptional<z.ZodEnum<{
                Other: "Other";
                Phone: "Phone";
                Email: "Email";
                WhatsApp: "WhatsApp";
                Visit: "Visit";
                Meeting: "Meeting";
                LinkedIn: "LinkedIn";
            }>>;
            purpose: z.ZodOptional<z.ZodEnum<{
                Other: "Other";
                "Initial Contact": "Initial Contact";
                "Vacancy Collection": "Vacancy Collection";
                "CV Submission": "CV Submission";
                "Interview Coordination": "Interview Coordination";
                "Placement Confirmation": "Placement Confirmation";
                "Relationship Building": "Relationship Building";
                "Feedback Collection": "Feedback Collection";
            }>>;
            response: z.ZodOptional<z.ZodString>;
            outcome: z.ZodOptional<z.ZodEnum<{
                Pending: "Pending";
                "No Response": "No Response";
                Positive: "Positive";
                Neutral: "Neutral";
                Negative: "Negative";
            }>>;
            hiringNeed: z.ZodOptional<z.ZodEnum<{
                Unknown: "Unknown";
                Immediate: "Immediate";
                "Within 1 Month": "Within 1 Month";
                "Within 3 Months": "Within 3 Months";
                Future: "Future";
                None: "None";
            }>>;
            rolesDiscussed: z.ZodOptional<z.ZodArray<z.ZodString>>;
            vacanciesOffered: z.ZodOptional<z.ZodNumber>;
            nextAction: z.ZodOptional<z.ZodString>;
            nextActionDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
            isNextActionDone: z.ZodOptional<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
//# sourceMappingURL=employerFollowup.validation.d.ts.map