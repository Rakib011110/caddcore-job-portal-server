/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CADDCORE VERIFICATION CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export interface ICaddcoreCourse {
    id: string;
    name: string;
    category: string;
    duration?: string;
}
export declare const CADDCORE_COURSES: ICaddcoreCourse[];
export declare const COURSE_CATEGORIES: readonly ["CAD", "BIM", "3D Modeling", "3D Visualization", "Visualization", "Civil", "Structural", "Project Management", "Quantity Surveying", "MEP", "GIS"];
export declare const BADGE_TYPES: {
    readonly BRONZE: "bronze";
    readonly SILVER: "silver";
    readonly GOLD: "gold";
    readonly PLATINUM: "platinum";
};
export declare const BADGE_PRIORITY_SCORES: {
    readonly bronze: 20;
    readonly silver: 40;
    readonly gold: 60;
    readonly platinum: 80;
};
export declare const BADGE_LABELS: {
    readonly bronze: "CADDCORE Certified - Course Complete";
    readonly silver: "CADDCORE Certified - Course + On-Job Training";
    readonly gold: "CADDCORE Certified - Full Program";
    readonly platinum: "CADDCORE Elite - Placed Graduate";
};
export declare const BADGE_DESCRIPTIONS: {
    readonly bronze: "Completed CADDCORE course program";
    readonly silver: "Completed course and on-job training";
    readonly gold: "Completed course, on-job training, and internship";
    readonly platinum: "Full program graduate placed through CADDCORE";
};
export declare const VERIFICATION_STATUS: {
    readonly NOT_APPLIED: "not_applied";
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
};
export declare const ENROLLMENT_YEARS: number[];
//# sourceMappingURL=verification.constant.d.ts.map