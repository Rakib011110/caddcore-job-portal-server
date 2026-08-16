import { z } from 'zod';
import { USER_ROLE, USER_STATUS } from './user.constant';

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string().nonempty('Name is required'),
    role: z.enum([...Object.keys(USER_ROLE)] as [string, ...string[]]),
    email: z
      .string().nonempty('Email is required')
      .email({
        message: 'Invalid email address',
      }),
    password: z
      .string().nonempty('Password is required')
      .min(6, {
        message: 'Password must be at least 6 characters',
      }),
    mobileNumber: z.string().nonempty('Mobile number is required'),
    nid: z.string().optional(),
    profilePhoto: z.string().optional(),
    address: z.string().optional(),
    // Optional here on purpose: whether a Student ID is required is a runtime
    // setting, so that check lives in the service layer, not this static schema.
    studentId: z.string().optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    role: z.enum([...Object.keys(USER_ROLE)] as [string, ...string[]]).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    status: z.enum([...Object.keys(USER_STATUS)] as [string, ...string[]]).optional(),
    mobileNumber: z.string().optional(),
    nid: z.string().optional(),
    profilePhoto: z.string().optional(),
    address: z.string().optional(),
    // Only writable while unset - the service enforces claim-once semantics.
    studentId: z.string().optional(),
    age: z.number().optional(),
    cvUrl: z.string().optional(),
    experienceCertificateUrl: z.string().optional(),
    universityCertificateUrl: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
