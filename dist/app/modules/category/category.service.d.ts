import { TCategory } from "./category.interface";
/**
 * Category Service
 * Business logic for category management
 */
export declare const createCategory: (payload: TCategory) => Promise<import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
}>;
export declare const getAllCategories: (includeInactive?: boolean) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
})[]>;
export declare const getAllCategoriesFlat: (includeInactive?: boolean) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
})[]>;
export declare const getMainCategories: (includeInactive?: boolean) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
})[]>;
export declare const getSubcategories: (parentId: string, includeInactive?: boolean) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
})[]>;
export declare const getCategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare const getCategoryBySlug: (slug: string) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare const updateCategory: (id: string, payload: Partial<TCategory>) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare const deleteCategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare const getCategoriesWithJobCount: () => Promise<any[]>;
export declare const toggleCategoryStatus: (id: string) => Promise<import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & Required<{
    _id: string;
}> & {
    __v: number;
}>;
//# sourceMappingURL=category.service.d.ts.map