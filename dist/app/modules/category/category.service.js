"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCategoryStatus = exports.getCategoriesWithJobCount = exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getSubcategories = exports.getMainCategories = exports.getAllCategoriesFlat = exports.getAllCategories = exports.createCategory = void 0;
const category_model_1 = require("./category.model");
const job_model_1 = require("../jobs/job.model");
/**
 * Category Service
 * Business logic for category management
 */
// Create a new category
const createCategory = async (payload) => {
    // Generate slug if not provided
    if (!payload.slug) {
        payload.slug = payload.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    const result = await category_model_1.Category.create(payload);
    return result;
};
exports.createCategory = createCategory;
// Get all categories (main categories with subcategories)
const getAllCategories = async (includeInactive = false) => {
    const query = { parent: null }; // Only main categories
    if (!includeInactive) {
        query.isActive = true;
    }
    const categories = await category_model_1.Category.find(query)
        .populate({
        path: 'subcategories',
        match: includeInactive ? {} : { isActive: true },
        options: { sort: { order: 1, name: 1 } }
    })
        .sort({ order: 1, name: 1 });
    return categories;
};
exports.getAllCategories = getAllCategories;
// Get all categories flat (for dropdowns)
const getAllCategoriesFlat = async (includeInactive = false) => {
    const query = {};
    if (!includeInactive) {
        query.isActive = true;
    }
    const categories = await category_model_1.Category.find(query)
        .sort({ order: 1, name: 1 });
    return categories;
};
exports.getAllCategoriesFlat = getAllCategoriesFlat;
// Get main categories only
const getMainCategories = async (includeInactive = false) => {
    const query = { parent: null };
    if (!includeInactive) {
        query.isActive = true;
    }
    const categories = await category_model_1.Category.find(query)
        .sort({ order: 1, name: 1 });
    return categories;
};
exports.getMainCategories = getMainCategories;
// Get subcategories by parent ID
const getSubcategories = async (parentId, includeInactive = false) => {
    const query = { parent: parentId };
    if (!includeInactive) {
        query.isActive = true;
    }
    const subcategories = await category_model_1.Category.find(query)
        .sort({ order: 1, name: 1 });
    return subcategories;
};
exports.getSubcategories = getSubcategories;
// Get single category by ID
const getCategoryById = async (id) => {
    const category = await category_model_1.Category.findById(id)
        .populate({
        path: 'subcategories',
        options: { sort: { order: 1, name: 1 } }
    })
        .populate('parent');
    return category;
};
exports.getCategoryById = getCategoryById;
// Get category by slug
const getCategoryBySlug = async (slug) => {
    const category = await category_model_1.Category.findOne({ slug })
        .populate({
        path: 'subcategories',
        match: { isActive: true },
        options: { sort: { order: 1, name: 1 } }
    })
        .populate('parent');
    return category;
};
exports.getCategoryBySlug = getCategoryBySlug;
// Update category
const updateCategory = async (id, payload) => {
    // Update slug if name changed and slug not provided
    if (payload.name && !payload.slug) {
        payload.slug = payload.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    const result = await category_model_1.Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    return result;
};
exports.updateCategory = updateCategory;
// Delete category
const deleteCategory = async (id) => {
    // Check if category has subcategories
    const subcategoriesCount = await category_model_1.Category.countDocuments({ parent: id });
    if (subcategoriesCount > 0) {
        throw new Error("Cannot delete category with subcategories. Delete subcategories first.");
    }
    // Check if category has jobs
    const jobsCount = await job_model_1.Job.countDocuments({
        $or: [{ categoryRef: id }, { subcategoryRef: id }]
    });
    if (jobsCount > 0) {
        throw new Error(`Cannot delete category. ${jobsCount} jobs are using this category.`);
    }
    const result = await category_model_1.Category.findByIdAndDelete(id);
    return result;
};
exports.deleteCategory = deleteCategory;
// Get categories with job count
const getCategoriesWithJobCount = async () => {
    const categories = await category_model_1.Category.aggregate([
        { $match: { parent: null, isActive: true } },
        {
            $lookup: {
                from: 'jobs',
                localField: '_id',
                foreignField: 'categoryRef',
                as: 'jobs'
            }
        },
        {
            $lookup: {
                from: 'categories',
                let: { parentId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$parent', '$$parentId'] }, isActive: true } },
                    {
                        $lookup: {
                            from: 'jobs',
                            localField: '_id',
                            foreignField: 'subcategoryRef',
                            as: 'subJobs'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            slug: 1,
                            icon: 1,
                            order: 1,
                            jobCount: { $size: '$subJobs' }
                        }
                    }
                ],
                as: 'subcategories'
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                slug: 1,
                description: 1,
                icon: 1,
                order: 1,
                isActive: 1,
                jobCount: { $size: '$jobs' },
                subcategories: 1,
                totalJobCount: {
                    $add: [
                        { $size: '$jobs' },
                        { $sum: '$subcategories.jobCount' }
                    ]
                }
            }
        },
        { $sort: { order: 1, name: 1 } }
    ]);
    return categories;
};
exports.getCategoriesWithJobCount = getCategoriesWithJobCount;
// Toggle category active status
const toggleCategoryStatus = async (id) => {
    const category = await category_model_1.Category.findById(id);
    if (!category) {
        throw new Error("Category not found");
    }
    category.isActive = !category.isActive;
    await category.save();
    // If disabling a parent category, also disable all subcategories
    if (!category.isActive && !category.parent) {
        await category_model_1.Category.updateMany({ parent: id }, { isActive: false });
    }
    return category;
};
exports.toggleCategoryStatus = toggleCategoryStatus;
//# sourceMappingURL=category.service.js.map