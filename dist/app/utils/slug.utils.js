"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSlug = exports.generateSlug = void 0;
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .substring(0, 100); // Limit length
};
exports.generateSlug = generateSlug;
const isValidSlug = (slug) => {
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
};
exports.isValidSlug = isValidSlug;
//# sourceMappingURL=slug.utils.js.map