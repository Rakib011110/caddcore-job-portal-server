"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCategoryStatus = exports.getCategoriesWithJobCount = exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getSubcategories = exports.getMainCategories = exports.getAllCategoriesFlat = exports.getAllCategories = exports.createCategory = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const CategoryService = __importStar(require("./category.service"));
/**
 * Category Controller
 * Handles HTTP requests for category management
 */
// Create a new category
exports.createCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await CategoryService.createCategory(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Category created successfully",
        data: result,
    });
});
// Get all categories with subcategories (hierarchical)
exports.getAllCategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true';
    const result = await CategoryService.getAllCategories(includeInactive);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Categories fetched successfully",
        data: result,
    });
});
// Get all categories flat (for dropdowns)
exports.getAllCategoriesFlat = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true';
    const result = await CategoryService.getAllCategoriesFlat(includeInactive);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Categories fetched successfully",
        data: result,
    });
});
// Get main categories only
exports.getMainCategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true';
    const result = await CategoryService.getMainCategories(includeInactive);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Main categories fetched successfully",
        data: result,
    });
});
// Get subcategories by parent ID
exports.getSubcategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const parentId = req.params.parentId;
    const includeInactive = req.query.includeInactive === 'true';
    const result = await CategoryService.getSubcategories(parentId, includeInactive);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Subcategories fetched successfully",
        data: result,
    });
});
// Get single category by ID
exports.getCategoryById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const result = await CategoryService.getCategoryById(id);
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Category not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Category fetched successfully",
        data: result,
    });
});
// Get category by slug
exports.getCategoryBySlug = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const slug = req.params.slug;
    const result = await CategoryService.getCategoryBySlug(slug);
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Category not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Category fetched successfully",
        data: result,
    });
});
// Update category
exports.updateCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const result = await CategoryService.updateCategory(id, req.body);
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Category not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Category updated successfully",
        data: result,
    });
});
// Delete category
exports.deleteCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    try {
        const result = await CategoryService.deleteCategory(id);
        if (!result) {
            return (0, sendResponse_1.default)(res, {
                statusCode: 404,
                success: false,
                message: "Category not found",
                data: null,
            });
        }
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Category deleted successfully",
            data: result,
        });
    }
    catch (error) {
        (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: error.message || "Failed to delete category",
            data: null,
        });
    }
});
// Get categories with job count
exports.getCategoriesWithJobCount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await CategoryService.getCategoriesWithJobCount();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Categories with job count fetched successfully",
        data: result,
    });
});
// Toggle category status
exports.toggleCategoryStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    try {
        const result = await CategoryService.toggleCategoryStatus(id);
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: `Category ${result.isActive ? 'activated' : 'deactivated'} successfully`,
            data: result,
        });
    }
    catch (error) {
        (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: error.message || "Failed to toggle category status",
            data: null,
        });
    }
});
//# sourceMappingURL=category.controller.js.map