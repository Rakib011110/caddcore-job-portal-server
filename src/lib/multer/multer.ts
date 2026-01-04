import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDir = 'uploads/quiz';
const profilePhotoDir = 'uploads/profilephoto';
const profileDocsDir = 'uploads/profiledocs';
const blogEventNewsDir = 'uploads/blog-event-news';
const expertsDir = 'uploads/experts';
const eventCalendarDir = 'uploads/event-calendar';
const programImagesDir = 'uploads/image';
const bannerDir = 'uploads/banner';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(profilePhotoDir)) {
  fs.mkdirSync(profilePhotoDir, { recursive: true });
}

if (!fs.existsSync(profileDocsDir)) {
  fs.mkdirSync(profileDocsDir, { recursive: true });
}

if (!fs.existsSync(blogEventNewsDir)) {
  fs.mkdirSync(blogEventNewsDir, { recursive: true });
}

if (!fs.existsSync(expertsDir)) {
  fs.mkdirSync(expertsDir, { recursive: true });
}

if (!fs.existsSync(eventCalendarDir)) {
  fs.mkdirSync(eventCalendarDir, { recursive: true });
}

if (!fs.existsSync(programImagesDir)) {
  fs.mkdirSync(programImagesDir, { recursive: true });
}

if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `quiz-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Profile photo storage configuration
const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(profilePhotoDir)) {
      fs.mkdirSync(profilePhotoDir, { recursive: true });
    }
    cb(null, profilePhotoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Profile documents storage configuration
const profileDocsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(profileDocsDir)) {
      fs.mkdirSync(profileDocsDir, { recursive: true });
    }
    cb(null, profileDocsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let prefix = 'doc';
    
    if (file.fieldname === 'cvFile') {
      prefix = 'cv';
    } else if (file.fieldname === 'experienceCertificateFile') {
      prefix = 'experience';
      } else if (file.fieldname === 'universityCertificateFile') {
        prefix = 'university';
      } else if (file.fieldname === 'affiliationDocumentFile') {
        prefix = 'affiliation';
      }
      
      cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

// Blog/Event/News image storage configuration
const blogEventNewsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(blogEventNewsDir)) {
      fs.mkdirSync(blogEventNewsDir, { recursive: true });
    }
    cb(null, blogEventNewsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `blog-event-news-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Expert photo storage configuration
const expertPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(expertsDir)) {
      fs.mkdirSync(expertsDir, { recursive: true });
    }
    cb(null, expertsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `expert-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Event calendar image storage configuration
const eventCalendarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(eventCalendarDir)) {
      fs.mkdirSync(eventCalendarDir, { recursive: true });
    }
    cb(null, eventCalendarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `event-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Program images storage configuration (for banner images and expert profile photos)
const programImagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(programImagesDir)) {
      fs.mkdirSync(programImagesDir, { recursive: true });
    }
    cb(null, programImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `program-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Document file filter (allows PDFs, Word docs, and images)
const documentFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP), PDF, DOC, and DOCX files are allowed!'));
  }
};

// Single file upload
export const uploadQuizImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Blog/Event/News image upload
export const uploadBlogEventNewsImage = multer({
  storage: blogEventNewsStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Profile photo upload
export const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for profile photos
  }
});

// Profile documents upload
export const uploadProfileDocuments = multer({
  storage: profileDocsStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});

// Combined profile update with photo and documents
export const uploadProfileFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'profilePhoto') {
        // Ensure directory exists before saving
        if (!fs.existsSync(profilePhotoDir)) {
          fs.mkdirSync(profilePhotoDir, { recursive: true });
        }
        cb(null, profilePhotoDir);
      } else {
        // Ensure directory exists before saving
        if (!fs.existsSync(profileDocsDir)) {
          fs.mkdirSync(profileDocsDir, { recursive: true });
        }
        cb(null, profileDocsDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      let prefix = 'doc';
      
      if (file.fieldname === 'profilePhoto') {
        prefix = 'profile';
      } else if (file.fieldname === 'cvFile') {
        prefix = 'cv';
      } else if (file.fieldname === 'experienceCertificateFile') {
        prefix = 'experience';
      } else if (file.fieldname === 'universityCertificateFile') {
        prefix = 'university';
      } else if (file.fieldname === 'affiliationDocumentFile') {
        prefix = 'affiliation';
      }
      
      cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePhoto') {
      fileFilter(req, file, cb);
    } else {
      documentFileFilter(req, file, cb);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // profilePhoto + 4 document files
  }





}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'cvFile', maxCount: 1 },
  { name: 'experienceCertificateFile', maxCount: 1 },
  { name: 'universityCertificateFile', maxCount: 1 },
  { name: 'affiliationDocumentFile', maxCount: 1 }
]);

// Multiple files upload for quiz creation - handles any field names
export const uploadQuizFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 20 // Allow up to 20 files total
  }
});

// Custom middleware to handle multiple files from different fields
export const uploadMultipleQuizImages = uploadQuizFiles.fields([
  { name: 'descriptionImage', maxCount: 1 },
  { name: 'questionImages', maxCount: 10 },
  { name: 'optionImages', maxCount: 40 } // Assuming max 10 questions with 4 options each
]);

// Expert photo upload
export const uploadExpertPhoto = multer({
  storage: expertPhotoStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for expert photos
  }
});

// Event calendar image upload
export const uploadEventCalendarImage = multer({
  storage: eventCalendarStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for event images
  }
});

// Program images upload (banner images, expert profile photos, etc.)
export const uploadProgramImage = multer({
  storage: programImagesStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for program images
  }
});

// Banner image storage configuration
const bannerImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(bannerDir)) {
      fs.mkdirSync(bannerDir, { recursive: true });
    }
    cb(null, bannerDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `banner-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Banner image upload
export const uploadBannerImage = multer({
  storage: bannerImageStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for banner images
  }
});
