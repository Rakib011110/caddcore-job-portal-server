import { z } from 'zod';
export declare const UserValidation: {
    createUserValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            role: z.ZodEnum<{
                [x: string]: string;
            }>;
            email: z.ZodString;
            password: z.ZodString;
            mobileNumber: z.ZodString;
            nid: z.ZodOptional<z.ZodString>;
            profilePhoto: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    updateUserValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodEnum<{
                [x: string]: string;
            }>>;
            email: z.ZodOptional<z.ZodString>;
            password: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodEnum<{
                [x: string]: string;
            }>>;
            mobileNumber: z.ZodOptional<z.ZodString>;
            nid: z.ZodOptional<z.ZodString>;
            profilePhoto: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodString>;
            age: z.ZodOptional<z.ZodNumber>;
            cvUrl: z.ZodOptional<z.ZodString>;
            experienceCertificateUrl: z.ZodOptional<z.ZodString>;
            universityCertificateUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
//# sourceMappingURL=user.validation.d.ts.map