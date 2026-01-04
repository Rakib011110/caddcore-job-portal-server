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
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const CategoryController = __importStar(require("./category.controller"));
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
/**
 * Category Routes
 * Manages job categories and subcategories
 */
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (No auth required)
// ─────────────────────────────────────────────────────────────────────────────
// Get all categories with subcategories (hierarchical)
router.get("/", CategoryController.getAllCategories);
// Get all categories flat (for dropdowns)
router.get("/flat", CategoryController.getAllCategoriesFlat);
// Get main categories only
router.get("/main", CategoryController.getMainCategories);
// Get categories with job count (for public display)
router.get("/with-job-count", CategoryController.getCategoriesWithJobCount);
// Get subcategories by parent ID
router.get("/subcategories/:parentId", CategoryController.getSubcategories);
// Get category by slug
router.get("/slug/:slug", CategoryController.getCategoryBySlug);
// Get category by ID
router.get("/:id", CategoryController.getCategoryById);
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES (Auth required)
// ─────────────────────────────────────────────────────────────────────────────
// Create a new category (Admin only)
router.post("/", auth_1.requireAdmin, CategoryController.createCategory);
// Update category (Admin only)
router.patch("/:id", auth_1.requireAdmin, CategoryController.updateCategory);
// Delete category (Admin only)
router.delete("/:id", auth_1.requireAdmin, CategoryController.deleteCategory);
// Toggle category status (Admin only)
router.patch("/:id/toggle-status", auth_1.requireAdmin, CategoryController.toggleCategoryStatus);
exports.CategoryRoutes = router;
//# sourceMappingURL=category.routes.js.map