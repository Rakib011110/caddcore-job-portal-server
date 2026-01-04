import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const baseUploadDir = path.join(__dirname, '../../..', 'uploads');
const jobApplicationDir = path.join(baseUploadDir, 'job-applications');

// Ensure directories exist
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

if (!fs.existsSync(jobApplicationDir)) {
  fs.mkdirSync(jobApplicationDir, { recursive: true });
}

// Configure storage for job applications (Resume/CV upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, jobApplicationDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId_timestamp_originalname
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

// File filter for resume/CV uploads
const fileFilter = (req: any, file: any, cb: any) => {
  // Allowed file types
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime = allowedMimes.includes(file.mimetype);

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only PDF, DOC, and DOCX files are allowed. Received: ${file.mimetype}`
      ),
      false
    );
  }
};

// Create multer instance for job application uploads
export const jobApplicationUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

export default jobApplicationUpload;
