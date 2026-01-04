"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CADDCORE VERIFICATION CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENROLLMENT_YEARS = exports.VERIFICATION_STATUS = exports.BADGE_DESCRIPTIONS = exports.BADGE_LABELS = exports.BADGE_PRIORITY_SCORES = exports.BADGE_TYPES = exports.COURSE_CATEGORIES = exports.CADDCORE_COURSES = void 0;
exports.CADDCORE_COURSES = [
    // CAD Courses
    { id: 'AC2D', name: 'AutoCAD 2D', category: 'CAD', duration: '3 months' },
    { id: 'AC3D', name: 'AutoCAD 3D', category: 'CAD', duration: '2 months' },
    { id: 'SOLIDWORKS', name: 'SolidWorks', category: 'CAD', duration: '4 months' },
    { id: 'CATIA', name: 'CATIA', category: 'CAD', duration: '4 months' },
    { id: 'INVENTOR', name: 'Autodesk Inventor', category: 'CAD', duration: '3 months' },
    // BIM Courses
    { id: 'REVIT-ARCH', name: 'Revit Architecture', category: 'BIM', duration: '4 months' },
    { id: 'REVIT-STR', name: 'Revit Structure', category: 'BIM', duration: '3 months' },
    { id: 'REVIT-MEP', name: 'Revit MEP', category: 'BIM', duration: '4 months' },
    { id: 'NAVISWORKS', name: 'Navisworks', category: 'BIM', duration: '2 months' },
    // 3D & Visualization Courses
    { id: 'SKETCHUP', name: 'SketchUp', category: '3D Modeling', duration: '2 months' },
    { id: '3DSMAX', name: '3DS Max', category: '3D Visualization', duration: '4 months' },
    { id: 'LUMION', name: 'Lumion', category: 'Visualization', duration: '2 months' },
    { id: 'VRAY', name: 'V-Ray', category: 'Visualization', duration: '2 months' },
    { id: 'ENSCAPE', name: 'Enscape', category: 'Visualization', duration: '1 month' },
    // Civil & Structural Courses
    { id: 'CIVIL3D', name: 'Civil 3D', category: 'Civil', duration: '4 months' },
    { id: 'ETABS', name: 'ETABS', category: 'Structural', duration: '3 months' },
    { id: 'STAAD', name: 'STAAD Pro', category: 'Structural', duration: '3 months' },
    { id: 'SAP2000', name: 'SAP2000', category: 'Structural', duration: '3 months' },
    { id: 'SAFE', name: 'SAFE', category: 'Structural', duration: '2 months' },
    // Project Management Courses
    { id: 'PRIMAVERA', name: 'Primavera P6', category: 'Project Management', duration: '3 months' },
    { id: 'MS-PROJECT', name: 'MS Project', category: 'Project Management', duration: '2 months' },
    // Estimation & Quantity Surveying
    { id: 'ESTIMATION', name: 'Estimation & Costing', category: 'Quantity Surveying', duration: '3 months' },
    { id: 'PLANSWIFT', name: 'PlanSwift', category: 'Quantity Surveying', duration: '2 months' },
    // MEP Courses
    { id: 'PLUMBING', name: 'Plumbing Design', category: 'MEP', duration: '2 months' },
    { id: 'HVAC', name: 'HVAC Design', category: 'MEP', duration: '3 months' },
    { id: 'ELECTRICAL', name: 'Electrical Design', category: 'MEP', duration: '3 months' },
    // GIS & Survey
    { id: 'ARCGIS', name: 'ArcGIS', category: 'GIS', duration: '3 months' },
    { id: 'QGIS', name: 'QGIS', category: 'GIS', duration: '2 months' },
];
// ─────────────────────────────────────────────────────────────────────────────
// COURSE CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
exports.COURSE_CATEGORIES = [
    'CAD',
    'BIM',
    '3D Modeling',
    '3D Visualization',
    'Visualization',
    'Civil',
    'Structural',
    'Project Management',
    'Quantity Surveying',
    'MEP',
    'GIS',
];
// ─────────────────────────────────────────────────────────────────────────────
// BADGE TYPES & PRIORITY SCORES
// ─────────────────────────────────────────────────────────────────────────────
exports.BADGE_TYPES = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum',
};
exports.BADGE_PRIORITY_SCORES = {
    bronze: 20,
    silver: 40,
    gold: 60,
    platinum: 80,
};
exports.BADGE_LABELS = {
    bronze: 'CADDCORE Certified - Course Complete',
    silver: 'CADDCORE Certified - Course + On-Job Training',
    gold: 'CADDCORE Certified - Full Program',
    platinum: 'CADDCORE Elite - Placed Graduate',
};
exports.BADGE_DESCRIPTIONS = {
    bronze: 'Completed CADDCORE course program',
    silver: 'Completed course and on-job training',
    gold: 'Completed course, on-job training, and internship',
    platinum: 'Full program graduate placed through CADDCORE',
};
// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION STATUS
// ─────────────────────────────────────────────────────────────────────────────
exports.VERIFICATION_STATUS = {
    NOT_APPLIED: 'not_applied',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
// ─────────────────────────────────────────────────────────────────────────────
// BATCH YEARS (for dropdown)
// ─────────────────────────────────────────────────────────────────────────────
exports.ENROLLMENT_YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);
//# sourceMappingURL=verification.constant.js.map