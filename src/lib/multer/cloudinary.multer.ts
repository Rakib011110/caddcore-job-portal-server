import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';
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

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a Cloudinary storage instance with specified options
 */
export const createCloudinaryStorage = (options: CloudinaryStorageOptions) => {
  const {
    folder,
    allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 'auto',
    resourceType = 'image'
  } = options;

  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `caddcore-job-portal/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: resourceType,
      transformation: resourceType === 'image' ? [
        { width: maxWidth, height: maxHeight, crop: 'limit' },
        { quality }
      ] : undefined,
      public_id: (req: any, file: any) => {
        const timestamp = Date.now();
        const userId = req.user?.id || req.user?._id || 'anonymous';
        const prefix = folder.split('/').pop() || 'file';
        return `${prefix}-${userId}-${timestamp}`;
      },
    } as any,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// FILE FILTERS
// ─────────────────────────────────────────────────────────────────────────────

/** Filter for image files only */
const imageFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

/** Filter for documents (images, PDFs, Word docs) */
const documentFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: images, PDF, DOC, DOCX'), false);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE FACTORIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a single-file upload middleware
 */
export const createUploadMiddleware = (options: UploadMiddlewareOptions) => {
  const {
    folder,
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    fieldName = 'file',
    allowedFormats,
    maxWidth,
    maxHeight,
    quality,
    resourceType
  } = options;

  const storageOptions: CloudinaryStorageOptions = { folder };
  if (allowedFormats) storageOptions.allowedFormats = allowedFormats;
  if (maxWidth) storageOptions.maxWidth = maxWidth;
  if (maxHeight) storageOptions.maxHeight = maxHeight;
  if (quality) storageOptions.quality = quality;
  if (resourceType) storageOptions.resourceType = resourceType;

  const storage = createCloudinaryStorage(storageOptions);

  const isDocumentUpload = allowedFormats?.some(f => ['pdf', 'doc', 'docx'].includes(f));

  return multer({
    storage,
    limits: { fileSize: maxFileSize },
    fileFilter: isDocumentUpload ? documentFilter : imageFilter,
  }).single(fieldName);
};

/**
 * Creates a multi-field upload middleware
 */
export const createMultiFieldUpload = (
  fields: MultiFieldConfig[],
  options: CloudinaryStorageOptions
) => {
  const storage = createCloudinaryStorage(options);

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: documentFilter,
  }).fields(fields);
};

// ─────────────────────────────────────────────────────────────────────────────
// PRE-CONFIGURED UPLOAD MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────

/** Profile photo upload - 2MB limit, 500x500 max */
export const uploadProfilePhoto = createUploadMiddleware({
  folder: 'profile-photos',
  maxFileSize: 2 * 1024 * 1024,
  maxWidth: 500,
  maxHeight: 500,
  fieldName: 'profilePhoto'
});

/** Company logo upload - 1MB limit, 300x300 max */
export const uploadJobLogo = createUploadMiddleware({
  folder: 'job-logos',
  maxFileSize: 1 * 1024 * 1024,
  maxWidth: 300,
  maxHeight: 300,
  fieldName: 'companyLogo'
});

/** Blog/event image upload - 5MB limit, 1200x800 max */
export const uploadBlogImage = createUploadMiddleware({
  folder: 'blog-images',
  maxFileSize: 5 * 1024 * 1024,
  maxWidth: 1200,
  maxHeight: 800,
  quality: 'good',
  fieldName: 'blogImage'
});

/** CV/Document upload - 10MB limit */
export const uploadDocument = createUploadMiddleware({
  folder: 'documents',
  maxFileSize: 10 * 1024 * 1024,
  allowedFormats: ['pdf', 'doc', 'docx'],
  fieldName: 'document',
  resourceType: 'raw'
});

/** Banner image upload - 5MB limit, 1920x1080 max for high quality banners */
export const uploadCloudinaryBannerImage = createUploadMiddleware({
  folder: 'banners',
  maxFileSize: 5 * 1024 * 1024,
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 'auto:best',
  fieldName: 'image'
});

/** User profile multi-file upload */
export const uploadUserProfileFiles = createMultiFieldUpload(
  [
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'cvFile', maxCount: 1 },
    { name: 'experienceCertificateFile', maxCount: 1 },
    { name: 'universityCertificateFile', maxCount: 1 },
    { name: 'affiliationDocumentFile', maxCount: 1 }
  ],
  {
    folder: 'profile-files',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    maxWidth: 800,
    maxHeight: 800
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multer error handling middleware
 * Use after any upload middleware: router.post('/upload', uploadMiddleware, handleUploadError, controller)
 */
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
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

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract Cloudinary URL from uploaded file
 */
export const getUploadedFileUrl = (file: Express.Multer.File | undefined): string | null => {
  if (!file) return null;
  return (file as any).path || null;
};

/**
 * Extract multiple Cloudinary URLs from uploaded files
 */
export const getUploadedFilesUrls = (
  files: { [fieldname: string]: Express.Multer.File[] } | undefined
): Record<string, string | null> => {
  if (!files) return {};
  
  const urls: Record<string, string | null> = {};
  
  Object.entries(files).forEach(([fieldname, fileArray]) => {
    urls[fieldname] = fileArray[0] ? (fileArray[0] as any).path : null;
  });
  
  return urls;
};

/**
 * Delete a file from Cloudinary by URL
 */
export const deleteFromCloudinary = async (fileUrl: string): Promise<boolean> => {
  try {
    // Extract public_id from URL
    const urlParts = fileUrl.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1] || '';
    const publicId = filenameWithExt.split('.')[0] || '';
    const folder = urlParts[urlParts.length - 2] || '';
    
    await cloudinary.uploader.destroy(`caddcore-job-portal/${folder}/${publicId}`);
    return true;
  } catch (error) {
    return false;
  }
};