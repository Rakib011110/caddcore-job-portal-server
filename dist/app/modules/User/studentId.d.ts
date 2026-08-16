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
/**
 * Trims and upper-cases so `cc-1234`, ` CC-1234 ` and `CC-1234` are treated as
 * one identity rather than three. Blank input collapses to `undefined` so the
 * field is left unset instead of stored as an empty string (an empty string
 * would occupy the unique index and block the next user who omits the field).
 *
 * Mirrors the `trim`/`uppercase` on the schema path; done here as well so the
 * duplicate pre-check compares the same form that will eventually be stored.
 */
export declare const normalizeStudentId: (raw: unknown) => string | undefined;
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
export declare const resolveStudentIdForRegistration: (raw: unknown, options?: IResolveStudentIdOptions) => Promise<string | undefined>;
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
export declare const resolveStudentIdClaim: (userId: string, raw: unknown) => Promise<string | undefined>;
/** True when the error is the unique-index violation on `studentId`. */
export declare const isDuplicateStudentIdError: (error: any) => boolean;
/**
 * Runs a user-creating operation and converts a `studentId` unique-index
 * violation into the same clear 409 the pre-check produces.
 *
 * Without this the global duplicate-key handler turns the failure into a
 * generic 400 "Invalid ID", which tells the user nothing about what to fix.
 */
export declare const rethrowDuplicateStudentId: <T>(operation: () => Promise<T>) => Promise<T>;
//# sourceMappingURL=studentId.d.ts.map