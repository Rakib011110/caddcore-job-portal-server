"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const user_services_1 = require("./user.services");
const cloudinary_multer_1 = require("../../../lib/multer/cloudinary.multer");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
const parseJsonField = (value) => {
    if (!value)
        return undefined;
    if (typeof value === 'object')
        return value;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch {
            return undefined;
        }
    }
    return undefined;
};
const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string')
        return undefined;
    const trimmed = dateString.trim();
    if (!trimmed)
        return undefined;
    try {
        if (trimmed.includes('T')) {
            const datePart = trimmed.split('T')[0];
            if (datePart)
                return new Date(datePart);
        }
        return new Date(trimmed);
    }
    catch {
        return undefined;
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// BASIC CRUD CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────
const createUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await user_services_1.UserServices.createUserIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User Created Successfully",
        data: user,
    });
});
const getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const users = await user_services_1.UserServices.getAllUsersFromDb();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Users fetched successfully",
        data: users,
    });
});
const getAUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "User ID is required",
            data: null,
        });
    }
    const user = await user_services_1.UserServices.getAUserFromDb(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User fetched successfully",
        data: user,
    });
});
const updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "User ID is required",
            data: null,
        });
    }
    const updateData = { ...req.body };
    // Parse JSON fields
    const jsonFields = [
        'education', 'workExperience', 'skills', 'certifications',
        'languages', 'projects', 'awards', 'references', 'socialLinks',
        'jobExperiences', 'preferredLocations', 'technicalSkills', 'softSkills',
        'jobAlertPreferences'
    ];
    jsonFields.forEach(field => {
        if (updateData[field]) {
            updateData[field] = parseJsonField(updateData[field]);
        }
    });
    // Parse date fields
    if (updateData.dateOfBirth)
        updateData.dateOfBirth = parseDate(updateData.dateOfBirth);
    if (updateData.affiliationStartDate)
        updateData.affiliationStartDate = parseDate(updateData.affiliationStartDate);
    if (updateData.affiliationValidTill)
        updateData.affiliationValidTill = parseDate(updateData.affiliationValidTill);
    // Handle file uploads if present
    if (req.files) {
        const files = req.files;
        const uploadedUrls = (0, cloudinary_multer_1.getUploadedFilesUrls)(files);
        if (uploadedUrls.profilePhoto)
            updateData.profilePhoto = uploadedUrls.profilePhoto;
        if (uploadedUrls.cvFile)
            updateData.cvUrl = uploadedUrls.cvFile;
        if (uploadedUrls.experienceCertificateFile)
            updateData.experienceCertificateUrl = uploadedUrls.experienceCertificateFile;
        if (uploadedUrls.universityCertificateFile)
            updateData.universityCertificateUrl = uploadedUrls.universityCertificateFile;
        if (uploadedUrls.affiliationDocumentFile)
            updateData.affiliationDocument = uploadedUrls.affiliationDocumentFile;
    }
    // Clean undefined values
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === 'undefined') {
            delete updateData[key];
        }
    });
    const updatedUserData = await user_services_1.UserServices.updpateUserInDb(userId, updateData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User updated successfully",
        data: {
            user: updatedUserData.user,
            accessToken: updatedUserData.accessToken
        },
    });
});
const deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "User ID is required",
            data: null,
        });
    }
    const deletedUser = await user_services_1.UserServices.deleteUserFromDb(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User deleted successfully",
        data: deletedUser,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PHOTO
// ─────────────────────────────────────────────────────────────────────────────
const uploadProfilePhoto = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "User ID is required",
            data: null,
        });
    }
    if (!req.file) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "No file uploaded",
            data: null,
        });
    }
    const updatedUser = await user_services_1.UserServices.uploadProfilePhoto(userId, req.file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Profile photo uploaded successfully",
        data: {
            user: updatedUser,
            profilePhotoUrl: updatedUser.profilePhoto
        },
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP
// ─────────────────────────────────────────────────────────────────────────────
const makeBaseMember = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "User ID is required",
            data: null,
        });
    }
    const membershipData = req.body;
    const updatedUser = await user_services_1.UserServices.makeBaseMember(userId, membershipData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User has been made a BASE member successfully",
        data: updatedUser,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// SAVED JOBS
// ─────────────────────────────────────────────────────────────────────────────
const getSavedJobs = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: "Authentication required",
            data: null,
        });
    }
    const savedJobs = await user_services_1.UserServices.getSavedJobs(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Saved jobs fetched successfully",
        data: savedJobs,
    });
});
const saveJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    const { jobId } = req.body;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: "Authentication required",
            data: null,
        });
    }
    if (!jobId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Job ID is required",
            data: null,
        });
    }
    const savedJobs = await user_services_1.UserServices.saveJob(userId, jobId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job saved successfully",
        data: savedJobs,
    });
});
const unsaveJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    const { jobId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: "Authentication required",
            data: null,
        });
    }
    if (!jobId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Job ID is required",
            data: null,
        });
    }
    const savedJobs = await user_services_1.UserServices.unsaveJob(userId, jobId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job removed from saved list",
        data: savedJobs,
    });
});
const checkJobSaved = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    const { jobId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: "Authentication required",
            data: null,
        });
    }
    if (!jobId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Job ID is required",
            data: null,
        });
    }
    const isSaved = await user_services_1.UserServices.isJobSaved(userId, jobId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job saved status fetched",
        data: { isSaved },
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// JOB ALERT PREFERENCES
// ─────────────────────────────────────────────────────────────────────────────
const getJobAlertPreferences = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: "Authentication required",
            data: null,
        });
    }
    const preferences = await user_services_1.UserServices.getJobAlertPreferences(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job alert preferences fetched successfully",
        data: preferences,
    });
});
const updateJobAlertPreferences = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: "Authentication required",
            data: null,
        });
    }
    const preferences = await user_services_1.UserServices.updateJobAlertPreferences(userId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job alert preferences updated successfully",
        data: preferences,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// CV DATA
// ─────────────────────────────────────────────────────────────────────────────
const getCVData = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id || req.user?._id || req.user?.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "User ID is required",
            data: null,
        });
    }
    const cvData = await user_services_1.UserServices.getCVData(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "CV data fetched successfully",
        data: cvData,
    });
});
const updateCVData = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: "Authentication required",
            data: null,
        });
    }
    // Parse JSON fields from form data
    const cvData = { ...req.body };
    const jsonFields = [
        'education', 'workExperience', 'skills', 'certifications',
        'languages', 'projects', 'awards', 'references', 'socialLinks',
        'preferredLocations', 'technicalSkills', 'softSkills'
    ];
    jsonFields.forEach(field => {
        if (cvData[field]) {
            cvData[field] = parseJsonField(cvData[field]);
        }
    });
    if (cvData.dateOfBirth)
        cvData.dateOfBirth = parseDate(cvData.dateOfBirth);
    const updatedCV = await user_services_1.UserServices.updateCVData(userId, cvData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "CV data updated successfully",
        data: updatedCV,
    });
});
const getProfileCompleteness = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.UNAUTHORIZED,
            message: "Authentication required",
            data: null,
        });
    }
    const completeness = await user_services_1.UserServices.getProfileCompleteness(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Profile completeness calculated",
        data: { completeness },
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CANDIDATES / TALENT POOL
// ─────────────────────────────────────────────────────────────────────────────
const getPublicCandidates = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { page = 1, limit = 12, searchTerm, skills, experienceLevel, location } = req.query;
    const result = await user_services_1.UserServices.getPublicCandidates({
        page: Number(page),
        limit: Number(limit),
        searchTerm: searchTerm,
        skills: skills,
        experienceLevel: experienceLevel,
        location: location
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Candidates fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getPublicCandidateById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Candidate ID is required",
            data: null,
        });
    }
    const candidate = await user_services_1.UserServices.getPublicCandidateById(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Candidate profile fetched successfully",
        data: candidate,
    });
});
exports.UserControllers = {
    // Basic CRUD
    createUsers,
    getAllUsers,
    getAUser,
    deleteUser,
    updateUser,
    // Profile Photo
    uploadProfilePhoto,
    // Membership
    makeBaseMember,
    // Saved Jobs
    getSavedJobs,
    saveJob,
    unsaveJob,
    checkJobSaved,
    // Job Alerts
    getJobAlertPreferences,
    updateJobAlertPreferences,
    // CV
    getCVData,
    updateCVData,
    getProfileCompleteness,
    // Public Candidates
    getPublicCandidates,
    getPublicCandidateById
};
//# sourceMappingURL=user.controller.js.map