"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const user_constant_1 = require("./user.constant");
const createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().nonempty('Name is required'),
        role: zod_1.z.enum([...Object.keys(user_constant_1.USER_ROLE)]),
        email: zod_1.z
            .string().nonempty('Email is required')
            .email({
            message: 'Invalid email address',
        }),
        password: zod_1.z
            .string().nonempty('Password is required')
            .min(6, {
            message: 'Password must be at least 6 characters',
        }),
        mobileNumber: zod_1.z.string().nonempty('Mobile number is required'),
        nid: zod_1.z.string().optional(),
        profilePhoto: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    }),
});
const updateUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        role: zod_1.z.enum([...Object.keys(user_constant_1.USER_ROLE)]).optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().min(6).optional(),
        status: zod_1.z.enum([...Object.keys(user_constant_1.USER_STATUS)]).optional(),
        mobileNumber: zod_1.z.string().optional(),
        nid: zod_1.z.string().optional(),
        profilePhoto: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        age: zod_1.z.number().optional(),
        cvUrl: zod_1.z.string().optional(),
        experienceCertificateUrl: zod_1.z.string().optional(),
        universityCertificateUrl: zod_1.z.string().optional(),
    }),
});
exports.UserValidation = {
    createUserValidationSchema,
    updateUserValidationSchema,
};
//# sourceMappingURL=user.validation.js.map