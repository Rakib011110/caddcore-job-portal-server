/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Business logic for Company module including registration, approval, and CRUD.
 */

import { Types, FilterQuery } from 'mongoose';
import httpStatus from 'http-status';
import { Company } from './company.model';
import { User } from '../User/user.model';
import { 
  ICompany, 
  ICompanyRegistrationInput, 
  ICompanyUpdateInput,
  ICompanyApprovalInput 
} from './company.interface';
import { COMPANY_STATUS } from './company.constant';
import AppError from '../../error/AppError';
import config from '../../../config';

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER COMPANY (Creates User + Company)
// ─────────────────────────────────────────────────────────────────────────────

const registerCompany = async (
  payload: ICompanyRegistrationInput
): Promise<{ user: any; company: ICompany }> => {
  // Check if user email already exists
  const existingUser = await User.isUserExistsByEmail(payload.userEmail);
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'User with this email already exists');
  }

  // Generate slug from company name (userName = company name)
  const baseSlug = payload.userName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Check if slug exists and make it unique
  let slug = baseSlug;
  let counter = 1;
  while (await Company.isCompanyExistsBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create user with COMPANY role
  // Note: userName = Company Name, userEmail = Company Email, userPhone = Company Phone
  const userData = {
    name: payload.userName,        // Company Name
    email: payload.userEmail,      // Company Email
    password: payload.userPassword,
    mobileNumber: payload.userPhone, // Company Phone
    role: 'COMPANY' as const,
    status: 'ACTIVE' as const,
  };

  const user = await User.create(userData);

  // Create company linked to user
  // NOTE: name, email, phone are NOT stored here - they come from User model via populate
  const companyData: Partial<ICompany> = {
    slug,
    userId: user._id as unknown as Types.ObjectId,
    industry: payload.industry,
    companySize: payload.companySize,
    city: payload.city,
    country: payload.country,
    website: payload.website,
    description: payload.description,
    status: 'PENDING',
  };

  const company = await Company.create(companyData);

  // Update user with companyId reference
  await User.findByIdAndUpdate(user._id, { companyId: company._id });

  // Remove sensitive data from user response
  const userObject = user.toObject() as Record<string, unknown>;
  userObject.password = undefined;

  return { user: userObject, company };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MY COMPANY (For logged-in company user)
// ─────────────────────────────────────────────────────────────────────────────

const getMyCompany = async (userId: string): Promise<ICompany | null> => {
  const company = await Company.findOne({ userId })
    .populate('userId', 'name email profilePhoto')
    .populate('approvedBy', 'name email');

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, 'Company not found for this user');
  }

  return company;
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE MY COMPANY
// ─────────────────────────────────────────────────────────────────────────────

const updateMyCompany = async (
  userId: string,
  payload: ICompanyUpdateInput
): Promise<ICompany | null> => {
  const company = await Company.findOne({ userId });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, 'Company not found');
  }

  // NOTE: To update company name, email, phone - update the User model instead
  // User.name = Company Name
  // User.email = Company Email  
  // User.mobileNumber = Company Phone

  const updatedCompany = await Company.findByIdAndUpdate(
    company._id,
    { $set: payload },
    { new: true, runValidators: true }
  ).populate('userId', 'name email mobileNumber profilePhoto');

  return updatedCompany;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET COMPANY BY ID (Public)
// ─────────────────────────────────────────────────────────────────────────────

const getCompanyById = async (id: string): Promise<ICompany | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid company ID');
  }

  const company = await Company.findById(id)
    .populate('userId', 'name email profilePhoto')
    .populate('approvedBy', 'name email');

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, 'Company not found');
  }

  return company;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET COMPANY BY SLUG (Public)
// ─────────────────────────────────────────────────────────────────────────────

const getCompanyBySlug = async (slug: string): Promise<ICompany | null> => {
  const company = await Company.findOne({ slug, status: COMPANY_STATUS.APPROVED })
    .populate('userId', 'name email profilePhoto');

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, 'Company not found');
  }

  return company;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL COMPANIES (Public - Only approved)
// ─────────────────────────────────────────────────────────────────────────────

const getAllApprovedCompanies = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<ICompany> = { status: COMPANY_STATUS.APPROVED };

  // Search by name or industry
  if (query.searchTerm) {
    filter.$or = [
      { name: { $regex: query.searchTerm, $options: 'i' } },
      { industry: { $regex: query.searchTerm, $options: 'i' } },
      { city: { $regex: query.searchTerm, $options: 'i' } },
    ];
  }

  // Filter by industry
  if (query.industry) {
    filter.industry = query.industry as string;
  }

  // Filter by city
  if (query.city) {
    filter.city = { $regex: query.city, $options: 'i' };
  }

  const companies = await Company.find(filter)
    .populate('userId', 'name email profilePhoto')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Company.countDocuments(filter);

  return {
    companies,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET ALL COMPANIES (Including pending)
// ─────────────────────────────────────────────────────────────────────────────

const getAllCompaniesForAdmin = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<ICompany> = {};

  // Filter by status
  if (query.status) {
    filter.status = query.status as string;
  }

  // Search by name or email
  if (query.searchTerm) {
    filter.$or = [
      { name: { $regex: query.searchTerm, $options: 'i' } },
      { email: { $regex: query.searchTerm, $options: 'i' } },
      { industry: { $regex: query.searchTerm, $options: 'i' } },
    ];
  }

  const companies = await Company.find(filter)
    .populate('userId', 'name email profilePhoto')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Company.countDocuments(filter);

  return {
    companies,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET PENDING COMPANIES
// ─────────────────────────────────────────────────────────────────────────────

const getPendingCompanies = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<ICompany> = { status: COMPANY_STATUS.PENDING };

  const companies = await Company.find(filter)
    .populate('userId', 'name email profilePhoto mobileNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Company.countDocuments(filter);

  return {
    companies,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: APPROVE COMPANY
// ─────────────────────────────────────────────────────────────────────────────

const approveCompany = async (
  companyId: string,
  adminId: string,
  payload: ICompanyApprovalInput
): Promise<ICompany | null> => {
  if (!Types.ObjectId.isValid(companyId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid company ID');
  }

  const company = await Company.findById(companyId);

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, 'Company not found');
  }

  // Add to approval history
  const historyEntry = {
    status: payload.status,
    changedBy: new Types.ObjectId(adminId),
    changedAt: new Date(),
    reason: payload.reason,
    notes: payload.notes,
  };

  const updateData: Record<string, unknown> = {
    status: payload.status,
    $push: { approvalHistory: historyEntry },
  };

  if (payload.status === 'APPROVED') {
    updateData.approvedBy = adminId;
    updateData.approvedAt = new Date();
    updateData.rejectionReason = null;
  } else if (payload.status === 'REJECTED') {
    updateData.rejectionReason = payload.reason;
    updateData.approvedBy = null;
    updateData.approvedAt = null;
  } else if (payload.status === 'SUSPENDED') {
    updateData.rejectionReason = payload.reason;
  }

  const updatedCompany = await Company.findByIdAndUpdate(
    companyId,
    updateData,
    { new: true, runValidators: true }
  ).populate('userId', 'name email')
   .populate('approvedBy', 'name email');

  // TODO: Send email notification to company
  // await sendCompanyStatusEmail(updatedCompany, payload.status, payload.reason);

  return updatedCompany;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET COMPANY STATISTICS (For dashboard)
// ─────────────────────────────────────────────────────────────────────────────

const getCompanyStats = async () => {
  const [
    totalCompanies,
    pendingCompanies,
    approvedCompanies,
    rejectedCompanies,
    suspendedCompanies,
    premiumCompanies,
    verifiedCompanies,
  ] = await Promise.all([
    Company.countDocuments(),
    Company.countDocuments({ status: COMPANY_STATUS.PENDING }),
    Company.countDocuments({ status: COMPANY_STATUS.APPROVED }),
    Company.countDocuments({ status: COMPANY_STATUS.REJECTED }),
    Company.countDocuments({ status: COMPANY_STATUS.SUSPENDED }),
    Company.countDocuments({ isPremium: true }),
    Company.countDocuments({ isVerified: true }),
  ]);

  // Get recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentRegistrations = await Company.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Get industry distribution
  const industryDistribution = await Company.aggregate([
    { $match: { status: COMPANY_STATUS.APPROVED } },
    { $group: { _id: '$industry', count: { $sum: 1 } } },
    { $sort: { count: -1 as const } },
    { $limit: 10 },
  ]);

  return {
    total: totalCompanies,
    pending: pendingCompanies,
    approved: approvedCompanies,
    rejected: rejectedCompanies,
    suspended: suspendedCompanies,
    premium: premiumCompanies,
    verified: verifiedCompanies,
    recentRegistrations,
    industryDistribution,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CHECK IF COMPANY CAN POST JOB
// ─────────────────────────────────────────────────────────────────────────────

const canCompanyPostJob = async (userId: string): Promise<{
  canPost: boolean;
  reason?: string;
  company?: ICompany;
}> => {
  const company = await Company.findOne({ userId });

  if (!company) {
    return { canPost: false, reason: 'Company not found' };
  }

  if (company.status !== COMPANY_STATUS.APPROVED) {
    return { 
      canPost: false, 
      reason: `Company is ${company.status.toLowerCase()}. Only approved companies can post jobs.`,
      company,
    };
  }

  const activeJobsCount = company.activeJobs || 0;
  const jobLimit = company.jobPostLimit || 5;

  if (activeJobsCount >= jobLimit) {
    return {
      canPost: false,
      reason: `Job posting limit reached (${activeJobsCount}/${jobLimit}). Upgrade to premium for more.`,
      company,
    };
  }

  return { canPost: true, company };
};

// ─────────────────────────────────────────────────────────────────────────────
// INCREMENT JOB COUNT
// ─────────────────────────────────────────────────────────────────────────────

const incrementJobCount = async (companyId: string) => {
  await Company.findByIdAndUpdate(companyId, {
    $inc: { totalJobsPosted: 1, activeJobs: 1 },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// DECREMENT ACTIVE JOB COUNT
// ─────────────────────────────────────────────────────────────────────────────

const decrementActiveJobCount = async (companyId: string) => {
  await Company.findByIdAndUpdate(companyId, {
    $inc: { activeJobs: -1 },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const CompanyService = {
  registerCompany,
  getMyCompany,
  updateMyCompany,
  getCompanyById,
  getCompanyBySlug,
  getAllApprovedCompanies,
  getAllCompaniesForAdmin,
  getPendingCompanies,
  approveCompany,
  getCompanyStats,
  canCompanyPostJob,
  incrementJobCount,
  decrementActiveJobCount,
};
