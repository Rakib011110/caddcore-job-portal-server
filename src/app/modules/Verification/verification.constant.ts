/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CADDCORE VERIFICATION CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// PREDEFINED CADDCORE COURSES
// ─────────────────────────────────────────────────────────────────────────────

export interface ICaddcoreCourse {
  id: string;
  name: string;
  category: string;
  duration?: string;
}

export const CADDCORE_COURSES: ICaddcoreCourse[] = [
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

export const COURSE_CATEGORIES = [
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
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// BADGE TYPES & PRIORITY SCORES
// ─────────────────────────────────────────────────────────────────────────────

export const BADGE_TYPES = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const;

export const BADGE_PRIORITY_SCORES = {
  bronze: 20,
  silver: 40,
  gold: 60,
  platinum: 80,
} as const;

export const BADGE_LABELS = {
  bronze: 'CADDCORE Certified - Course Complete',
  silver: 'CADDCORE Certified - Course + On-Job Training',
  gold: 'CADDCORE Certified - Full Program',
  platinum: 'CADDCORE Elite - Placed Graduate',
} as const;

export const BADGE_DESCRIPTIONS = {
  bronze: 'Completed CADDCORE course program',
  silver: 'Completed course and on-job training',
  gold: 'Completed course, on-job training, and internship',
  platinum: 'Full program graduate placed through CADDCORE',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION STATUS
// ─────────────────────────────────────────────────────────────────────────────

export const VERIFICATION_STATUS = {
  NOT_APPLIED: 'not_applied',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BATCH YEARS (for dropdown)
// ─────────────────────────────────────────────────────────────────────────────

export const ENROLLMENT_YEARS = Array.from(
  { length: 15 },
  (_, i) => new Date().getFullYear() - i
);
