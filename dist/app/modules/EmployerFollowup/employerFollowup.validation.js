"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerFollowupValidation = void 0;
const zod_1 = require("zod");
const employerFollowup_interface_1 = require("./employerFollowup.interface");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP VALIDATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The enums come from the interface rather than being retyped here, so adding a
 * contact method in one place cannot leave the validator rejecting it.
 */
const objectId = zod_1.z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid MongoDB ObjectId');
const createFollowupValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        companyId: objectId,
        contactPerson: zod_1.z.string().trim().max(120).optional(),
        contactDesignation: zod_1.z.string().trim().max(120).optional(),
        contactPhone: zod_1.z.string().trim().max(40).optional(),
        contactEmail: zod_1.z.string().trim().email('Must be a valid email').optional(),
        contactDate: zod_1.z.coerce.date().optional(),
        contactMethod: zod_1.z.enum(employerFollowup_interface_1.CONTACT_METHODS),
        purpose: zod_1.z.enum(employerFollowup_interface_1.FOLLOWUP_PURPOSES),
        response: zod_1.z.string().max(3000).optional(),
        outcome: zod_1.z.enum(employerFollowup_interface_1.FOLLOWUP_OUTCOMES).optional(),
        hiringNeed: zod_1.z.enum(employerFollowup_interface_1.HIRING_NEEDS).optional(),
        rolesDiscussed: zod_1.z.array(zod_1.z.string().trim()).optional(),
        vacanciesOffered: zod_1.z.number().int().min(0).optional(),
        nextAction: zod_1.z.string().max(1000).optional(),
        nextActionDate: zod_1.z.coerce.date().optional(),
        isNextActionDone: zod_1.z.boolean().optional(),
        notes: zod_1.z.string().max(3000).optional(),
    }),
});
/** Same shape, everything optional - companyId included, since a log line
 *  should not change which employer it belongs to. */
const updateFollowupValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        contactPerson: zod_1.z.string().trim().max(120).optional(),
        contactDesignation: zod_1.z.string().trim().max(120).optional(),
        contactPhone: zod_1.z.string().trim().max(40).optional(),
        contactEmail: zod_1.z.string().trim().email('Must be a valid email').optional(),
        contactDate: zod_1.z.coerce.date().optional(),
        contactMethod: zod_1.z.enum(employerFollowup_interface_1.CONTACT_METHODS).optional(),
        purpose: zod_1.z.enum(employerFollowup_interface_1.FOLLOWUP_PURPOSES).optional(),
        response: zod_1.z.string().max(3000).optional(),
        outcome: zod_1.z.enum(employerFollowup_interface_1.FOLLOWUP_OUTCOMES).optional(),
        hiringNeed: zod_1.z.enum(employerFollowup_interface_1.HIRING_NEEDS).optional(),
        rolesDiscussed: zod_1.z.array(zod_1.z.string().trim()).optional(),
        vacanciesOffered: zod_1.z.number().int().min(0).optional(),
        nextAction: zod_1.z.string().max(1000).optional(),
        nextActionDate: zod_1.z.coerce.date().optional(),
        isNextActionDone: zod_1.z.boolean().optional(),
        notes: zod_1.z.string().max(3000).optional(),
    }),
});
exports.EmployerFollowupValidation = {
    createFollowupValidationSchema,
    updateFollowupValidationSchema,
};
//# sourceMappingURL=employerFollowup.validation.js.map