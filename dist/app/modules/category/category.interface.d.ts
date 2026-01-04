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
    icon?: string;
    parent?: Types.ObjectId;
    isActive: boolean;
    order: number;
    jobCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
};
export type TCategoryWithSubcategories = TCategory & {
    subcategories?: TCategory[];
};
//# sourceMappingURL=category.interface.d.ts.map