/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPANY CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Constants for Company module including status, size, and industry types.
 */
export declare const COMPANY_STATUS: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly SUSPENDED: "SUSPENDED";
};
export type CompanyStatusType = keyof typeof COMPANY_STATUS;
export declare const COMPANY_SIZE: {
    readonly STARTUP: "1-10";
    readonly SMALL: "11-50";
    readonly MEDIUM: "51-200";
    readonly LARGE: "201-500";
    readonly ENTERPRISE: "500+";
};
export type CompanySizeType = (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE];
export declare const INDUSTRY_TYPES: readonly ["Information Technology", "Software Development", "Finance & Banking", "Healthcare", "Education", "Manufacturing", "Retail & E-commerce", "Telecommunications", "Media & Entertainment", "Real Estate", "Construction", "Transportation & Logistics", "Hospitality & Tourism", "Agriculture", "Energy & Utilities", "Government", "Non-Profit", "Consulting", "Legal Services", "Marketing & Advertising", "Human Resources", "Other"];
export type IndustryType = (typeof INDUSTRY_TYPES)[number];
export declare const CompanySearchableFields: string[];
export declare const CompanyFilterableFields: string[];
//# sourceMappingURL=company.constant.d.ts.map