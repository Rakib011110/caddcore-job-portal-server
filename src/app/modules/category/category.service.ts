import { TCategory } from "./category.interface";
import { Category } from "./category.model";
import { Job } from "../jobs/job.model";

/**
 * Category Service
 * Business logic for category management
 */

// Create a new category
export const createCategory = async (payload: TCategory) => {
  // Generate slug if not provided
  if (!payload.slug) {
    payload.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  const result = await Category.create(payload);
  return result;
};

// Get all categories (main categories with subcategories)
export const getAllCategories = async (includeInactive = false) => {
  const query: any = { parent: null }; // Only main categories
  if (!includeInactive) {
    query.isActive = true;
  }
  
  const categories = await Category.find(query)
    .populate({
      path: 'subcategories',
      match: includeInactive ? {} : { isActive: true },
      options: { sort: { order: 1, name: 1 } }
    })
    .sort({ order: 1, name: 1 });
  
  return categories;
};

// Get all categories flat (for dropdowns)
export const getAllCategoriesFlat = async (includeInactive = false) => {
  const query: any = {};
  if (!includeInactive) {
    query.isActive = true;
  }
  
  const categories = await Category.find(query)
    .sort({ order: 1, name: 1 });
  
  return categories;
};

// Get main categories only
export const getMainCategories = async (includeInactive = false) => {
  const query: any = { parent: null };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  const categories = await Category.find(query)
    .sort({ order: 1, name: 1 });
  
  return categories;
};

// Get subcategories by parent ID
export const getSubcategories = async (parentId: string, includeInactive = false) => {
  const query: any = { parent: parentId };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  const subcategories = await Category.find(query)
    .sort({ order: 1, name: 1 });
  
  return subcategories;
};

// Get single category by ID
export const getCategoryById = async (id: string) => {
  const category = await Category.findById(id)
    .populate({
      path: 'subcategories',
      options: { sort: { order: 1, name: 1 } }
    })
    .populate('parent');
  
  return category;
};

// Get category by slug
export const getCategoryBySlug = async (slug: string) => {
  const category = await Category.findOne({ slug })
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      options: { sort: { order: 1, name: 1 } }
    })
    .populate('parent');
  
  return category;
};

// Update category
export const updateCategory = async (id: string, payload: Partial<TCategory>) => {
  // Update slug if name changed and slug not provided
  if (payload.name && !payload.slug) {
    payload.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  const result = await Category.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  );
  
  return result;
};

// Delete category
export const deleteCategory = async (id: string) => {
  // Check if category has subcategories
  const subcategoriesCount = await Category.countDocuments({ parent: id });
  if (subcategoriesCount > 0) {
    throw new Error("Cannot delete category with subcategories. Delete subcategories first.");
  }
  
  // Check if category has jobs
  const jobsCount = await Job.countDocuments({ 
    $or: [{ categoryRef: id }, { subcategoryRef: id }] 
  });
  if (jobsCount > 0) {
    throw new Error(`Cannot delete category. ${jobsCount} jobs are using this category.`);
  }
  
  const result = await Category.findByIdAndDelete(id);
  return result;
};

// Get categories with job count
export const getCategoriesWithJobCount = async () => {
  const categories = await Category.aggregate([
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

// Toggle category active status
export const toggleCategoryStatus = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error("Category not found");
  }
  
  category.isActive = !category.isActive;
  await category.save();
  
  // If disabling a parent category, also disable all subcategories
  if (!category.isActive && !category.parent) {
    await Category.updateMany(
      { parent: id },
      { isActive: false }
    );
  }
  
  return category;
};
