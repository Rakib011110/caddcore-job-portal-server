import httpStatus from "http-status";
import AppError from "../error/AppError";
import { Job } from "../modules/jobs/job.model";
import { USER_ROLE } from "../modules/User/user.constant";

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
export const checkJobOwnership = async (jobId: string | undefined, user: any) => {
  if (!jobId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Job ID is required");
  }

  // Admin/HR can access any job
  if (user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.HR) {
    return true;
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  // COMPANY must own the job
  if (user?.role === USER_ROLE.COMPANY) {
    if (!user.companyId || job.company?.toString() !== user.companyId) {
      throw new AppError(httpStatus.FORBIDDEN, "You can only modify your own company's jobs");
    }
  }

  return true;
};

/**
 * Check if user can modify a company
 * - ADMIN/HR can modify any company
 * - COMPANY can only modify their own company
 */
export const checkCompanyOwnership = async (companyId: string, user: any) => {
  // Admin/HR can access any company
  if (user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.HR) {
    return true;
  }

  // COMPANY must own the company
  if (user?.role === USER_ROLE.COMPANY) {
    if (!user.companyId || companyId !== user.companyId) {
      throw new AppError(httpStatus.FORBIDDEN, "You can only modify your own company");
    }
  }

  return true;
};
