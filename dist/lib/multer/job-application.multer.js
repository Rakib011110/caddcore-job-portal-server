"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create uploads directory if it doesn't exist
const baseUploadDir = path_1.default.join(__dirname, '../../..', 'uploads');
const jobApplicationDir = path_1.default.join(baseUploadDir, 'job-applications');
// Ensure directories exist
if (!fs_1.default.existsSync(baseUploadDir)) {
    fs_1.default.mkdirSync(baseUploadDir, { recursive: true });
}
if (!fs_1.default.existsSync(jobApplicationDir)) {
    fs_1.default.mkdirSync(jobApplicationDir, { recursive: true });
}
// Configure storage for job applications (Resume/CV upload)
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, jobApplicationDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: userId_timestamp_originalname
        const userId = req.user?.id || 'anonymous';
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        const filename = `${userId}_${timestamp}${ext}`;
        cb(null, filename);
    },
});
// File filter for resume/CV uploads
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const isAllowedExt = allowedExtensions.includes(ext);
    const isAllowedMime = allowedMimes.includes(file.mimetype);
    if (isAllowedExt && isAllowedMime) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file type. Only PDF, DOC, and DOCX files are allowed. Received: ${file.mimetype}`), false);
    }
};
// Create multer instance for job application uploads
exports.jobApplicationUpload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});
exports.default = exports.jobApplicationUpload;
//# sourceMappingURL=job-application.multer.js.map