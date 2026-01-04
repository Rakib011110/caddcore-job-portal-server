import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserServices } from "./user.services";
import { getUploadedFilesUrls, getUploadedFileUrl } from "../../../lib/multer/cloudinary.multer";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

const parseJsonField = (value: any): any => {
  if (!value) return undefined;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
};

const parseDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString || typeof dateString !== 'string') return undefined;
  const trimmed = dateString.trim();
  if (!trimmed) return undefined;

  try {
    if (trimmed.includes('T')) {
      const datePart = trimmed.split('T')[0];
      if (datePart) return new Date(datePart);
    }
    return new Date(trimmed);
  } catch {
    return undefined;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BASIC CRUD CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

const createUsers = catchAsync(async (req, res) => {
  const user = await UserServices.createUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Created Successfully",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await UserServices.getAllUsersFromDb();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users fetched successfully",
    data: users,
  });
});

const getAUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "User ID is required",
      data: null,
    });
  }
  
  const user = await UserServices.getAUserFromDb(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User fetched successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
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
  if (updateData.dateOfBirth) updateData.dateOfBirth = parseDate(updateData.dateOfBirth);
  if (updateData.affiliationStartDate) updateData.affiliationStartDate = parseDate(updateData.affiliationStartDate);
  if (updateData.affiliationValidTill) updateData.affiliationValidTill = parseDate(updateData.affiliationValidTill);
  
  // Handle file uploads if present
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const uploadedUrls = getUploadedFilesUrls(files);
    
    if (uploadedUrls.profilePhoto) updateData.profilePhoto = uploadedUrls.profilePhoto;
    if (uploadedUrls.cvFile) updateData.cvUrl = uploadedUrls.cvFile;
    if (uploadedUrls.experienceCertificateFile) updateData.experienceCertificateUrl = uploadedUrls.experienceCertificateFile;
    if (uploadedUrls.universityCertificateFile) updateData.universityCertificateUrl = uploadedUrls.universityCertificateFile;
    if (uploadedUrls.affiliationDocumentFile) updateData.affiliationDocument = uploadedUrls.affiliationDocumentFile;
  }

  // Clean undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined || updateData[key] === 'undefined') {
      delete updateData[key];
    }
  });
  
  const updatedUserData = await UserServices.updpateUserInDb(userId, updateData);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: {
      user: updatedUserData.user,
      accessToken: updatedUserData.accessToken
    },
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "User ID is required",
      data: null,
    });
  }
  
  const deletedUser = await UserServices.deleteUserFromDb(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: deletedUser,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PHOTO
// ─────────────────────────────────────────────────────────────────────────────

const uploadProfilePhoto = catchAsync(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "User ID is required",
      data: null,
    });
  }

  if (!req.file) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "No file uploaded",
      data: null,
    });
  }

  const updatedUser = await UserServices.uploadProfilePhoto(userId, req.file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
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

const makeBaseMember = catchAsync(async (req, res) => {
  const userId = req.params.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "User ID is required",
      data: null,
    });
  }
  
  const membershipData = req.body;
  const updatedUser = await UserServices.makeBaseMember(userId, membershipData);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User has been made a BASE member successfully",
    data: updatedUser,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SAVED JOBS
// ─────────────────────────────────────────────────────────────────────────────

const getSavedJobs = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Authentication required",
      data: null,
    });
  }
  
  const savedJobs = await UserServices.getSavedJobs(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Saved jobs fetched successfully",
    data: savedJobs,
  });
});

const saveJob = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { jobId } = req.body;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Authentication required",
      data: null,
    });
  }
  
  if (!jobId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Job ID is required",
      data: null,
    });
  }
  
  const savedJobs = await UserServices.saveJob(userId, jobId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Job saved successfully",
    data: savedJobs,
  });
});

const unsaveJob = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { jobId } = req.params;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Authentication required",
      data: null,
    });
  }
  
  if (!jobId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Job ID is required",
      data: null,
    });
  }
  
  const savedJobs = await UserServices.unsaveJob(userId, jobId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Job removed from saved list",
    data: savedJobs,
  });
});

const checkJobSaved = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { jobId } = req.params;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Authentication required",
      data: null,
    });
  }

  if (!jobId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Job ID is required",
      data: null,
    });
  }
  
  const isSaved = await UserServices.isJobSaved(userId, jobId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Job saved status fetched",
    data: { isSaved },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOB ALERT PREFERENCES
// ─────────────────────────────────────────────────────────────────────────────

const getJobAlertPreferences = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Authentication required",
      data: null,
    });
  }
  
  const preferences = await UserServices.getJobAlertPreferences(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Job alert preferences fetched successfully",
    data: preferences,
  });
});

const updateJobAlertPreferences = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Authentication required",
      data: null,
    });
  }
  
  const preferences = await UserServices.updateJobAlertPreferences(userId, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Job alert preferences updated successfully",
    data: preferences,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CV DATA
// ─────────────────────────────────────────────────────────────────────────────

const getCVData = catchAsync(async (req, res) => {
  const userId = req.params.id || req.user?._id || req.user?.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "User ID is required",
      data: null,
    });
  }
  
  const cvData = await UserServices.getCVData(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "CV data fetched successfully",
    data: cvData,
  });
});

const updateCVData = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
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
  
  if (cvData.dateOfBirth) cvData.dateOfBirth = parseDate(cvData.dateOfBirth);
  
  const updatedCV = await UserServices.updateCVData(userId, cvData);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "CV data updated successfully",
    data: updatedCV,
  });
});

const getProfileCompleteness = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Authentication required",
      data: null,
    });
  }
  
  const completeness = await UserServices.getProfileCompleteness(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile completeness calculated",
    data: { completeness },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CANDIDATES / TALENT POOL
// ─────────────────────────────────────────────────────────────────────────────

const getPublicCandidates = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    searchTerm,
    skills,
    experienceLevel,
    location
  } = req.query;

  const result = await UserServices.getPublicCandidates({
    page: Number(page),
    limit: Number(limit),
    searchTerm: searchTerm as string,
    skills: skills as string,
    experienceLevel: experienceLevel as string,
    location: location as string
  });
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Candidates fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getPublicCandidateById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Candidate ID is required",
      data: null,
    });
  }
  
  const candidate = await UserServices.getPublicCandidateById(id);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Candidate profile fetched successfully",
    data: candidate,
  });
});

export const UserControllers = {
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

