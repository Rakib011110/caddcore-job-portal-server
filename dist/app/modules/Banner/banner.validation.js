"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerValidation = void 0;
const zod_1 = require("zod");
const createBannerValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().min(1, 'Image URL is required and cannot be empty'),
        altText: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().default(true),
        order: zod_1.z.number().default(0),
    }),
});
const updateBannerValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().optional(),
        altText: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
        order: zod_1.z.number().optional(),
    }),
});
exports.BannerValidation = {
    createBannerValidationSchema,
    updateBannerValidationSchema,
};
//# sourceMappingURL=banner.validation.js.map