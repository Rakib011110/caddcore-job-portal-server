import express from "express";
import * as CategoryController from "./category.controller";
import auth, { requireAdmin } from "../../middlewares/auth";

const router = express.Router();

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
router.post("/", requireAdmin, CategoryController.createCategory);

// Update category (Admin only)
router.patch("/:id", requireAdmin, CategoryController.updateCategory);

// Delete category (Admin only)
router.delete("/:id", requireAdmin, CategoryController.deleteCategory);

// Toggle category status (Admin only)
router.patch("/:id/toggle-status", requireAdmin, CategoryController.toggleCategoryStatus);

export const CategoryRoutes = router;
