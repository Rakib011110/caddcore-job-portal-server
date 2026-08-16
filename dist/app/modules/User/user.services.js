"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const user_model_1 = require("./user.model");
const studentId_1 = require("./studentId");
const verifyJWT_1 = require("../../utils/verifyJWT");
const config_1 = __importDefault(require("../../../config"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER SERVICES
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// BASIC CRUD OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────
const createUserIntoDB = async (payload) => {
    // `/user/create-user` is a public route, so it is a second registration door
    // and has to run the same Student ID gate as `/auth/register`. Skipping it
    // here would leave `registration.student_id_required` trivially bypassable.
    const studentId = await (0, studentId_1.resolveStudentIdForRegistration)(payload.studentId);
    const newUser = await (0, studentId_1.rethrowDuplicateStudentId)(() => user_model_1.User.create({ ...payload, studentId }));
    return newUser;
};
const getAllUsersFromDb = async () => {
    const users = await user_model_1.User.find().select('-password');
    return users;
};
const getAUserFromDb = async (id) => {
    const user = await user_model_1.User.findById(id).select('-password');
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
const updpateUserInDb = async (id, payload) => {
    // Update lastProfileUpdate
    payload.lastProfileUpdate = new Date();
    // A Student ID is claimed once and then frozen. Without this, anyone could
    // edit their profile to swap in a different ID after registering, which would
    // defeat the one-ID-one-account rule the registration gate exists to enforce.
    // Users who registered before the requirement existed can still add theirs,
    // so the field is only writable while it is empty.
    if ('studentId' in payload) {
        const claimedStudentId = await (0, studentId_1.resolveStudentIdClaim)(id, payload.studentId);
        // `undefined` means "leave the stored value alone", so the key is dropped
        // rather than written - writing undefined would clear an existing ID.
        if (claimedStudentId === undefined) {
            delete payload.studentId;
        }
        else {
            payload.studentId = claimedStudentId;
        }
    }
    const user = await (0, studentId_1.rethrowDuplicateStudentId)(() => user_model_1.User.findByIdAndUpdate(id, payload, { new: true }).select('-password'));
    if (!user) {
        throw new Error("User not found");
    }
    // Calculate and update profile completeness
    const completeness = user_model_1.User.calculateProfileCompleteness(user);
    await user_model_1.User.findByIdAndUpdate(id, { profileCompleteness: completeness });
    // Generate new JWT with updated user data
    const jwtPayload = {
        _id: user._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    };
    if (user.mobileNumber)
        jwtPayload.mobileNumber = user.mobileNumber;
    if (user.profilePhoto)
        jwtPayload.profilePhoto = user.profilePhoto;
    if (user.emailVerified !== undefined)
        jwtPayload.emailVerified = user.emailVerified;
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return { user: { ...user.toObject(), profileCompleteness: completeness }, accessToken };
};
const deleteUserFromDb = async (id) => {
    const deletedUser = await user_model_1.User.findByIdAndDelete(id);
    if (!deletedUser) {
        throw new Error("User not found");
    }
    return deletedUser;
};
// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PHOTO UPLOAD
// ─────────────────────────────────────────────────────────────────────────────
const uploadProfilePhoto = async (userId, file) => {
    const photoUrl = file.path;
    if (!photoUrl) {
        throw new Error("Upload failed - no URL returned");
    }
    const updatedUser = await user_model_1.User.findByIdAndUpdate(userId, { profilePhoto: photoUrl, lastProfileUpdate: new Date() }, { new: true }).select('-password');
    if (!updatedUser) {
        throw new Error("User not found");
    }
    return updatedUser;
};
// ─────────────────────────────────────────────────────────────────────────────
// SAVED JOBS
// ─────────────────────────────────────────────────────────────────────────────
const getSavedJobs = async (userId) => {
    const user = await user_model_1.User.findById(userId)
        .populate({
        path: 'savedJobs',
        select: 'title slug companyName companyLogoUrl location jobType salaryRange isActive applicationDeadline'
    })
        .select('savedJobs');
    if (!user) {
        throw new Error("User not found");
    }
    return user.savedJobs || [];
};
const saveJob = async (userId, jobId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const jobObjectId = new mongoose_1.default.Types.ObjectId(jobId);
    // Check if already saved
    if (user.savedJobs?.some(id => id.toString() === jobId)) {
        throw new Error("Job already saved");
    }
    const updatedUser = await user_model_1.User.findByIdAndUpdate(userId, { $addToSet: { savedJobs: jobObjectId } }, { new: true }).select('savedJobs');
    return updatedUser?.savedJobs;
};
const unsaveJob = async (userId, jobId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const jobObjectId = new mongoose_1.default.Types.ObjectId(jobId);
    const updatedUser = await user_model_1.User.findByIdAndUpdate(userId, { $pull: { savedJobs: jobObjectId } }, { new: true }).select('savedJobs');
    return updatedUser?.savedJobs;
};
const isJobSaved = async (userId, jobId) => {
    const user = await user_model_1.User.findById(userId).select('savedJobs');
    if (!user) {
        throw new Error("User not found");
    }
    return user.savedJobs?.some(id => id.toString() === jobId) || false;
};
// ─────────────────────────────────────────────────────────────────────────────
// JOB ALERT PREFERENCES
// ─────────────────────────────────────────────────────────────────────────────
const getJobAlertPreferences = async (userId) => {
    const user = await user_model_1.User.findById(userId).select('jobAlertPreferences');
    if (!user) {
        throw new Error("User not found");
    }
    return user.jobAlertPreferences || { enabled: false, frequency: 'daily' };
};
const updateJobAlertPreferences = async (userId, preferences) => {
    const user = await user_model_1.User.findByIdAndUpdate(userId, { jobAlertPreferences: preferences }, { new: true }).select('jobAlertPreferences');
    if (!user) {
        throw new Error("User not found");
    }
    return user.jobAlertPreferences;
};
// ─────────────────────────────────────────────────────────────────────────────
// CV DATA
// ─────────────────────────────────────────────────────────────────────────────
const getCVData = async (userId) => {
    const user = await user_model_1.User.findById(userId).select('name email mobileNumber profilePhoto dateOfBirth gender nationality address city state country postalCode ' +
        'headline summary currentJobTitle currentCompany totalExperienceYears expectedSalary expectedSalaryCurrency noticePeriod willingToRelocate preferredLocations ' +
        'education workExperience skills technicalSkills softSkills certifications languages projects awards references socialLinks ' +
        'cvTemplate cvVisibility profileCompleteness');
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
const updateCVData = async (userId, cvData) => {
    // Only allow updating CV-related fields
    const allowedFields = [
        'headline', 'summary', 'currentJobTitle', 'currentCompany', 'totalExperienceYears',
        'expectedSalary', 'expectedSalaryCurrency', 'noticePeriod', 'willingToRelocate', 'preferredLocations',
        'education', 'workExperience', 'skills', 'technicalSkills', 'softSkills',
        'certifications', 'languages', 'projects', 'awards', 'references', 'socialLinks',
        'cvTemplate', 'cvVisibility', 'dateOfBirth', 'gender', 'nationality',
        'address', 'city', 'state', 'country', 'postalCode', 'alternatePhone', 'alternateEmail'
    ];
    const filteredData = {};
    for (const key of allowedFields) {
        if (cvData[key] !== undefined) {
            filteredData[key] = cvData[key];
        }
    }
    filteredData.lastProfileUpdate = new Date();
    const user = await user_model_1.User.findByIdAndUpdate(userId, filteredData, { new: true }).select('-password');
    if (!user) {
        throw new Error("User not found");
    }
    // Calculate and update profile completeness
    const completeness = user_model_1.User.calculateProfileCompleteness(user);
    await user_model_1.User.findByIdAndUpdate(userId, { profileCompleteness: completeness });
    return { ...user.toObject(), profileCompleteness: completeness };
};
// ─────────────────────────────────────────────────────────────────────────────
// PROFILE COMPLETENESS
// ─────────────────────────────────────────────────────────────────────────────
const getProfileCompleteness = async (userId) => {
    const user = await user_model_1.User.findById(userId).select('-password');
    if (!user) {
        throw new Error("User not found");
    }
    const completeness = user_model_1.User.calculateProfileCompleteness(user);
    // Update if different from stored value
    if (user.profileCompleteness !== completeness) {
        await user_model_1.User.findByIdAndUpdate(userId, { profileCompleteness: completeness });
    }
    return completeness;
};
// ─────────────────────────────────────────────────────────────────────────────
// USERS WITH JOB ALERTS ENABLED (for cron job)
// ─────────────────────────────────────────────────────────────────────────────
const getUsersWithJobAlerts = async (frequency) => {
    const users = await user_model_1.User.find({
        'jobAlertPreferences.enabled': true,
        'jobAlertPreferences.frequency': frequency,
        status: 'ACTIVE',
        emailVerified: true
    }).select('email name jobAlertPreferences');
    return users;
};
const getPublicCandidates = async (params) => {
    const { page = 1, limit = 12, searchTerm, skills, experienceLevel, location } = params;
    const skip = (page - 1) * limit;
    // Build query - ONLY show admin approved (CADDCORE verified) candidates
    const query = {
        role: 'USER',
        status: 'ACTIVE',
        'caddcoreVerification.isVerified': true
    };
    // Search by name, headline, or skills
    if (searchTerm) {
        query.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { headline: { $regex: searchTerm, $options: 'i' } },
            { currentJobTitle: { $regex: searchTerm, $options: 'i' } },
            { 'skills.name': { $regex: searchTerm, $options: 'i' } },
            { technicalSkills: { $regex: searchTerm, $options: 'i' } }
        ];
    }
    // Filter by skills
    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        query.$or = query.$or || [];
        query.$or.push({ 'skills.name': { $in: skillsArray.map(s => new RegExp(s, 'i')) } }, { technicalSkills: { $in: skillsArray.map(s => new RegExp(s, 'i')) } });
    }
    // Filter by experience level
    if (experienceLevel) {
        switch (experienceLevel) {
            case 'entry':
                query.totalExperienceYears = { $lte: 2 };
                break;
            case 'mid':
                query.totalExperienceYears = { $gte: 2, $lte: 5 };
                break;
            case 'senior':
                query.totalExperienceYears = { $gte: 5, $lte: 10 };
                break;
            case 'expert':
                query.totalExperienceYears = { $gte: 10 };
                break;
        }
    }
    // Filter by location
    if (location) {
        query.$or = query.$or || [];
        query.$or.push({ city: { $regex: location, $options: 'i' } }, { country: { $regex: location, $options: 'i' } });
    }
    const [candidates, total] = await Promise.all([
        user_model_1.User.find(query)
            .select('name profilePhoto headline currentJobTitle currentCompany totalExperienceYears ' +
            'city country skills technicalSkills education workExperience profileCompleteness ' +
            'caddcoreVerification isOpenToWork jobSeekingStatus')
            .sort({ 'caddcoreVerification.priorityScore': -1, profileCompleteness: -1, updatedAt: -1 })
            .skip(skip)
            .limit(limit),
        user_model_1.User.countDocuments(query)
    ]);
    return {
        data: candidates,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};
const getPublicCandidateById = async (id) => {
    const user = await user_model_1.User.findOne({
        _id: id,
        role: 'USER',
        status: 'ACTIVE',
        'caddcoreVerification.isVerified': true
    }).select('-password -emailVerificationToken -emailVerificationTokenExpires ' +
        '-passwordResetToken -passwordResetTokenExpires -savedJobs -jobAlertPreferences');
    if (!user) {
        throw new Error("Candidate not found or profile is private");
    }
    return user;
};
exports.UserServices = {
    // Basic CRUD
    createUserIntoDB,
    getAllUsersFromDb,
    getAUserFromDb,
    updpateUserInDb,
    deleteUserFromDb,
    // Profile Photo
    uploadProfilePhoto,
    // Saved Jobs
    getSavedJobs,
    saveJob,
    unsaveJob,
    isJobSaved,
    // Job Alerts
    getJobAlertPreferences,
    updateJobAlertPreferences,
    getUsersWithJobAlerts,
    // CV
    getCVData,
    updateCVData,
    getProfileCompleteness,
    // Public Candidates / Talent Pool
    getPublicCandidates,
    getPublicCandidateById
};
//# sourceMappingURL=user.services.js.map