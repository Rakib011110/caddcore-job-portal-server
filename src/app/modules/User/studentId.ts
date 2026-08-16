/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { SettingsService } from '../Settings/settings.service';
import { SETTING_KEYS } from '../Settings/settings.constant';
import { User } from './user.model';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * STUDENT ID - registration gate
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Every route that can create a user must run its incoming Student ID through
 * `resolveStudentIdForRegistration` and wrap the actual `User.create()` in
 * `rethrowDuplicateStudentId`. There is more than one registration door
 * (`/auth/register`, `/user/create-user`, bulk register), so keeping the rules
 * in one module is what stops the requirement from being bypassable.
 *
 * Two layers guard uniqueness, and BOTH are needed:
 *
 *   1. The pre-check here returns a clear, actionable 409 for the normal case.
 *   2. The `studentId_unique` partial index in user.model.ts is the actual
 *      guarantee - two concurrent registrations with the same ID both pass the
 *      pre-check, and only the index stops the second one from being written.
 */

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trims and upper-cases so `cc-1234`, ` CC-1234 ` and `CC-1234` are treated as
 * one identity rather than three. Blank input collapses to `undefined` so the
 * field is left unset instead of stored as an empty string (an empty string
 * would occupy the unique index and block the next user who omits the field).
 *
 * Mirrors the `trim`/`uppercase` on the schema path; done here as well so the
 * duplicate pre-check compares the same form that will eventually be stored.
 */
export const normalizeStudentId = (raw: unknown): string | undefined => {
  if (typeof raw !== 'string') return undefined;

  const normalized = raw.trim().toUpperCase();
  return normalized.length > 0 ? normalized : undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRATION GATE
// ─────────────────────────────────────────────────────────────────────────────

export interface IResolveStudentIdOptions {
  /**
   * Skips the "is it required?" check while still enforcing uniqueness.
   * Used by admin-driven creation paths, where an admin adding an account by
   * hand should not be blocked by a setting aimed at public sign-ups.
   */
  skipRequiredCheck?: boolean;
}

/**
 * Validates an incoming Student ID against the current settings and returns the
 * normalized value to persist (or `undefined` when none was supplied and none
 * is required).
 *
 * @throws 400 when the ID is required but missing
 * @throws 409 when the ID already belongs to another account
 */
export const resolveStudentIdForRegistration = async (
  raw: unknown,
  options: IResolveStudentIdOptions = {}
): Promise<string | undefined> => {
  const studentId = normalizeStudentId(raw);

  if (!studentId) {
    if (options.skipRequiredCheck) return undefined;

    const isRequired = await SettingsService.get<boolean>(
      SETTING_KEYS.REGISTRATION_STUDENT_ID_REQUIRED
    );

    if (isRequired) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Student ID is required to register'
      );
    }

    return undefined;
  }

  // Uniqueness is enforced whether or not the ID is required - an ID that has
  // already been used must never be reusable, even while the setting is off.
  const alreadyTaken = await User.exists({ studentId });

  if (alreadyTaken) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This Student ID is already registered to another account'
    );
  }

  return studentId;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST-REGISTRATION CLAIM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves a Student ID supplied through a profile update.
 *
 * The rule is claim-once: an account with no Student ID may still add one (this
 * is how users who registered before the requirement was switched on fill it
 * in), but once set it is frozen. Allowing edits would let anyone cycle through
 * IDs after registering and make the uniqueness guarantee meaningless.
 *
 * Returns the normalized value to write, or `undefined` when the caller should
 * leave the stored value untouched.
 *
 * @throws 409 when the ID belongs to another account
 * @throws 403 when the account already has a different Student ID
 */
export const resolveStudentIdClaim = async (
  userId: string,
  raw: unknown
): Promise<string | undefined> => {
  const studentId = normalizeStudentId(raw);
  const existing = await User.findById(userId).select('studentId').lean();

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const current = existing.studentId;

  if (current) {
    // Re-sending the same value is a no-op rather than an error, so a client
    // that PUTs the whole profile back does not fail on an unchanged field.
    if (!studentId || studentId === current) return undefined;

    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your Student ID has already been set and cannot be changed. Please contact support if it is incorrect.'
    );
  }

  if (!studentId) return undefined;

  const alreadyTaken = await User.exists({ studentId, _id: { $ne: userId } });

  if (alreadyTaken) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This Student ID is already registered to another account'
    );
  }

  return studentId;
};

// ─────────────────────────────────────────────────────────────────────────────
// RACE-CONDITION SAFETY NET
// ─────────────────────────────────────────────────────────────────────────────

/** True when the error is the unique-index violation on `studentId`. */
export const isDuplicateStudentIdError = (error: any): boolean =>
  error?.code === 11000 &&
  (error?.keyPattern?.studentId !== undefined ||
    error?.keyValue?.studentId !== undefined);

/**
 * Runs a user-creating operation and converts a `studentId` unique-index
 * violation into the same clear 409 the pre-check produces.
 *
 * Without this the global duplicate-key handler turns the failure into a
 * generic 400 "Invalid ID", which tells the user nothing about what to fix.
 */
export const rethrowDuplicateStudentId = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (isDuplicateStudentIdError(error)) {
      throw new AppError(
        httpStatus.CONFLICT,
        'This Student ID is already registered to another account'
      );
    }
    throw error;
  }
};
