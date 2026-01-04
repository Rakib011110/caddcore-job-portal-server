"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.getUploadedFilesUrls = exports.getUploadedFileUrl = exports.handleUploadError = exports.uploadUserProfileFiles = exports.uploadCloudinaryBannerImage = exports.uploadDocument = exports.uploadBlogImage = exports.uploadJobLogo = exports.uploadProfilePhoto = exports.createMultiFieldUpload = exports.createUploadMiddleware = exports.createCloudinaryStorage = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
// ─────────────────────────────────────────────────────────────────────────────
// STORAGE FACTORY
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Creates a Cloudinary storage instance with specified options
 */
const createCloudinaryStorage = (options) => {
    const { folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'], maxWidth = 1920, maxHeight = 1080, quality = 'auto', resourceType = 'image' } = options;
    return new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.default,
        params: {
            folder: `caddcore-job-portal/${folder}`,
            allowed_formats: allowedFormats,
            resource_type: resourceType,
            transformation: resourceType === 'image' ? [
                { width: maxWidth, height: maxHeight, crop: 'limit' },
                { quality }
            ] : undefined,
            public_id: (req, file) => {
                const timestamp = Date.now();
                const userId = req.user?.id || req.user?._id || 'anonymous';
                const prefix = folder.split('/').pop() || 'file';
                return `${prefix}-${userId}-${timestamp}`;
            },
        },
    });
};
exports.createCloudinaryStorage = createCloudinaryStorage;
// ─────────────────────────────────────────────────────────────────────────────
// FILE FILTERS
// ─────────────────────────────────────────────────────────────────────────────
/** Filter for image files only */
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'), false);
    }
};
/** Filter for documents (images, PDFs, Word docs) */
const documentFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Allowed: images, PDF, DOC, DOCX'), false);
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE FACTORIES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Creates a single-file upload middleware
 */
const createUploadMiddleware = (options) => {
    const { folder, maxFileSize = 5 * 1024 * 1024, // 5MB default
    fieldName = 'file', allowedFormats, maxWidth, maxHeight, quality, resourceType } = options;
    const storageOptions = { folder };
    if (allowedFormats)
        storageOptions.allowedFormats = allowedFormats;
    if (maxWidth)
        storageOptions.maxWidth = maxWidth;
    if (maxHeight)
        storageOptions.maxHeight = maxHeight;
    if (quality)
        storageOptions.quality = quality;
    if (resourceType)
        storageOptions.resourceType = resourceType;
    const storage = (0, exports.createCloudinaryStorage)(storageOptions);
    const isDocumentUpload = allowedFormats?.some(f => ['pdf', 'doc', 'docx'].includes(f));
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: maxFileSize },
        fileFilter: isDocumentUpload ? documentFilter : imageFilter,
    }).single(fieldName);
};
exports.createUploadMiddleware = createUploadMiddleware;
/**
 * Creates a multi-field upload middleware
 */
const createMultiFieldUpload = (fields, options) => {
    const storage = (0, exports.createCloudinaryStorage)(options);
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: documentFilter,
    }).fields(fields);
};
exports.createMultiFieldUpload = createMultiFieldUpload;
// ─────────────────────────────────────────────────────────────────────────────
// PRE-CONFIGURED UPLOAD MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────
/** Profile photo upload - 2MB limit, 500x500 max */
exports.uploadProfilePhoto = (0, exports.createUploadMiddleware)({
    folder: 'profile-photos',
    maxFileSize: 2 * 1024 * 1024,
    maxWidth: 500,
    maxHeight: 500,
    fieldName: 'profilePhoto'
});
/** Company logo upload - 1MB limit, 300x300 max */
exports.uploadJobLogo = (0, exports.createUploadMiddleware)({
    folder: 'job-logos',
    maxFileSize: 1 * 1024 * 1024,
    maxWidth: 300,
    maxHeight: 300,
    fieldName: 'companyLogo'
});
/** Blog/event image upload - 5MB limit, 1200x800 max */
exports.uploadBlogImage = (0, exports.createUploadMiddleware)({
    folder: 'blog-images',
    maxFileSize: 5 * 1024 * 1024,
    maxWidth: 1200,
    maxHeight: 800,
    quality: 'good',
    fieldName: 'blogImage'
});
/** CV/Document upload - 10MB limit */
exports.uploadDocument = (0, exports.createUploadMiddleware)({
    folder: 'documents',
    maxFileSize: 10 * 1024 * 1024,
    allowedFormats: ['pdf', 'doc', 'docx'],
    fieldName: 'document',
    resourceType: 'raw'
});
/** Banner image upload - 5MB limit, 1920x1080 max for high quality banners */
exports.uploadCloudinaryBannerImage = (0, exports.createUploadMiddleware)({
    folder: 'banners',
    maxFileSize: 5 * 1024 * 1024,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 'auto:best',
    fieldName: 'image'
});
/** User profile multi-file upload */
exports.uploadUserProfileFiles = (0, exports.createMultiFieldUpload)([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'cvFile', maxCount: 1 },
    { name: 'experienceCertificateFile', maxCount: 1 },
    { name: 'universityCertificateFile', maxCount: 1 },
    { name: 'affiliationDocumentFile', maxCount: 1 }
], {
    folder: 'profile-files',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    maxWidth: 800,
    maxHeight: 800
});
// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Multer error handling middleware
 * Use after any upload middleware: router.post('/upload', uploadMiddleware, handleUploadError, controller)
 */
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds the allowed limit',
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${error.message}`,
        });
    }
    if (error.message?.includes('file type') || error.message?.includes('image files')) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Extract Cloudinary URL from uploaded file
 */
const getUploadedFileUrl = (file) => {
    if (!file)
        return null;
    return file.path || null;
};
exports.getUploadedFileUrl = getUploadedFileUrl;
/**
 * Extract multiple Cloudinary URLs from uploaded files
 */
const getUploadedFilesUrls = (files) => {
    if (!files)
        return {};
    const urls = {};
    Object.entries(files).forEach(([fieldname, fileArray]) => {
        urls[fieldname] = fileArray[0] ? fileArray[0].path : null;
    });
    return urls;
};
exports.getUploadedFilesUrls = getUploadedFilesUrls;
/**
 * Delete a file from Cloudinary by URL
 */
const deleteFromCloudinary = async (fileUrl) => {
    try {
        // Extract public_id from URL
        const urlParts = fileUrl.split('/');
        const filenameWithExt = urlParts[urlParts.length - 1] || '';
        const publicId = filenameWithExt.split('.')[0] || '';
        const folder = urlParts[urlParts.length - 2] || '';
        await cloudinary_1.default.uploader.destroy(`caddcore-job-portal/${folder}/${publicId}`);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinary.multer.js.map