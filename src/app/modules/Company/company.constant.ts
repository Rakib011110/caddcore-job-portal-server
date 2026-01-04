/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Constants for Company module including status, size, and industry types.
 */

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY STATUS
// ─────────────────────────────────────────────────────────────────────────────

export const COMPANY_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type CompanyStatusType = keyof typeof COMPANY_STATUS;

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY SIZE
// ─────────────────────────────────────────────────────────────────────────────

export const COMPANY_SIZE = {
  STARTUP: '1-10',
  SMALL: '11-50',
  MEDIUM: '51-200',
  LARGE: '201-500',
  ENTERPRISE: '500+',
} as const;

export type CompanySizeType = (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE];

// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const INDUSTRY_TYPES = [
  'Information Technology',
  'Software Development',
  'Finance & Banking',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail & E-commerce',
  'Telecommunications',
  'Media & Entertainment',
  'Real Estate',
  'Construction',
  'Transportation & Logistics',
  'Hospitality & Tourism',
  'Agriculture',
  'Energy & Utilities',
  'Government',
  'Non-Profit',
  'Consulting',
  'Legal Services',
  'Marketing & Advertising',
  'Human Resources',
  'Other',
] as const;

export type IndustryType = (typeof INDUSTRY_TYPES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// SEARCHABLE FIELDS
// ─────────────────────────────────────────────────────────────────────────────

export const CompanySearchableFields = [
  'name',
  'email',
  'phone',
  'industry',
  'city',
  'country',
  'status',
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY FILTERABLE FIELDS
// ─────────────────────────────────────────────────────────────────────────────

export const CompanyFilterableFields = [
  'status',
  'industry',
  'companySize',
  'city',
  'country',
  'isVerified',
  'isPremium',
];
