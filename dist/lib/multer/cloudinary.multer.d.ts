import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request, Response, NextFunction } from 'express';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLOUDINARY UPLOAD UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Reusable Cloudinary upload system for CADDCORE Job Portal.
 *
 * USAGE EXAMPLES:
 *
 * 1. Pre-configured middlewares:
 *    import { uploadProfilePhoto, uploadJobLogo, uploadBlogImage } from './cloudinary.multer';
 *    router.post('/upload', uploadProfilePhoto, controller);
 *
 * 2. Custom upload:
 *    const customUpload = createUploadMiddleware({
 *      folder: 'custom-folder',
 *      maxFileSize: 3 * 1024 * 1024,
 *      fieldName: 'customFile'
 *    });
 *
 * 3. Multiple files:
 *    const multiUpload = createMultiFieldUpload([
 *      { name: 'profilePhoto', maxCount: 1 },
 *      { name: 'documents', maxCount: 5 }
 *    ], { folder: 'user-files' });
 */
interface CloudinaryStorageOptions {
    folder: string;
    allowedFormats?: string[];
    maxWidth?: number;
    maxHeight?: number;
    quality?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
}
interface UploadMiddlewareOptions extends CloudinaryStorageOptions {
    maxFileSize?: number;
    fieldName?: string;
}
interface MultiFieldConfig {
    name: string;
    maxCount: number;
}
/**
 * Creates a Cloudinary storage instance with specified options
 */
export declare const createCloudinaryStorage: (options: CloudinaryStorageOptions) => CloudinaryStorage;
/**
 * Creates a single-file upload middleware
 */
export declare const createUploadMiddleware: (options: UploadMiddlewareOptions) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Creates a multi-field upload middleware
 */
export declare const createMultiFieldUpload: (fields: MultiFieldConfig[], options: CloudinaryStorageOptions) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** Profile photo upload - 2MB limit, 500x500 max */
export declare const uploadProfilePhoto: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** Company logo upload - 1MB limit, 300x300 max */
export declare const uploadJobLogo: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** Blog/event image upload - 5MB limit, 1200x800 max */
export declare const uploadBlogImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** CV/Document upload - 10MB limit */
export declare const uploadDocument: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** Banner image upload - 5MB limit, 1920x1080 max for high quality banners */
export declare const uploadCloudinaryBannerImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** User profile multi-file upload */
export declare const uploadUserProfileFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Multer error handling middleware
 * Use after any upload middleware: router.post('/upload', uploadMiddleware, handleUploadError, controller)
 */
export declare const handleUploadError: (error: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Extract Cloudinary URL from uploaded file
 */
export declare const getUploadedFileUrl: (file: Express.Multer.File | undefined) => string | null;
/**
 * Extract multiple Cloudinary URLs from uploaded files
 */
export declare const getUploadedFilesUrls: (files: {
    [fieldname: string]: Express.Multer.File[];
} | undefined) => Record<string, string | null>;
/**
 * Delete a file from Cloudinary by URL
 */
export declare const deleteFromCloudinary: (fileUrl: string) => Promise<boolean>;
export {};
//# sourceMappingURL=cloudinary.multer.d.ts.map