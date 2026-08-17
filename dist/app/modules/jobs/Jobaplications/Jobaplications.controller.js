"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = exports.getApplicationResume = exports.getMyApplications = exports.searchApplications = exports.getApplicationsByUserId = exports.getTotalApplicationsForJob = exports.getApplicationCountByStatus = exports.deleteApplication = exports.getDuePlacementFollowups = exports.updatePlacementDetails = exports.addApplicationNotes = exports.getApplicationById = exports.getAllApplications = exports.getApplicationsByJob = exports.getUpcomingInterviews = exports.getApplicationWithTimeline = exports.submitInterviewFeedback = exports.cancelInterview = exports.rescheduleInterview = exports.scheduleInterview = exports.updateApplicationStatus = exports.applyToJob = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const Jobaplications_services_1 = require("./Jobaplications.services");
const application_access_1 = require("./application.access");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION CONTROLLER - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Complete CRUD with interview scheduling and status management
 */
// ─────────────────────────────────────────────────────────────────────────────
// APPLY TO JOB
// ─────────────────────────────────────────────────────────────────────────────
exports.applyToJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { jobId, coverLetter, sendNotification = true } = req.body;
    // The applicant is whoever holds the token. Trusting `req.body.userId` here
    // let any signed-in account submit applications in someone else's name.
    const userId = req.user?._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "Authentication required",
            data: null,
        });
    }
    if (!jobId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "jobId is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.applyToJob({ jobId, userId, coverLetter }, sendNotification);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Application submitted successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// UPDATE APPLICATION STATUS
// ─────────────────────────────────────────────────────────────────────────────
exports.updateApplicationStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { applicationStatus, notes, sendNotification = true } = req.body;
    const adminId = req.user?._id;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID is required",
            data: null,
        });
    }
    const payload = {
        applicationId: id,
        newStatus: applicationStatus,
        notes,
        changedBy: adminId,
        sendNotification,
    };
    const result = await Jobaplications_services_1.ApplicationService.updateApplicationStatus(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Application status updated to ${applicationStatus}`,
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────
exports.scheduleInterview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user?._id;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID is required",
            data: null,
        });
    }
    const { type, scheduledDate, scheduledTime, duration, isOnline, meetingLink, meetingPlatform, meetingId, meetingPassword, location, roomNumber, contactPerson, contactPhone, interviewers, instructions, sendNotification = true, } = req.body;
    if (!type || !scheduledDate || !scheduledTime || isOnline === undefined) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "type, scheduledDate, scheduledTime, and isOnline are required",
            data: null,
        });
    }
    const payload = {
        applicationId: id,
        type,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration,
        isOnline,
        meetingLink,
        meetingPlatform,
        meetingId,
        meetingPassword,
        location,
        roomNumber,
        contactPerson,
        contactPhone,
        interviewers,
        instructions,
        scheduledBy: adminId,
        sendNotification,
    };
    const result = await Jobaplications_services_1.ApplicationService.scheduleInterview(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Interview scheduled successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// RESCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────
exports.rescheduleInterview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id, interviewId } = req.params;
    const { newDate, newTime, reason, sendNotification = true } = req.body;
    const adminId = req.user?._id;
    if (!id || !interviewId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID and Interview ID are required",
            data: null,
        });
    }
    if (!newDate || !newTime || !reason) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "newDate, newTime, and reason are required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.rescheduleInterview(id, interviewId, new Date(newDate), newTime, reason, adminId, sendNotification);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Interview rescheduled successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// CANCEL INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelInterview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id, interviewId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?._id;
    if (!id || !interviewId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID and Interview ID are required",
            data: null,
        });
    }
    if (!reason) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "reason is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.cancelInterview(id, interviewId, reason, adminId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Interview cancelled successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT INTERVIEW FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────
exports.submitInterviewFeedback = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id, interviewId } = req.params;
    const { rating, strengths, improvements, recommendation, comments } = req.body;
    const adminId = req.user?._id;
    if (!id || !interviewId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID and Interview ID are required",
            data: null,
        });
    }
    if (!adminId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "Authentication required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.submitInterviewFeedback(id, interviewId, { rating, strengths, improvements, recommendation, comments }, adminId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Interview feedback submitted successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// GET APPLICATION WITH TIMELINE
// ─────────────────────────────────────────────────────────────────────────────
exports.getApplicationWithTimeline = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.getApplicationWithTimeline(id);
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Application not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Application with timeline fetched successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// GET UPCOMING INTERVIEWS
// ─────────────────────────────────────────────────────────────────────────────
exports.getUpcomingInterviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    // Undefined for staff, who see every company's interviews.
    const companyId = (0, application_access_1.resolveListCompanyId)(req);
    const result = await Jobaplications_services_1.ApplicationService.getUpcomingInterviews(days, companyId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Upcoming interviews fetched successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// EXISTING CONTROLLERS (ENHANCED)
// ─────────────────────────────────────────────────────────────────────────────
exports.getApplicationsByJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { jobId } = req.params;
    if (!jobId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Job ID is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.getApplicationsByJob(jobId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Applications fetched successfully",
        data: result,
    });
});
exports.getAllApplications = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // Never read `req.query.companyId` directly - a company account could pass
    // another company's id. `resolveListCompanyId` pins non-staff to their own.
    const companyId = (0, application_access_1.resolveListCompanyId)(req);
    const filters = companyId ? { companyId } : undefined;
    const result = await Jobaplications_services_1.ApplicationService.getAllApplications(filters);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All applications fetched successfully",
        data: result,
    });
});
exports.getApplicationById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.getApplicationById(id);
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Application not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Application fetched successfully",
        data: result,
    });
});
exports.addApplicationNotes = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { internalNotes } = req.body;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.addApplicationNotes(id, internalNotes);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notes added successfully",
        data: result,
    });
});
/**
 * Record offer terms and the post-hire placement follow-up.
 *
 * Feeds the Placement Record report - joining date, salary, employment status,
 * the 6-month check-in and whether any of it has been verified against the
 * employer.
 */
exports.updatePlacementDetails = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID is required",
            data: null,
        });
    }
    const staffId = req.user?._id || req.user?.id;
    const result = await Jobaplications_services_1.ApplicationService.updatePlacementDetails(id, req.body, staffId);
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Application not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Placement details updated successfully",
        data: result,
    });
});
/** Placement follow-ups that are due, and hires still missing a joining date. */
exports.getDuePlacementFollowups = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const result = await Jobaplications_services_1.ApplicationService.getDuePlacementFollowups();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Due placement follow-ups fetched successfully",
        data: result,
    });
});
exports.deleteApplication = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.deleteApplication(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Application deleted successfully",
        data: result,
    });
});
exports.getApplicationCountByStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { jobId } = req.params;
    if (!jobId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Job ID is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.getApplicationCountByStatus(jobId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Application count by status fetched successfully",
        data: result,
    });
});
exports.getTotalApplicationsForJob = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { jobId } = req.params;
    if (!jobId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Job ID is required",
            data: null,
        });
    }
    const count = await Jobaplications_services_1.ApplicationService.getTotalApplicationsForJob(jobId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Total applications count fetched successfully",
        data: { count },
    });
});
exports.getApplicationsByUserId = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "User ID is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.getApplicationsByUserId(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Applications fetched successfully",
        data: result,
    });
});
exports.searchApplications = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const companyId = (0, application_access_1.resolveListCompanyId)(req);
    // The resolved company overrides anything in the query string.
    const result = await Jobaplications_services_1.ApplicationService.searchApplications({
        ...req.query,
        companyId,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Applications fetched successfully",
        data: result,
    });
});
exports.getMyApplications = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "Authentication required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.getApplicationsByUserId(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "My applications fetched successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// SUBMITTED CV
// ─────────────────────────────────────────────────────────────────────────────
/**
 * The CV that came with this application, frozen as approved.
 *
 * Access is already settled by `guardApplicationScope` on the route, so this
 * handler only has to fetch.
 */
exports.getApplicationResume = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Application ID is required",
            data: null,
        });
    }
    const result = await Jobaplications_services_1.ApplicationService.getApplicationResume(id);
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "This application has no CV attached.",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Submitted CV fetched successfully",
        data: result,
    });
});
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
exports.ApplicationController = {
    applyToJob: exports.applyToJob,
    updateApplicationStatus: exports.updateApplicationStatus,
    scheduleInterview: exports.scheduleInterview,
    rescheduleInterview: exports.rescheduleInterview,
    cancelInterview: exports.cancelInterview,
    submitInterviewFeedback: exports.submitInterviewFeedback,
    getApplicationWithTimeline: exports.getApplicationWithTimeline,
    getUpcomingInterviews: exports.getUpcomingInterviews,
    getApplicationsByJob: exports.getApplicationsByJob,
    getAllApplications: exports.getAllApplications,
    getApplicationById: exports.getApplicationById,
    addApplicationNotes: exports.addApplicationNotes,
    updatePlacementDetails: exports.updatePlacementDetails,
    getDuePlacementFollowups: exports.getDuePlacementFollowups,
    deleteApplication: exports.deleteApplication,
    getApplicationCountByStatus: exports.getApplicationCountByStatus,
    getTotalApplicationsForJob: exports.getTotalApplicationsForJob,
    getApplicationsByUserId: exports.getApplicationsByUserId,
    searchApplications: exports.searchApplications,
    getMyApplications: exports.getMyApplications,
    getApplicationResume: exports.getApplicationResume,
};
//# sourceMappingURL=Jobaplications.controller.js.map