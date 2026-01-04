import { Types } from 'mongoose';

/**
 * Job Category Interface
 * Supports hierarchical categories with parent-child relationship
 */
export type TCategory = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string; // Icon name or URL
  parent?: Types.ObjectId; // Reference to parent category (null for main categories)
  isActive: boolean;
  order: number; // For sorting categories
  jobCount?: number; // Virtual field for number of jobs
  createdAt?: Date;
  updatedAt?: Date;
};

// For API responses with subcategories populated
export type TCategoryWithSubcategories = TCategory & {
  subcategories?: TCategory[];
};
