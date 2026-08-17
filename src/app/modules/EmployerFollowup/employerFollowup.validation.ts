import { z } from 'zod';
import {
  CONTACT_METHODS,
  FOLLOWUP_OUTCOMES,
  FOLLOWUP_PURPOSES,
  HIRING_NEEDS,
} from './employerFollowup.interface';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP VALIDATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The enums come from the interface rather than being retyped here, so adding a
 * contact method in one place cannot leave the validator rejecting it.
 */

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid MongoDB ObjectId');

const createFollowupValidationSchema = z.object({
  body: z.object({
    companyId: objectId,

    contactPerson: z.string().trim().max(120).optional(),
    contactDesignation: z.string().trim().max(120).optional(),
    contactPhone: z.string().trim().max(40).optional(),
    contactEmail: z.string().trim().email('Must be a valid email').optional(),

    contactDate: z.coerce.date().optional(),
    contactMethod: z.enum(CONTACT_METHODS),
    purpose: z.enum(FOLLOWUP_PURPOSES),
    response: z.string().max(3000).optional(),
    outcome: z.enum(FOLLOWUP_OUTCOMES).optional(),
    hiringNeed: z.enum(HIRING_NEEDS).optional(),
    rolesDiscussed: z.array(z.string().trim()).optional(),
    vacanciesOffered: z.number().int().min(0).optional(),

    nextAction: z.string().max(1000).optional(),
    nextActionDate: z.coerce.date().optional(),
    isNextActionDone: z.boolean().optional(),

    notes: z.string().max(3000).optional(),
  }),
});

/** Same shape, everything optional - companyId included, since a log line
 *  should not change which employer it belongs to. */
const updateFollowupValidationSchema = z.object({
  body: z.object({
    contactPerson: z.string().trim().max(120).optional(),
    contactDesignation: z.string().trim().max(120).optional(),
    contactPhone: z.string().trim().max(40).optional(),
    contactEmail: z.string().trim().email('Must be a valid email').optional(),

    contactDate: z.coerce.date().optional(),
    contactMethod: z.enum(CONTACT_METHODS).optional(),
    purpose: z.enum(FOLLOWUP_PURPOSES).optional(),
    response: z.string().max(3000).optional(),
    outcome: z.enum(FOLLOWUP_OUTCOMES).optional(),
    hiringNeed: z.enum(HIRING_NEEDS).optional(),
    rolesDiscussed: z.array(z.string().trim()).optional(),
    vacanciesOffered: z.number().int().min(0).optional(),

    nextAction: z.string().max(1000).optional(),
    nextActionDate: z.coerce.date().optional(),
    isNextActionDone: z.boolean().optional(),

    notes: z.string().max(3000).optional(),
  }),
});

export const EmployerFollowupValidation = {
  createFollowupValidationSchema,
  updateFollowupValidationSchema,
};
