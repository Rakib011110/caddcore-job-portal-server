import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import * as CategoryService from "./category.service";

/**
 * Category Controller
 * Handles HTTP requests for category management
 */

// Create a new category
export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

// Get all categories with subcategories (hierarchical)
export const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const result = await CategoryService.getAllCategories(includeInactive);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

// Get all categories flat (for dropdowns)
export const getAllCategoriesFlat = catchAsync(async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const result = await CategoryService.getAllCategoriesFlat(includeInactive);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

// Get main categories only
export const getMainCategories = catchAsync(async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const result = await CategoryService.getMainCategories(includeInactive);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Main categories fetched successfully",
    data: result,
  });
});

// Get subcategories by parent ID
export const getSubcategories = catchAsync(async (req: Request, res: Response) => {
  const parentId = req.params.parentId as string;
  const includeInactive = req.query.includeInactive === 'true';
  const result = await CategoryService.getSubcategories(parentId, includeInactive);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subcategories fetched successfully",
    data: result,
  });
});

// Get single category by ID
export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CategoryService.getCategoryById(id);
  
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Category not found",
      data: null,
    });
  }
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
});

// Get category by slug
export const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const result = await CategoryService.getCategoryBySlug(slug);
  
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Category not found",
      data: null,
    });
  }
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
});

// Update category
export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CategoryService.updateCategory(id, req.body);
  
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Category not found",
      data: null,
    });
  }
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

// Delete category
export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  try {
    const result = await CategoryService.deleteCategory(id);
    
    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Category not found",
        data: null,
      });
    }
    
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message || "Failed to delete category",
      data: null,
    });
  }
});

// Get categories with job count
export const getCategoriesWithJobCount = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoriesWithJobCount();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories with job count fetched successfully",
    data: result,
  });
});

// Toggle category status
export const toggleCategoryStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  try {
    const result = await CategoryService.toggleCategoryStatus(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Category ${result.isActive ? 'activated' : 'deactivated'} successfully`,
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message || "Failed to toggle category status",
      data: null,
    });
  }
});
