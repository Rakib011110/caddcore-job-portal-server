/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTHORIZATION HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Simple functions to check resource ownership.
 * Call these in your controllers, not as middleware.
 *
 * USAGE:
 *   await checkJobOwnership(req.params.id, req.user);
 */
/**
 * Check if user can modify a job
 * - ADMIN/HR can modify any job
 * - COMPANY can only modify their own company's jobs
 */
export declare const checkJobOwnership: (jobId: string | undefined, user: any) => Promise<boolean>;
/**
 * Check if user can modify a company
 * - ADMIN/HR can modify any company
 * - COMPANY can only modify their own company
 */
export declare const checkCompanyOwnership: (companyId: string, user: any) => Promise<boolean>;
//# sourceMappingURL=authorization.d.ts.map