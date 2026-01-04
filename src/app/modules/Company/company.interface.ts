/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY INTERFACE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * TypeScript interfaces for Company module.
 */

import { Model, Types } from 'mongoose';
import { COMPANY_STATUS, COMPANY_SIZE, INDUSTRY_TYPES } from './company.constant';

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL LINKS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface ICompanySocialLinks {
  linkedin?: string | undefined;
  facebook?: string | undefined;
  twitter?: string | undefined;
  instagram?: string | undefined;
  youtube?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT PERSON INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface IContactPerson {
  name: string;
  designation: string;
  email: string;
  phone?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVAL HISTORY INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface IApprovalHistory {
  status: keyof typeof COMPANY_STATUS;
  changedBy: Types.ObjectId;
  changedAt: Date;
  reason?: string | undefined;
  notes?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPANY INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface ICompany {
  _id?: Types.ObjectId | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // USER REFERENCE (name, email, phone come from populated User)
  // ═══════════════════════════════════════════════════════════════════════════
  userId: Types.ObjectId;                    // User who registered this company
  slug: string;                              // URL-friendly name (from User.name)
  registrationNumber?: string | undefined;   // Business registration number
  taxId?: string | undefined;                // Tax identification number
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPANY DETAILS
  // ═══════════════════════════════════════════════════════════════════════════
  description?: string | undefined;
  industry: (typeof INDUSTRY_TYPES)[number];
  companySize: (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE];
  foundedYear?: number | undefined;
  website?: string | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BRANDING
  // ═══════════════════════════════════════════════════════════════════════════
  logo?: string | undefined;
  coverImage?: string | undefined;
  tagline?: string | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LOCATION
  // ═══════════════════════════════════════════════════════════════════════════
  address?: string | undefined;
  city: string;
  state?: string | undefined;
  country: string;
  postalCode?: string | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTACT PERSON
  // ═══════════════════════════════════════════════════════════════════════════
  contactPerson?: IContactPerson | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL LINKS
  // ═══════════════════════════════════════════════════════════════════════════
  socialLinks?: ICompanySocialLinks | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVAL STATUS
  // ═══════════════════════════════════════════════════════════════════════════
  status: keyof typeof COMPANY_STATUS;
  approvedBy?: Types.ObjectId | undefined;
  approvedAt?: Date | undefined;
  rejectionReason?: string | undefined;
  approvalHistory?: IApprovalHistory[] | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════
  totalJobsPosted?: number | undefined;
  activeJobs?: number | undefined;
  totalApplicationsReceived?: number | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS & FLAGS
  // ═══════════════════════════════════════════════════════════════════════════
  isVerified?: boolean | undefined;
  isPremium?: boolean | undefined;
  premiumExpiresAt?: Date | undefined;
  jobPostLimit?: number | undefined;           // Max jobs allowed (based on plan)
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENTS (For verification)
  // ═══════════════════════════════════════════════════════════════════════════
  tradeLicenseUrl?: string | undefined;
  taxCertificateUrl?: string | undefined;
  otherDocuments?: string[] | undefined;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIMESTAMPS
  // ═══════════════════════════════════════════════════════════════════════════
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY MODEL INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface ICompanyModel extends Model<ICompany> {
  isCompanyExistsBySlug(slug: string): Promise<ICompany | null>;
  isCompanyExistsByUserId(userId: Types.ObjectId): Promise<ICompany | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY REGISTRATION INPUT
// ─────────────────────────────────────────────────────────────────────────────

export interface ICompanyRegistrationInput {
  // User info (will create user account) - also used as Company contact
  userName: string;           // Company Name
  userEmail: string;          // Company Email
  userPassword: string;
  userPhone?: string | undefined;  // Company Phone
  
  // Company specific info
  industry: (typeof INDUSTRY_TYPES)[number];
  companySize: (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE];
  city: string;
  country: string;
  website?: string | undefined;
  description?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY UPDATE INPUT
// ─────────────────────────────────────────────────────────────────────────────

export interface ICompanyUpdateInput {
  // NOTE: To update name, email, phone - update User model, not Company
  description?: string | undefined;
  industry?: (typeof INDUSTRY_TYPES)[number] | undefined;
  companySize?: (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE] | undefined;
  foundedYear?: number | undefined;
  website?: string | undefined;
  logo?: string | undefined;
  coverImage?: string | undefined;
  tagline?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  postalCode?: string | undefined;
  contactPerson?: IContactPerson | undefined;
  socialLinks?: ICompanySocialLinks | undefined;
  tradeLicenseUrl?: string | undefined;
  taxCertificateUrl?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN APPROVAL INPUT
// ─────────────────────────────────────────────────────────────────────────────

export interface ICompanyApprovalInput {
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  reason?: string | undefined;
  notes?: string | undefined;
}
