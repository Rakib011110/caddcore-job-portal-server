/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY INTERFACE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * TypeScript interfaces for Company module.
 */
import { Model, Types } from 'mongoose';
import { COMPANY_STATUS, COMPANY_SIZE, INDUSTRY_TYPES } from './company.constant';
export interface ICompanySocialLinks {
    linkedin?: string | undefined;
    facebook?: string | undefined;
    twitter?: string | undefined;
    instagram?: string | undefined;
    youtube?: string | undefined;
}
export interface IContactPerson {
    name: string;
    designation: string;
    email: string;
    phone?: string | undefined;
}
export interface IApprovalHistory {
    status: keyof typeof COMPANY_STATUS;
    changedBy: Types.ObjectId;
    changedAt: Date;
    reason?: string | undefined;
    notes?: string | undefined;
}
export interface ICompany {
    _id?: Types.ObjectId | undefined;
    userId: Types.ObjectId;
    slug: string;
    registrationNumber?: string | undefined;
    taxId?: string | undefined;
    description?: string | undefined;
    industry: (typeof INDUSTRY_TYPES)[number];
    companySize: (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE];
    foundedYear?: number | undefined;
    website?: string | undefined;
    logo?: string | undefined;
    coverImage?: string | undefined;
    tagline?: string | undefined;
    address?: string | undefined;
    city: string;
    state?: string | undefined;
    country: string;
    postalCode?: string | undefined;
    contactPerson?: IContactPerson | undefined;
    socialLinks?: ICompanySocialLinks | undefined;
    status: keyof typeof COMPANY_STATUS;
    approvedBy?: Types.ObjectId | undefined;
    approvedAt?: Date | undefined;
    rejectionReason?: string | undefined;
    approvalHistory?: IApprovalHistory[] | undefined;
    totalJobsPosted?: number | undefined;
    activeJobs?: number | undefined;
    totalApplicationsReceived?: number | undefined;
    isVerified?: boolean | undefined;
    isPremium?: boolean | undefined;
    premiumExpiresAt?: Date | undefined;
    jobPostLimit?: number | undefined;
    tradeLicenseUrl?: string | undefined;
    taxCertificateUrl?: string | undefined;
    otherDocuments?: string[] | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
export interface ICompanyModel extends Model<ICompany> {
    isCompanyExistsBySlug(slug: string): Promise<ICompany | null>;
    isCompanyExistsByUserId(userId: Types.ObjectId): Promise<ICompany | null>;
}
export interface ICompanyRegistrationInput {
    userName: string;
    userEmail: string;
    userPassword: string;
    userPhone?: string | undefined;
    industry: (typeof INDUSTRY_TYPES)[number];
    companySize: (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE];
    city: string;
    country: string;
    website?: string | undefined;
    description?: string | undefined;
}
export interface ICompanyUpdateInput {
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
export interface ICompanyApprovalInput {
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    reason?: string | undefined;
    notes?: string | undefined;
}
//# sourceMappingURL=company.interface.d.ts.map