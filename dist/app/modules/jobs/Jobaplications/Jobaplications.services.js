"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationService = exports.getApplicationResume = exports.getUpcomingInterviews = exports.searchApplications = exports.getApplicationsByUserId = exports.getTotalApplicationsForJob = exports.getApplicationCountByStatus = exports.deleteApplication = exports.getDuePlacementFollowups = exports.updatePlacementDetails = exports.addApplicationNotes = exports.getApplicationById = exports.getAllApplications = exports.getApplicationsByJob = exports.getApplicationWithTimeline = exports.submitInterviewFeedback = exports.cancelInterview = exports.rescheduleInterview = exports.scheduleInterview = exports.updateApplicationStatus = exports.applyToJob = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Jobaplications_model_1 = require("./Jobaplications.model");
const job_model_1 = require("../job.model");
const applicationEmailService_1 = require("./applicationEmailService");
const notification_service_1 = require("../../Notification/notification.service");
const resume_service_1 = require("../../Resume/resume.service");
const resume_model_1 = require("../../Resume/resume.model");
const resume_snapshot_1 = require("../../Resume/resume.snapshot");
const resume_templates_1 = require("../../Resume/resume.templates");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION SERVICE - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Enterprise-level application management with:
 * - Complete status history tracking
 * - Event-driven email notifications
 * - Interview scheduling with reschedule support
 * - Non-blocking email sending
 */
// ─────────────────────────────────────────────────────────────────────────────
// HELPER: COMPANY SCOPING
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Narrow a query to applications for one company's jobs.
 *
 * Applications point at jobs, not companies, so every company-scoped list has
 * to resolve the company's job ids first. Returning an empty `$in` for a company
 * with no jobs is intentional - it yields no rows rather than every row.
 */
const scopeQueryToCompany = async (query, companyId) => {
    if (!companyId)
        return query;
    const companyJobs = await job_model_1.Job.find({ company: companyId }).select("_id");
    return {
        ...query,
        jobId: { $in: companyJobs.map((job) => job._id) },
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// HELPER: GET USER AND JOB DATA FOR EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const getEmailDataFromApplication = async (application) => {
    try {
        // Populate if not already populated
        const populated = application.jobId?.title
            ? application
            : await Jobaplications_model_1.JobApplication.findById(application._id)
                .populate('jobId', 'title companyName')
                .populate('userId', 'name email');
        if (!populated?.userId?.email || !populated?.jobId?.title) {
            console.error('Missing required data for email');
            return null;
        }
        return {
            candidateName: populated.userId.name,
            candidateEmail: populated.userId.email,
            jobTitle: populated.jobId.title,
            companyName: populated.jobId.companyName,
            applicationId: populated._id.toString(),
            timestamp: new Date(),
        };
    }
    catch (error) {
        console.error('Error getting email data:', error);
        return null;
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// APPLY TO JOB
// ─────────────────────────────────────────────────────────────────────────────
const applyToJob = async (payload, sendNotification = true) => {
    // ─────────────────────────────────────────────────────────────────────────
    // RESUME APPROVAL GATE
    // ─────────────────────────────────────────────────────────────────────────
    // When `resume.approval_required` and
    // `job_application.approved_resume_required` are both on, the candidate must
    // have at least one APPROVED resume. Throws 403 with a user-facing reason.
    const applicantId = payload.userId ? String(payload.userId) : '';
    if (applicantId) {
        await resume_service_1.ResumeService.assertCanApplyForJobs(applicantId);
    }
    // Record which approved resume backed this application (if any).
    //
    // The id alone is not enough: the candidate can edit that resume tomorrow and
    // a recruiter opening this application next week would see the new text. So
    // the approved content is copied onto the application as well, and that copy
    // is what everyone downstream reads.
    const approvedResume = applicantId
        ? await resume_service_1.ResumeService.getApplicableResume(applicantId)
        : null;
    const resumeFields = approvedResume
        ? (() => {
            const snapshot = (0, resume_snapshot_1.buildResumeSnapshot)(approvedResume);
            return {
                resumeId: approvedResume._id,
                resumeVersion: snapshot.version,
                resumeSnapshot: snapshot,
                resumeTemplate: snapshot.template,
            };
        })()
        : {};
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // Create application with initial status history
        const applicationData = {
            ...payload,
            ...resumeFields,
            applicationStatus: 'Pending',
            statusHistory: [{
                    status: 'Pending',
                    changedAt: new Date(),
                    notes: 'Application submitted',
                    notificationSent: false,
                }],
            appliedAt: new Date(),
        };
        const [result] = await Jobaplications_model_1.JobApplication.create([applicationData], { session });
        if (!result || !result._id) {
            throw new Error('Failed to create application');
        }
        // Populate for response and email
        const populatedResult = await Jobaplications_model_1.JobApplication.findById(result._id)
            .populate({
            path: "jobId",
            model: "Job",
            select: "title companyName jobType location salary"
        })
            .populate({
            path: "userId",
            model: "User",
            select: "name email mobileNumber profilePhoto"
        })
            .session(session);
        await session.commitTransaction();
        // Send email notification (non-blocking)
        if (sendNotification && populatedResult) {
            const emailData = await getEmailDataFromApplication(populatedResult);
            if (emailData) {
                // Fire and forget - don't block the response
                applicationEmailService_1.ApplicationEmailService.sendApplicationStatusEmail('Pending', emailData)
                    .then(async (emailResult) => {
                    // Update notification status in database
                    await Jobaplications_model_1.JobApplication.updateOne({ _id: result._id, 'statusHistory.status': 'Pending' }, {
                        $set: {
                            'statusHistory.$.notificationSent': emailResult.success,
                            'statusHistory.$.notificationError': emailResult.error || undefined
                        }
                    });
                })
                    .catch(console.error);
            }
        }
        return populatedResult;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.applyToJob = applyToJob;
// ─────────────────────────────────────────────────────────────────────────────
// UPDATE APPLICATION STATUS (WITH HISTORY AND EMAIL)
// ─────────────────────────────────────────────────────────────────────────────
const updateApplicationStatus = async (payload) => {
    const { applicationId, newStatus, notes, changedBy, sendNotification = true } = payload;
    // Create new history entry
    const historyEntry = {
        status: newStatus,
        changedAt: new Date(),
        changedBy: changedBy ? new mongoose_1.default.Types.ObjectId(changedBy) : undefined,
        notes,
        notificationSent: false,
    };
    // Update application with new status and add to history
    const result = await Jobaplications_model_1.JobApplication.findByIdAndUpdate(applicationId, {
        applicationStatus: newStatus,
        $push: { statusHistory: historyEntry },
        lastActivityAt: new Date(),
    }, { new: true, runValidators: true }).populate([
        {
            path: "jobId",
            model: "Job",
            select: "title companyName"
        },
        {
            path: "userId",
            model: "User",
            select: "name email"
        }
    ]);
    if (!result) {
        throw new Error('Application not found');
    }
    // Send email notification (non-blocking)
    if (sendNotification) {
        const emailData = await getEmailDataFromApplication(result);
        if (emailData) {
            applicationEmailService_1.ApplicationEmailService.sendApplicationStatusEmail(newStatus, emailData)
                .then(async (emailResult) => {
                // Update the notification status in the last history entry
                const historyIndex = result.statusHistory.length - 1;
                await Jobaplications_model_1.JobApplication.updateOne({ _id: applicationId }, {
                    $set: {
                        [`statusHistory.${historyIndex}.notificationSent`]: emailResult.success,
                        [`statusHistory.${historyIndex}.notificationError`]: emailResult.error || null
                    }
                });
            })
                .catch(console.error);
        }
        // Create UI notification for the applicant (non-blocking) - ALL status changes
        const populatedResult = result;
        const userId = populatedResult.userId?._id || populatedResult.userId;
        const jobTitle = populatedResult.jobId?.title || 'Job';
        const jobId = populatedResult.jobId?._id || populatedResult.jobId;
        if (userId) {
            // Status emoji and message mapping
            const statusMessages = {
                'Pending': { emoji: '📝', title: 'Application Submitted', message: `Your application for "${jobTitle}" has been submitted.` },
                'Reviewed': { emoji: '👀', title: 'Application Viewed', message: `Your application for "${jobTitle}" has been reviewed.` },
                'Shortlisted': { emoji: '⭐', title: 'You\'ve Been Shortlisted!', message: `Great news! You've been shortlisted for "${jobTitle}".` },
                'Interview Scheduled': { emoji: '📅', title: 'Interview Scheduled', message: `An interview has been scheduled for "${jobTitle}".` },
                'Interview Completed': { emoji: '✅', title: 'Interview Completed', message: `Your interview for "${jobTitle}" has been completed.` },
                'Selected': { emoji: '🎯', title: 'Congratulations! You\'ve Been Selected', message: `You've been selected for "${jobTitle}"! An offer will follow soon.` },
                'Offer Extended': { emoji: '📨', title: 'Job Offer Received!', message: `Exciting news! You've received a job offer for "${jobTitle}".` },
                'Offer Accepted': { emoji: '🎉', title: 'Welcome Aboard!', message: `Congratulations! You've accepted the offer for "${jobTitle}". Welcome to the team!` },
                'Offer Declined': { emoji: '📋', title: 'Offer Status Update', message: `You've declined the offer for "${jobTitle}".` },
                'Rejected': { emoji: '❌', title: 'Application Update', message: `Your application for "${jobTitle}" was not selected this time.` },
                'Withdrawn': { emoji: '🔙', title: 'Application Withdrawn', message: `Your application for "${jobTitle}" has been withdrawn.` },
            };
            const statusInfo = statusMessages[newStatus] || {
                emoji: '📋',
                title: `Application Status: ${newStatus}`,
                message: `Your application for "${jobTitle}" status changed to ${newStatus}.`
            };
            // Create notification using generic create method
            notification_service_1.NotificationService.create({
                userId: userId.toString(),
                type: 'APPLICATION_VIEWED', // Generic application type
                title: `${statusInfo.emoji} ${statusInfo.title}`,
                message: statusInfo.message,
                data: {
                    applicationId,
                    jobId: jobId?.toString(),
                    status: newStatus,
                },
                link: `/user-profile/applications`,
                priority: newStatus === 'Selected' ? 'HIGH' : newStatus === 'Rejected' ? 'MEDIUM' : 'LOW',
            }).catch(console.error);
        }
    }
    return result;
};
exports.updateApplicationStatus = updateApplicationStatus;
// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────
const scheduleInterview = async (payload) => {
    const { applicationId, type, scheduledDate, scheduledTime, duration = 60, isOnline, meetingLink, meetingPlatform, meetingId, meetingPassword, location, roomNumber, contactPerson, contactPhone, interviewers, instructions, scheduledBy, sendNotification = true, } = payload;
    // Create interview schedule object
    const interview = {
        type,
        status: 'Scheduled',
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration,
        timezone: 'Asia/Dhaka',
        isOnline,
        meetingLink,
        meetingPlatform: meetingPlatform,
        meetingId,
        meetingPassword,
        location,
        roomNumber,
        contactPerson,
        contactPhone,
        interviewers,
        instructions,
        rescheduleHistory: [],
    };
    // Create status history entry
    const historyEntry = {
        status: 'Interview Scheduled',
        changedAt: new Date(),
        changedBy: scheduledBy ? new mongoose_1.default.Types.ObjectId(scheduledBy) : undefined,
        notes: `${type} interview scheduled for ${scheduledDate}`,
        notificationSent: false,
    };
    // Update application
    const result = await Jobaplications_model_1.JobApplication.findByIdAndUpdate(applicationId, {
        applicationStatus: 'Interview Scheduled',
        currentInterview: interview,
        $push: {
            interviews: interview,
            statusHistory: historyEntry
        },
        lastActivityAt: new Date(),
    }, { new: true, runValidators: true }).populate([
        {
            path: "jobId",
            model: "Job",
            select: "title companyName"
        },
        {
            path: "userId",
            model: "User",
            select: "name email"
        }
    ]);
    if (!result) {
        throw new Error('Application not found');
    }
    // Send email notification (non-blocking)
    if (sendNotification) {
        const emailData = await getEmailDataFromApplication(result);
        if (emailData) {
            // Add interview details to email data
            const interviewEmailData = {
                ...emailData,
                interviewDate: new Date(scheduledDate),
                interviewTime: scheduledTime,
                duration,
                isOnline,
                meetingLink,
                meetingPlatform,
                location,
                roomNumber,
                contactPerson,
                contactPhone,
                instructions,
            };
            applicationEmailService_1.ApplicationEmailService.sendApplicationStatusEmail('Interview Scheduled', interviewEmailData)
                .then(async (emailResult) => {
                const historyIndex = result.statusHistory.length - 1;
                await Jobaplications_model_1.JobApplication.updateOne({ _id: applicationId }, {
                    $set: {
                        [`statusHistory.${historyIndex}.notificationSent`]: emailResult.success,
                        [`statusHistory.${historyIndex}.notificationError`]: emailResult.error || null
                    }
                });
            })
                .catch(console.error);
        }
    }
    return result;
};
exports.scheduleInterview = scheduleInterview;
// ─────────────────────────────────────────────────────────────────────────────
// RESCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────
const rescheduleInterview = async (applicationId, interviewId, newDate, newTime, reason, rescheduledBy, sendNotification = true) => {
    // Get current application
    const application = await Jobaplications_model_1.JobApplication.findById(applicationId)
        .populate('jobId', 'title companyName')
        .populate('userId', 'name email');
    if (!application) {
        throw new Error('Application not found');
    }
    // Find the interview to reschedule
    const interview = application.interviews?.find((i) => i._id.toString() === interviewId);
    if (!interview) {
        throw new Error('Interview not found');
    }
    const previousDate = interview.scheduledDate;
    const previousTime = interview.scheduledTime;
    // Add to reschedule history
    const rescheduleEntry = {
        previousDate,
        previousTime,
        reason,
        rescheduledBy: rescheduledBy ? new mongoose_1.default.Types.ObjectId(rescheduledBy) : undefined,
        rescheduledAt: new Date(),
    };
    // Update the interview
    const result = await Jobaplications_model_1.JobApplication.findOneAndUpdate({ _id: applicationId, 'interviews._id': interviewId }, {
        $set: {
            'interviews.$.scheduledDate': newDate,
            'interviews.$.scheduledTime': newTime,
            'interviews.$.status': 'Rescheduled',
            'currentInterview.scheduledDate': newDate,
            'currentInterview.scheduledTime': newTime,
            'currentInterview.status': 'Rescheduled',
            lastActivityAt: new Date(),
        },
        $push: {
            'interviews.$.rescheduleHistory': rescheduleEntry,
            'currentInterview.rescheduleHistory': rescheduleEntry,
            statusHistory: {
                status: 'Interview Scheduled',
                changedAt: new Date(),
                changedBy: rescheduledBy ? new mongoose_1.default.Types.ObjectId(rescheduledBy) : undefined,
                notes: `Interview rescheduled from ${previousDate} to ${newDate}. Reason: ${reason}`,
                notificationSent: false,
            }
        }
    }, { new: true }).populate([
        { path: "jobId", model: "Job", select: "title companyName" },
        { path: "userId", model: "User", select: "name email" }
    ]);
    // Send rescheduled email
    if (sendNotification && result) {
        const emailData = await getEmailDataFromApplication(result);
        if (emailData) {
            const rescheduleEmailData = {
                ...emailData,
                previousDate,
                previousTime,
                interviewDate: newDate,
                interviewTime: newTime,
                reason,
                isOnline: interview.isOnline,
                meetingLink: interview.meetingLink,
                location: interview.location,
            };
            applicationEmailService_1.ApplicationEmailService.sendInterviewRescheduledEmail(rescheduleEmailData)
                .catch(console.error);
        }
    }
    return result;
};
exports.rescheduleInterview = rescheduleInterview;
// ─────────────────────────────────────────────────────────────────────────────
// CANCEL INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────
const cancelInterview = async (applicationId, interviewId, reason, cancelledBy) => {
    const result = await Jobaplications_model_1.JobApplication.findOneAndUpdate({ _id: applicationId, 'interviews._id': interviewId }, {
        $set: {
            'interviews.$.status': 'Cancelled',
            'currentInterview.status': 'Cancelled',
            lastActivityAt: new Date(),
        },
        $push: {
            statusHistory: {
                status: 'Reviewed', // Revert to reviewed
                changedAt: new Date(),
                changedBy: cancelledBy ? new mongoose_1.default.Types.ObjectId(cancelledBy) : undefined,
                notes: `Interview cancelled. Reason: ${reason}`,
                notificationSent: false,
            }
        }
    }, { new: true });
    return result;
};
exports.cancelInterview = cancelInterview;
// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT INTERVIEW FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────
const submitInterviewFeedback = async (applicationId, interviewId, feedback, submittedBy) => {
    const feedbackData = {
        ...feedback,
        submittedBy: new mongoose_1.default.Types.ObjectId(submittedBy),
        submittedAt: new Date(),
    };
    const result = await Jobaplications_model_1.JobApplication.findOneAndUpdate({ _id: applicationId, 'interviews._id': interviewId }, {
        $set: {
            'interviews.$.feedback': feedbackData,
            'interviews.$.status': 'Completed',
            lastActivityAt: new Date(),
        },
        $push: {
            statusHistory: {
                status: 'Interview Completed',
                changedAt: new Date(),
                changedBy: new mongoose_1.default.Types.ObjectId(submittedBy),
                notes: `Interview completed. Recommendation: ${feedback.recommendation}`,
                notificationSent: false,
            }
        }
    }, { new: true });
    // Update application status to Interview Completed
    if (result) {
        result.applicationStatus = 'Interview Completed';
        await result.save();
    }
    return result;
};
exports.submitInterviewFeedback = submitInterviewFeedback;
// ─────────────────────────────────────────────────────────────────────────────
// GET APPLICATION WITH FULL TIMELINE
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationWithTimeline = async (id) => {
    const result = await Jobaplications_model_1.JobApplication.findById(id)
        .populate({
        path: "jobId",
        model: "Job",
        select: "title companyName jobType location salary description"
    })
        .populate({
        path: "userId",
        model: "User",
        select: "name email mobileNumber profilePhoto headline currentJobTitle"
    })
        .populate({
        path: "statusHistory.changedBy",
        model: "User",
        select: "name"
    });
    return result;
};
exports.getApplicationWithTimeline = getApplicationWithTimeline;
// ─────────────────────────────────────────────────────────────────────────────
// GET ALL APPLICATIONS (EXISTING METHODS - ENHANCED)
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationsByJob = async (jobId) => {
    return Jobaplications_model_1.JobApplication.find({ jobId })
        .populate({
        path: "jobId",
        model: "Job",
        select: "title companyName jobType location salary"
    })
        .populate({
        path: "userId",
        model: "User",
        select: "name email mobileNumber profilePhoto headline currentJobTitle cvUrl"
    })
        .sort({ appliedAt: -1 });
};
exports.getApplicationsByJob = getApplicationsByJob;
const getAllApplications = async (filters) => {
    let query = {};
    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;
    // Filter by status if provided
    if (filters?.status) {
        query.applicationStatus = filters.status;
    }
    // If companyId is provided, first get jobs belonging to this company
    // then filter applications for those jobs only
    if (filters?.companyId) {
        const companyJobs = await job_model_1.Job.find({ company: filters.companyId }).select("_id");
        const jobIds = companyJobs.map((job) => job._id);
        query.jobId = { $in: jobIds };
    }
    // Get total count for pagination
    const total = await Jobaplications_model_1.JobApplication.countDocuments(query);
    // Get paginated results
    const data = await Jobaplications_model_1.JobApplication.find(query)
        .populate({
        path: "jobId",
        model: "Job",
        select: "title companyName jobType location salary company"
    })
        .populate({
        path: "userId",
        model: "User",
        select: "name email mobileNumber profilePhoto"
    })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit);
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    };
};
exports.getAllApplications = getAllApplications;
const getApplicationById = async (id) => {
    return (0, exports.getApplicationWithTimeline)(id);
};
exports.getApplicationById = getApplicationById;
const addApplicationNotes = async (id, notes) => {
    return Jobaplications_model_1.JobApplication.findByIdAndUpdate(id, {
        internalNotes: notes,
        lastActivityAt: new Date(),
    }, { new: true }).populate([
        { path: "jobId", model: "Job", select: "title" },
        { path: "userId", model: "User", select: "name email" }
    ]);
};
exports.addApplicationNotes = addApplicationNotes;
/**
 * Record the outcome of a hire: the offer terms and the placement follow-up.
 *
 * These two blocks had no write path at all before, which meant the Placement
 * Record report could never show a joining date or a salary no matter what
 * actually happened - the schema fields existed but nothing ever filled them.
 *
 * Written as a nested `$set` rather than a whole-object replace so updating one
 * field (say, the 6-month follow-up) does not wipe the offer terms recorded
 * months earlier.
 */
const updatePlacementDetails = async (id, payload, updatedBy) => {
    const update = { lastActivityAt: new Date() };
    for (const [key, value] of Object.entries(payload.offerDetails || {})) {
        if (value !== undefined)
            update[`offerDetails.${key}`] = value;
    }
    /**
     * The 6-month check-in schedules itself.
     *
     * Nobody should have to type "joining date plus six months" into a form, and
     * if it is optional it simply never gets filled - which is how follow-ups get
     * missed. Setting a joining date is the one moment the due date is knowable,
     * so it is derived right there.
     *
     * Only ever set alongside a joining date, and only when the caller has not
     * supplied one explicitly - a staff member who deliberately picked a
     * different date keeps it.
     */
    const joiningDate = payload.offerDetails?.joiningDate;
    if (joiningDate && payload.placement?.sixMonthFollowUpDate === undefined) {
        const due = new Date(joiningDate);
        if (!Number.isNaN(due.getTime())) {
            due.setMonth(due.getMonth() + 6);
            update['placement.sixMonthFollowUpDate'] = due;
        }
    }
    for (const [key, value] of Object.entries(payload.placement || {})) {
        if (value !== undefined)
            update[`placement.${key}`] = value;
    }
    if (payload.applicationMethod)
        update.applicationMethod = payload.applicationMethod;
    if (payload.followUpDate !== undefined)
        update.followUpDate = payload.followUpDate;
    if (payload.followUpStatus)
        update.followUpStatus = payload.followUpStatus;
    // Verification is an assertion about reality, so stamp who made it and when
    // rather than trusting whatever the client sent for those two fields.
    if (payload.placement?.verified === true) {
        update['placement.verifiedAt'] = new Date();
        if (updatedBy)
            update['placement.verifiedBy'] = updatedBy;
    }
    return Jobaplications_model_1.JobApplication.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).populate([
        { path: "jobId", model: "Job", select: "title companyName" },
        { path: "userId", model: "User", select: "name email studentId" }
    ]);
};
exports.updatePlacementDetails = updatePlacementDetails;
/**
 * Placements whose 6-month check-in is due, plus the hires that cannot be
 * tracked at all yet because no joining date was ever recorded.
 *
 * Two lists rather than one, because they need different actions: the first
 * needs someone to phone the employer, the second needs someone to fill in a
 * date before the placement can be counted or followed up. Returning only the
 * first would quietly hide every hire that was never completed.
 */
const getDuePlacementFollowups = async () => {
    const now = new Date();
    const [due, missingJoiningDate] = await Promise.all([
        Jobaplications_model_1.JobApplication.find({
            applicationStatus: { $in: ['Selected', 'Offer Accepted'] },
            'placement.sixMonthFollowUpDate': { $lte: now },
            // "Pending"/"Contacted" are still open; a confirmed or closed result is done.
            $or: [
                { 'placement.sixMonthFollowUpStatus': { $in: ['Pending', 'Contacted'] } },
                { 'placement.sixMonthFollowUpStatus': { $exists: false } },
            ],
        })
            .populate([
            { path: 'jobId', model: 'Job', select: 'title companyName' },
            { path: 'userId', model: 'User', select: 'name email mobileNumber studentId' },
        ])
            .sort({ 'placement.sixMonthFollowUpDate': 1 })
            .limit(100),
        Jobaplications_model_1.JobApplication.find({
            applicationStatus: { $in: ['Selected', 'Offer Accepted'] },
            $or: [
                { 'offerDetails.joiningDate': { $exists: false } },
                { 'offerDetails.joiningDate': null },
            ],
        })
            .populate([
            { path: 'jobId', model: 'Job', select: 'title companyName' },
            { path: 'userId', model: 'User', select: 'name email mobileNumber studentId' },
        ])
            .sort({ updatedAt: -1 })
            .limit(100),
    ]);
    return {
        due,
        missingJoiningDate,
        counts: { due: due.length, missingJoiningDate: missingJoiningDate.length },
    };
};
exports.getDuePlacementFollowups = getDuePlacementFollowups;
const deleteApplication = async (id) => {
    return Jobaplications_model_1.JobApplication.findByIdAndDelete(id);
};
exports.deleteApplication = deleteApplication;
const getApplicationCountByStatus = async (jobId) => {
    return Jobaplications_model_1.JobApplication.aggregate([
        { $match: { jobId: new mongoose_1.default.Types.ObjectId(jobId) } },
        { $group: { _id: "$applicationStatus", count: { $sum: 1 } } },
    ]);
};
exports.getApplicationCountByStatus = getApplicationCountByStatus;
const getTotalApplicationsForJob = async (jobId) => {
    return Jobaplications_model_1.JobApplication.countDocuments({ jobId });
};
exports.getTotalApplicationsForJob = getTotalApplicationsForJob;
const getApplicationsByUserId = async (userId) => {
    return Jobaplications_model_1.JobApplication.find({ userId })
        .populate({
        path: "jobId",
        model: "Job",
        select: "title companyName jobType location salary description"
    })
        .sort({ appliedAt: -1 });
};
exports.getApplicationsByUserId = getApplicationsByUserId;
const searchApplications = async (query) => {
    let searchQuery = {};
    if (query.jobId)
        searchQuery.jobId = query.jobId;
    if (query.userId)
        searchQuery.userId = query.userId;
    if (query.applicationStatus)
        searchQuery.applicationStatus = query.applicationStatus;
    // Company scope wins over any jobId the caller asked for, so a company cannot
    // widen its own search by passing another company's job id.
    if (query.companyId) {
        searchQuery = await scopeQueryToCompany(searchQuery, query.companyId);
    }
    return Jobaplications_model_1.JobApplication.find(searchQuery)
        .populate({
        path: "jobId",
        model: "Job",
        select: "title companyName jobType location"
    })
        .populate({
        path: "userId",
        model: "User",
        select: "name email mobileNumber"
    })
        .sort({ appliedAt: -1 });
};
exports.searchApplications = searchApplications;
// ─────────────────────────────────────────────────────────────────────────────
// GET UPCOMING INTERVIEWS
// ─────────────────────────────────────────────────────────────────────────────
const getUpcomingInterviews = async (days = 7, companyId) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const query = await scopeQueryToCompany({
        applicationStatus: 'Interview Scheduled',
        'currentInterview.scheduledDate': {
            $gte: now,
            $lte: futureDate,
        },
        'currentInterview.status': 'Scheduled',
    }, companyId);
    return Jobaplications_model_1.JobApplication.find(query)
        .populate({
        path: "jobId",
        model: "Job",
        select: "title companyName"
    })
        .populate({
        path: "userId",
        model: "User",
        select: "name email mobileNumber profilePhoto"
    })
        .sort({ 'currentInterview.scheduledDate': 1 });
};
exports.getUpcomingInterviews = getUpcomingInterviews;
/**
 * The CV a recruiter should look at for one application.
 *
 * Reads the frozen snapshot first. Only pre-snapshot applications fall back to
 * the live resume document, and those are flagged so the UI can be honest about
 * what it is showing.
 */
const getApplicationResume = async (applicationId) => {
    const application = await Jobaplications_model_1.JobApplication.findById(applicationId)
        .populate({ path: "jobId", model: "Job", select: "title companyName" })
        .populate({
        path: "userId",
        model: "User",
        select: "name email profilePhoto",
    });
    if (!application)
        return null;
    const doc = application;
    const snapshot = doc.resumeSnapshot;
    // The live resume is only read to detect drift, never to render.
    const liveResume = doc.resumeId
        ? await resume_model_1.Resume.findOne({ _id: doc.resumeId, isDeleted: false })
        : null;
    const common = {
        applicationId: String(application._id),
        candidate: {
            // `exactOptionalPropertyTypes` is on: an absent id must be an absent key,
            // not a key holding undefined.
            ...(doc.userId?._id ? { id: String(doc.userId._id) } : {}),
            name: doc.userId?.name,
            email: doc.userId?.email,
            profilePhoto: doc.userId?.profilePhoto,
        },
        job: {
            title: doc.jobId?.title,
            companyName: doc.jobId?.companyName,
        },
        appliedAt: doc.appliedAt,
    };
    if (snapshot) {
        return {
            ...common,
            resume: snapshot,
            template: doc.resumeTemplate || snapshot.template || resume_templates_1.DEFAULT_RESUME_TEMPLATE_ID,
            version: snapshot.version ?? doc.resumeVersion ?? 1,
            candidateHasNewerVersion: (0, resume_snapshot_1.isSnapshotStale)(snapshot, liveResume),
            isLegacyFallback: false,
        };
    }
    if (!liveResume)
        return null;
    const rebuilt = (0, resume_snapshot_1.buildResumeSnapshot)(liveResume);
    return {
        ...common,
        resume: rebuilt,
        template: rebuilt.template,
        version: rebuilt.version,
        candidateHasNewerVersion: false,
        isLegacyFallback: true,
    };
};
exports.getApplicationResume = getApplicationResume;
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SERVICE
// ─────────────────────────────────────────────────────────────────────────────
exports.ApplicationService = {
    applyToJob: exports.applyToJob,
    updateApplicationStatus: exports.updateApplicationStatus,
    scheduleInterview: exports.scheduleInterview,
    rescheduleInterview: exports.rescheduleInterview,
    cancelInterview: exports.cancelInterview,
    submitInterviewFeedback: exports.submitInterviewFeedback,
    getApplicationWithTimeline: exports.getApplicationWithTimeline,
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
    getUpcomingInterviews: exports.getUpcomingInterviews,
    getApplicationResume: exports.getApplicationResume,
};
//# sourceMappingURL=Jobaplications.services.js.map