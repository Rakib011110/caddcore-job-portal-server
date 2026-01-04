import { Request, Response } from "express";
/**
 * Category Controller
 * Handles HTTP requests for category management
 */
export declare const createCategory: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getAllCategories: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getAllCategoriesFlat: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getMainCategories: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getSubcategories: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getCategoryById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getCategoryBySlug: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const updateCategory: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const deleteCategory: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getCategoriesWithJobCount: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const toggleCategoryStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
//# sourceMappingURL=category.controller.d.ts.map