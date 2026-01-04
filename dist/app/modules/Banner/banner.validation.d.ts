import { z } from 'zod';
export declare const BannerValidation: {
    createBannerValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            imageUrl: z.ZodString;
            altText: z.ZodOptional<z.ZodString>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            order: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    updateBannerValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            imageUrl: z.ZodOptional<z.ZodString>;
            altText: z.ZodOptional<z.ZodString>;
            isActive: z.ZodOptional<z.ZodBoolean>;
            order: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
//# sourceMappingURL=banner.validation.d.ts.map