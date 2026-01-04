"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
/**
 * Category Schema
 * Supports hierarchical job categories with parent-child relationships
 */
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    icon: {
        type: String
    },
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        default: null // null means it's a main category
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual for subcategories
CategorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});
// Indexes for better query performance
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ order: 1 });
// Compound index for parent + active categories
CategorySchema.index({ parent: 1, isActive: 1 });
exports.Category = (0, mongoose_1.model)("Category", CategorySchema);
//# sourceMappingURL=category.model.js.map