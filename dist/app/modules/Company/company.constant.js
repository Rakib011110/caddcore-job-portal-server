"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Constants for Company module including status, size, and industry types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyFilterableFields = exports.CompanySearchableFields = exports.INDUSTRY_TYPES = exports.COMPANY_SIZE = exports.COMPANY_STATUS = void 0;
// ─────────────────────────────────────────────────────────────────────────────
// COMPANY STATUS
// ─────────────────────────────────────────────────────────────────────────────
exports.COMPANY_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    SUSPENDED: 'SUSPENDED',
};
// ─────────────────────────────────────────────────────────────────────────────
// COMPANY SIZE
// ─────────────────────────────────────────────────────────────────────────────
exports.COMPANY_SIZE = {
    STARTUP: '1-10',
    SMALL: '11-50',
    MEDIUM: '51-200',
    LARGE: '201-500',
    ENTERPRISE: '500+',
};
// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRY TYPES
// ─────────────────────────────────────────────────────────────────────────────
exports.INDUSTRY_TYPES = [
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
];
// ─────────────────────────────────────────────────────────────────────────────
// SEARCHABLE FIELDS
// ─────────────────────────────────────────────────────────────────────────────
exports.CompanySearchableFields = [
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
exports.CompanyFilterableFields = [
    'status',
    'industry',
    'companySize',
    'city',
    'country',
    'isVerified',
    'isPremium',
];
//# sourceMappingURL=company.constant.js.map