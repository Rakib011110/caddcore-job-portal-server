"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_model_1 = require("../User/user.model");
const notification_service_1 = require("../Notification/notification.service");
const settings_service_1 = require("../Settings/settings.service");
const settings_constant_1 = require("../Settings/settings.constant");
const resume_model_1 = require("./resume.model");
const resume_diff_1 = require("./resume.diff");
const resume_snapshot_1 = require("./resume.snapshot");
const resume_constant_1 = require("./resume.constant");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements the approval workflow:
 *
 *   draft ──submit──> pending_review ──approve──> approved
 *                           │
 *                           └──reject──> rejected ──edit+submit──> pending_review
 *
 * Whether the workflow is enforced at all is driven by system settings
 * (`resume.approval_required`, `job_application.approved_resume_required`),
 * never by hard-coded flags.
 */
// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const toObjectId = (id) => typeof id === 'string' ? new mongoose_1.Types.ObjectId(id) : id;
const isValidObjectId = (id) => mongoose_1.Types.ObjectId.isValid(id);
/** Appends a review-history entry without clobbering existing history */
const pushHistory = (resume, entry) => {
    const historyEntry = {
        action: entry.action,
        status: entry.status,
        version: entry.version ?? resume.version,
        at: entry.at ?? new Date(),
    };
    if (entry.actorId)
        historyEntry.actorId = entry.actorId;
    if (entry.actorRole)
        historyEntry.actorRole = entry.actorRole;
    if (entry.feedback)
        historyEntry.feedback = entry.feedback;
    resume.reviewHistory.push(historyEntry);
};
/** Pre-fills resume content from the user's profile CV */
const buildContentFromProfile = (user) => {
    const content = {};
    if (user.name)
        content.fullName = user.name;
    if (user.email)
        content.email = user.email;
    if (user.mobileNumber)
        content.phone = user.mobileNumber;
    if (user.address)
        content.address = user.address;
    if (user.city)
        content.city = user.city;
    if (user.country)
        content.country = user.country;
    if (user.profilePhoto)
        content.profilePhoto = user.profilePhoto;
    if (user.headline)
        content.headline = user.headline;
    if (user.summary)
        content.summary = user.summary;
    if (user.currentJobTitle)
        content.currentJobTitle = user.currentJobTitle;
    if (user.totalExperienceYears !== undefined) {
        content.totalExperienceYears = user.totalExperienceYears;
    }
    if (user.expectedSalary !== undefined) {
        content.expectedSalary = user.expectedSalary;
    }
    if (user.education?.length)
        content.education = user.education;
    if (user.workExperience?.length)
        content.workExperience = user.workExperience;
    if (user.skills?.length)
        content.skills = user.skills;
    if (user.certifications?.length)
        content.certifications = user.certifications;
    if (user.languages?.length)
        content.languages = user.languages;
    if (user.projects?.length)
        content.projects = user.projects;
    if (user.awards?.length)
        content.awards = user.awards;
    if (user.references?.length)
        content.references = user.references;
    if (user.socialLinks)
        content.socialLinks = user.socialLinks;
    if (user.cvUrl)
        content.fileUrl = user.cvUrl;
    if (user.cvTemplate)
        content.template = user.cvTemplate;
    return content;
};
/** Loads a resume the user owns, or throws */
const findOwnedResume = async (userId, resumeId) => {
    if (!isValidObjectId(resumeId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid resume id');
    }
    const resume = await resume_model_1.Resume.findOne({
        _id: resumeId,
        userId,
        isDeleted: false,
    });
    if (!resume) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Resume not found');
    }
    return resume;
};
/**
 * A resume must be complete enough to be worth a reviewer's time.
 * An uploaded resume file satisfies the requirement on its own.
 */
const assertSubmittable = (resume) => {
    const problems = [];
    if (!resume.fullName?.trim())
        problems.push('full name');
    if (!resume.email?.trim())
        problems.push('email address');
    const hasUploadedFile = Boolean(resume.fileUrl?.trim());
    const hasHistory = (resume.education?.length ?? 0) > 0 ||
        (resume.workExperience?.length ?? 0) > 0;
    if (!hasUploadedFile && !hasHistory) {
        problems.push('at least one education or work experience entry');
    }
    if (problems.length > 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Your resume is missing: ${problems.join(', ')}. Please complete it before submitting for review.`);
    }
};
/** Ensures exactly one default resume per user */
const clearOtherDefaults = async (userId, keepResumeId) => {
    await resume_model_1.Resume.updateMany({ userId, _id: { $ne: keepResumeId }, isDefault: true }, { $set: { isDefault: false } });
};
/** Reviewers who should be told about a new submission */
const getReviewerIds = async () => {
    const reviewers = await user_model_1.User.find({
        role: { $in: ['ADMIN', 'HR'] },
        status: 'ACTIVE',
    })
        .select('_id')
        .limit(25)
        .lean();
    return reviewers.map((reviewer) => reviewer._id);
};
// ─────────────────────────────────────────────────────────────────────────────
// USER: CREATE / READ / UPDATE / DELETE
// ─────────────────────────────────────────────────────────────────────────────
const createResume = async (userId, payload) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // One CV per candidate.
    //
    // Multiple CVs made the approval workflow meaningless: a rejected CV could be
    // sidestepped by making a fresh one, and "which CV did this person actually
    // get approved?" had no single answer. Candidates now keep one CV and edit
    // it, which is also what employers expect to be looking at.
    const existing = await resume_model_1.Resume.findOne({ userId, isDeleted: false });
    if (existing) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You already have a CV. Edit it instead of creating another one.');
    }
    const { fromProfile, title, isDefault, ...content } = payload;
    // Profile data fills only the gaps - anything sent in the payload wins.
    const profileContent = fromProfile ? buildContentFromProfile(user) : {};
    const resume = new resume_model_1.Resume({
        ...profileContent,
        ...content,
        userId: toObjectId(userId),
        title: title?.trim() || 'My Resume',
        status: resume_constant_1.RESUME_STATUS.DRAFT,
        version: 0,
        hasBeenApproved: false,
        // First resume is the default one
        // It is the candidate's only CV, so it is always the default one.
        isDefault: true,
        reviewHistory: [],
    });
    pushHistory(resume, {
        action: resume_constant_1.RESUME_REVIEW_ACTION.CREATED,
        status: resume_constant_1.RESUME_STATUS.DRAFT,
        actorId: toObjectId(userId),
        actorRole: user.role,
    });
    await resume.save();
    if (resume.isDefault) {
        await clearOtherDefaults(userId, resume._id);
    }
    return resume;
};
const getMyResumes = async (userId, filters = {}) => {
    const query = { userId, isDeleted: false };
    if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
    }
    return resume_model_1.Resume.find(query).sort({ isDefault: -1, updatedAt: -1 });
};
const getMyResumeById = async (userId, resumeId) => findOwnedResume(userId, resumeId);
/**
 * The user's single working CV, created on first access.
 *
 * This is what keeps the candidate flow simple: they fill in their profile via
 * the CV Builder and their resume already exists, pre-filled - no "create a
 * resume" step to discover, no empty list to stare at.
 */
const ensurePrimaryResume = async (userId) => {
    const existing = await resume_model_1.Resume.findOne({ userId, isDeleted: false }).sort({
        isDefault: -1,
        updatedAt: -1,
    });
    if (existing)
        return existing;
    return createResume(userId, {
        title: 'My CV',
        isDefault: true,
        fromProfile: true,
    });
};
/**
 * Re-pull every content field from the user's profile CV.
 *
 * Used when the candidate updates their profile after the resume was made, so
 * they never have to type the same information twice. Runs through
 * `updateResume`, so the pending-review lock and the "editing an approved
 * resume returns it to draft" rule both still apply.
 */
const syncFromProfile = async (userId, resumeId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return updateResume(userId, resumeId, buildContentFromProfile(user));
};
/** The CV content fields only, stripped of workflow bookkeeping. */
const extractContent = (resume) => {
    const plain = resume.toObject({ depopulate: true });
    const content = {};
    resume_constant_1.RESUME_CONTENT_FIELDS.forEach((field) => {
        if (plain[field] !== undefined)
            content[field] = plain[field];
    });
    return content;
};
/**
 * Decide what an edit to an already-approved CV costs its owner.
 *
 * Mutates the resume in place; the caller saves. Notifies reviewers when the
 * edit needs looking at, so a re-approval does not sit unnoticed in a queue
 * nobody was told about.
 */
const applyReapprovalPolicy = async (resume, userId) => {
    const alwaysReapprove = await settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.RESUME_REAPPROVAL_REQUIRED);
    const change = (0, resume_diff_1.measureCvChange)(resume.approvedContent, extractContent(resume));
    resume.changeSinceApproval = change.percent;
    let reason = 'Edited after approval - sent back for review';
    if (!alwaysReapprove) {
        const threshold = await settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.RESUME_MAJOR_CHANGE_THRESHOLD);
        // Two ways to cross the line. The whole-CV percentage catches broad
        // rewrites; the per-section one catches a replaced work history, which
        // moves under 40% of a full CV because everything it did NOT touch dilutes
        // it - and is exactly the edit a reviewer wants to see.
        const overallExceeded = change.percent >= threshold;
        const sectionExceeded = change.majorSectionPercent >= threshold;
        if (!overallExceeded && !sectionExceeded) {
            pushHistory(resume, {
                action: resume_constant_1.RESUME_REVIEW_ACTION.UPDATED,
                status: resume_constant_1.RESUME_STATUS.APPROVED,
                actorId: toObjectId(userId),
                feedback: `Minor edit accepted automatically (${change.percent}% of the CV changed since approval)`,
            });
            return;
        }
        reason = overallExceeded
            ? `Substantial edit (${change.percent}% of the CV changed) - sent back for review`
            : `${change.majorSection} was largely rewritten (${change.majorSectionPercent}% of that section) - sent back for review`;
    }
    // Already flagged - the candidate is still editing a version nobody has
    // reviewed yet, so there is no second notification to send.
    const wasAlreadyFlagged = resume.pendingReapproval;
    resume.pendingReapproval = true;
    resume.submittedAt = new Date();
    pushHistory(resume, {
        action: resume_constant_1.RESUME_REVIEW_ACTION.UPDATED,
        status: resume_constant_1.RESUME_STATUS.APPROVED,
        actorId: toObjectId(userId),
        feedback: reason,
    });
    if (!wasAlreadyFlagged) {
        const [reviewerIds, owner] = await Promise.all([
            getReviewerIds(),
            user_model_1.User.findById(resume.userId).select('name'),
        ]);
        void notification_service_1.NotificationService.notifyReviewersOfResume(reviewerIds, owner?.name || 'A candidate', resume.title, String(resume._id)).catch(console.error);
    }
};
const updateResume = async (userId, resumeId, payload) => {
    const resume = await findOwnedResume(userId, resumeId);
    if (resume.status === resume_constant_1.RESUME_STATUS.PENDING_REVIEW) {
        const allowEditWhilePending = await settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.RESUME_ALLOW_EDIT_WHILE_PENDING);
        if (!allowEditWhilePending) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This resume is pending approval and cannot be edited. Withdraw it from review first.');
        }
    }
    const { title, isDefault, ...content } = payload;
    // Does this update touch reviewable content, or just labels?
    const touchesContent = resume_constant_1.RESUME_CONTENT_FIELDS.some((field) => content[field] !== undefined);
    Object.entries(content).forEach(([key, value]) => {
        if (value !== undefined) {
            resume[key] = value;
        }
    });
    if (title !== undefined)
        resume.title = title.trim() || resume.title;
    if (isDefault !== undefined) {
        resume.isDefault = isDefault;
    }
    // Editing an approved CV no longer revokes the approval outright.
    //
    // The candidate keeps their approved standing and can carry on applying;
    // employers simply keep receiving `approvedContent` until a reviewer has seen
    // the new version. Whether a review is needed at all depends on the settings:
    //
    //   reapproval_required ON  - every content edit goes back for review
    //   reapproval_required OFF - small edits are accepted as they are, and only
    //                             a rewrite past the threshold needs approving
    //
    // The threshold is measured against the last APPROVED content, not the
    // previous save, so a run of small edits still eventually adds up.
    if (touchesContent && resume.status === resume_constant_1.RESUME_STATUS.APPROVED) {
        await applyReapprovalPolicy(resume, userId);
    }
    await resume.save();
    if (resume.isDefault) {
        await clearOtherDefaults(userId, resume._id);
    }
    return resume;
};
const deleteResume = async (userId, resumeId) => {
    const resume = await findOwnedResume(userId, resumeId);
    // Deleting an approved CV would be a way around the one-CV rule: delete,
    // create a fresh one, and the approval history disappears with it. Approved
    // CVs are edited, not replaced.
    if (resume.hasBeenApproved) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'An approved CV cannot be deleted. Edit it instead - your existing job applications keep the version they were sent with.');
    }
    resume.isDeleted = true;
    resume.deletedAt = new Date();
    resume.isDefault = false;
    await resume.save();
    // Promote another resume to default so the user always has one selected,
    // preferring an approved one so job applications keep working.
    const replacement = (await resume_model_1.Resume.findOne({
        userId,
        isDeleted: false,
        status: resume_constant_1.RESUME_STATUS.APPROVED,
    }).sort({ updatedAt: -1 })) ??
        (await resume_model_1.Resume.findOne({ userId, isDeleted: false }).sort({
            updatedAt: -1,
        }));
    if (replacement && !replacement.isDefault) {
        replacement.isDefault = true;
        await replacement.save();
    }
    return { message: 'Resume deleted successfully' };
};
const setDefaultResume = async (userId, resumeId) => {
    const resume = await findOwnedResume(userId, resumeId);
    resume.isDefault = true;
    await resume.save();
    await clearOtherDefaults(userId, resume._id);
    return resume;
};
// ─────────────────────────────────────────────────────────────────────────────
// USER: SUBMIT / WITHDRAW
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Submit for review.
 *
 * Honours two settings:
 *   - `resume.approval_required` off  → the resume is approved immediately
 *   - `resume.auto_approve_on_resubmit` on → previously approved resumes skip
 *     the queue on resubmission
 */
const submitForReview = async (userId, resumeId, payload = {}) => {
    const resume = await findOwnedResume(userId, resumeId);
    if (resume.status === resume_constant_1.RESUME_STATUS.PENDING_REVIEW) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This resume is already pending approval');
    }
    if (!resume_constant_1.SUBMITTABLE_STATUSES.includes(resume.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `A resume with status "${resume.status}" cannot be submitted for review. Edit it first.`);
    }
    assertSubmittable(resume);
    const [approvalRequired, autoApproveOnResubmit] = await Promise.all([
        settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.RESUME_APPROVAL_REQUIRED),
        settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.RESUME_AUTO_APPROVE_ON_RESUBMIT),
    ]);
    resume.version += 1;
    resume.submittedAt = new Date();
    resume.rejectionReason = undefined;
    if (payload.submissionNote) {
        resume.submissionNote = payload.submissionNote;
    }
    const skipsReview = !approvalRequired || (autoApproveOnResubmit && resume.hasBeenApproved);
    if (skipsReview) {
        resume.status = resume_constant_1.RESUME_STATUS.APPROVED;
        resume.hasBeenApproved = true;
        resume.reviewedAt = new Date();
        resume.reviewedBy = undefined;
        pushHistory(resume, {
            action: resume_constant_1.RESUME_REVIEW_ACTION.AUTO_APPROVED,
            status: resume_constant_1.RESUME_STATUS.APPROVED,
            actorId: toObjectId(userId),
            feedback: approvalRequired
                ? 'Auto-approved on resubmission of a previously approved resume'
                : 'Auto-approved because resume approval is not required',
        });
        await resume.save();
        void notification_service_1.NotificationService.notifyResumeStatus(userId, 'APPROVED', resume.title, String(resume._id)).catch(console.error);
        return resume;
    }
    resume.status = resume_constant_1.RESUME_STATUS.PENDING_REVIEW;
    pushHistory(resume, {
        action: resume_constant_1.RESUME_REVIEW_ACTION.SUBMITTED,
        status: resume_constant_1.RESUME_STATUS.PENDING_REVIEW,
        actorId: toObjectId(userId),
        ...(payload.submissionNote ? { feedback: payload.submissionNote } : {}),
    });
    await resume.save();
    // Notifications are best-effort: a mail/notification hiccup must not fail
    // the submission the user just made.
    void (async () => {
        try {
            const user = await user_model_1.User.findById(userId).select('name').lean();
            const reviewerIds = await getReviewerIds();
            await Promise.all([
                notification_service_1.NotificationService.notifyResumeStatus(userId, 'SUBMITTED', resume.title, String(resume._id)),
                notification_service_1.NotificationService.notifyReviewersOfResume(reviewerIds, user?.name || 'A candidate', resume.title, String(resume._id)),
            ]);
        }
        catch (error) {
            console.error('[Resume] Failed to send submission notifications:', error);
        }
    })();
    return resume;
};
/** Pull a resume back out of the review queue so it can be edited again */
const withdrawSubmission = async (userId, resumeId) => {
    const resume = await findOwnedResume(userId, resumeId);
    if (resume.status !== resume_constant_1.RESUME_STATUS.PENDING_REVIEW) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Only a resume that is pending approval can be withdrawn');
    }
    resume.status = resume_constant_1.RESUME_STATUS.DRAFT;
    resume.submittedAt = undefined;
    pushHistory(resume, {
        action: resume_constant_1.RESUME_REVIEW_ACTION.WITHDRAWN,
        status: resume_constant_1.RESUME_STATUS.DRAFT,
        actorId: toObjectId(userId),
    });
    await resume.save();
    return resume;
};
// ─────────────────────────────────────────────────────────────────────────────
// ELIGIBILITY (the job-application gate)
// ─────────────────────────────────────────────────────────────────────────────
const getEligibility = async (userId) => {
    if (!isValidObjectId(userId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid user id');
    }
    const [approvalRequired, approvedResumeRequired] = await Promise.all([
        settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.RESUME_APPROVAL_REQUIRED),
        settings_service_1.SettingsService.get(settings_constant_1.SETTING_KEYS.JOB_APPLICATION_APPROVED_RESUME_REQUIRED),
    ]);
    const grouped = await resume_model_1.Resume.aggregate([
        { $match: { userId: toObjectId(userId), isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts = {
        [resume_constant_1.RESUME_STATUS.DRAFT]: 0,
        [resume_constant_1.RESUME_STATUS.PENDING_REVIEW]: 0,
        [resume_constant_1.RESUME_STATUS.APPROVED]: 0,
        [resume_constant_1.RESUME_STATUS.REJECTED]: 0,
        total: 0,
    };
    grouped.forEach((group) => {
        if (group._id in counts) {
            counts[group._id] = group.count;
        }
        counts.total += group.count;
    });
    const hasApprovedResume = counts[resume_constant_1.RESUME_STATUS.APPROVED] > 0;
    const gateActive = approvalRequired && approvedResumeRequired;
    const canApply = !gateActive || hasApprovedResume;
    let reason;
    if (!canApply) {
        if (counts.total === 0) {
            reason =
                'You need an approved resume before you can apply. Create a resume and submit it for review.';
        }
        else if (counts[resume_constant_1.RESUME_STATUS.PENDING_REVIEW] > 0) {
            reason =
                'Your resume is pending approval. You can apply for jobs once it has been approved.';
        }
        else if (counts[resume_constant_1.RESUME_STATUS.REJECTED] > 0) {
            reason =
                'Your resume was rejected. Please update it and submit it for review again.';
        }
        else {
            reason =
                'You need an approved resume before you can apply. Submit one of your resumes for review.';
        }
    }
    return {
        approvalRequired,
        approvedResumeRequired,
        hasApprovedResume,
        canApply,
        ...(reason ? { reason } : {}),
        counts,
    };
};
/**
 * Gate used by the job-application flow. Throws 403 when the user is not
 * allowed to apply yet.
 */
const assertCanApplyForJobs = async (userId) => {
    const eligibility = await getEligibility(userId);
    if (!eligibility.canApply) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, eligibility.reason ||
            'An approved resume is required before you can apply for jobs');
    }
};
/** The resume a submitted application should be attached to */
const getApplicableResume = async (userId) => resume_model_1.Resume.findOne({
    userId,
    isDeleted: false,
    status: resume_constant_1.RESUME_STATUS.APPROVED,
}).sort({ isDefault: -1, reviewedAt: -1 });
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CANDIDATE PROFILE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * The approved CV behind a public candidate profile.
 *
 * The talent-pool profile used to be rendered from the User document - the
 * candidate's own free-text profile, which nobody reviews. That made "CADD CORE
 * verified" mean less than it looks: an employer could be reading claims no
 * reviewer ever saw. This is the reviewed document instead.
 *
 * `buildResumeSnapshot` rather than the raw resume for the same reason it is
 * used at apply time: when a candidate has edited an approved CV, it resolves
 * back to the copy a reviewer signed off, so unreviewed content never reaches
 * an employer.
 *
 * Visibility mirrors `UserServices.getPublicCandidateById` exactly - if the
 * profile is not public, neither is the CV. Returns `null` (not an error) when
 * a visible candidate simply has no approved CV yet, so the profile page can
 * fall back to their self-entered details instead of breaking.
 */
const getPublicCandidateResume = async (userId) => {
    if (!isValidObjectId(userId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid candidate id');
    }
    const candidate = await user_model_1.User.findOne({
        _id: userId,
        role: 'USER',
        status: 'ACTIVE',
        'caddcoreVerification.isVerified': true,
    }).select('name email profilePhoto mobileNumber');
    if (!candidate) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Candidate not found or profile is private');
    }
    const resume = await getApplicableResume(userId);
    if (!resume)
        return null;
    const snapshot = (0, resume_snapshot_1.buildResumeSnapshot)(resume);
    return {
        candidate: {
            id: String(candidate._id),
            name: candidate.name,
            email: candidate.email,
            profilePhoto: candidate.profilePhoto,
        },
        resume: snapshot,
        template: snapshot.template,
        version: snapshot.version,
        ...(resume.reviewedAt ? { approvedAt: resume.reviewedAt } : {}),
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / REVIEWER
// ─────────────────────────────────────────────────────────────────────────────
const getAllResumes = async (filters = {}) => {
    const { status, userId, searchTerm, page = 1, limit = 20, sortBy = 'submittedAt', sortOrder = 'desc', } = filters;
    const query = { isDeleted: false };
    const conditions = [];
    if (status && status !== 'all') {
        // The review queue holds two kinds of work: first-time submissions, and
        // approved CVs edited enough to need looking at again. A reviewer opening
        // "Pending" expects both - the second kind would otherwise never surface.
        conditions.push(status === resume_constant_1.RESUME_STATUS.PENDING_REVIEW
            ? {
                $or: [
                    { status: resume_constant_1.RESUME_STATUS.PENDING_REVIEW },
                    { status: resume_constant_1.RESUME_STATUS.APPROVED, pendingReapproval: true },
                ],
            }
            : { status });
    }
    if (userId && isValidObjectId(userId))
        query.userId = toObjectId(userId);
    if (searchTerm?.trim()) {
        const pattern = new RegExp(searchTerm.trim(), 'i');
        conditions.push({
            $or: [
                { title: pattern },
                { fullName: pattern },
                { email: pattern },
                { headline: pattern },
            ],
        });
    }
    // `$and` rather than two `$or` keys - the second would silently overwrite the
    // first and quietly widen the query.
    if (conditions.length)
        query.$and = conditions;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([
        resume_model_1.Resume.find(query)
            .populate('userId', 'name email profilePhoto mobileNumber role')
            .populate('reviewedBy', 'name email role')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit),
        resume_model_1.Resume.countDocuments(query),
    ]);
    return {
        data,
        meta: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
        },
    };
};
const getResumeById = async (resumeId) => {
    if (!isValidObjectId(resumeId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid resume id');
    }
    const resume = await resume_model_1.Resume.findOne({ _id: resumeId, isDeleted: false })
        .populate('userId', 'name email profilePhoto mobileNumber role')
        .populate('reviewedBy', 'name email role');
    if (!resume) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Resume not found');
    }
    return resume;
};
/** Shared guard for approve/reject */
const findReviewableResume = async (resumeId) => {
    if (!isValidObjectId(resumeId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid resume id');
    }
    const resume = await resume_model_1.Resume.findOne({ _id: resumeId, isDeleted: false });
    if (!resume) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Resume not found');
    }
    // Two things land in a reviewer's queue: a first-time submission, and an
    // approved CV whose owner has since edited it past what the settings allow.
    const isAwaitingReview = resume.status === resume_constant_1.RESUME_STATUS.PENDING_REVIEW || resume.pendingReapproval;
    if (!isAwaitingReview) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Only resumes awaiting approval can be reviewed. This one is "${resume.status}".`);
    }
    return resume;
};
const reviewResume = async (resumeId, reviewerId, reviewerRole, decision, payload) => {
    const resume = await findReviewableResume(resumeId);
    const approved = decision === resume_constant_1.RESUME_REVIEW_ACTION.APPROVED;
    const nextStatus = approved
        ? resume_constant_1.RESUME_STATUS.APPROVED
        : resume_constant_1.RESUME_STATUS.REJECTED;
    resume.status = nextStatus;
    resume.reviewedAt = new Date();
    resume.reviewedBy = toObjectId(reviewerId);
    if (payload.reviewerNotes !== undefined) {
        resume.reviewerNotes = payload.reviewerNotes;
    }
    if (approved) {
        resume.hasBeenApproved = true;
        resume.rejectionReason = undefined;
        // Freeze what was just approved. This becomes both the baseline the next
        // edit is measured against and the version employers receive until the
        // one after that is reviewed.
        resume.approvedContent = extractContent(resume);
        resume.approvedVersion = resume.version;
        resume.pendingReapproval = false;
        resume.changeSinceApproval = 0;
    }
    else {
        // Feedback is optional per spec - a reviewer may reject without a reason.
        resume.rejectionReason = (payload.rejectionReason?.trim() ||
            undefined);
    }
    pushHistory(resume, {
        action: approved
            ? resume_constant_1.RESUME_REVIEW_ACTION.APPROVED
            : resume_constant_1.RESUME_REVIEW_ACTION.REJECTED,
        status: nextStatus,
        actorId: toObjectId(reviewerId),
        actorRole: reviewerRole,
        ...(approved
            ? payload.reviewerNotes
                ? { feedback: payload.reviewerNotes }
                : {}
            : payload.rejectionReason
                ? { feedback: payload.rejectionReason }
                : {}),
    });
    await resume.save();
    // If this is the user's only approved resume, make it the default.
    if (approved) {
        const hasDefault = await resume_model_1.Resume.exists({
            userId: resume.userId,
            isDeleted: false,
            isDefault: true,
        });
        if (!hasDefault) {
            resume.isDefault = true;
            await resume.save();
        }
    }
    void notification_service_1.NotificationService.notifyResumeStatus(String(resume.userId), approved ? 'APPROVED' : 'REJECTED', resume.title, String(resume._id), approved ? payload.reviewerNotes : payload.rejectionReason).catch(console.error);
    return resume;
};
const approveResume = async (resumeId, reviewerId, reviewerRole, payload = {}) => reviewResume(resumeId, reviewerId, reviewerRole, resume_constant_1.RESUME_REVIEW_ACTION.APPROVED, payload);
const rejectResume = async (resumeId, reviewerId, reviewerRole, payload = {}) => reviewResume(resumeId, reviewerId, reviewerRole, resume_constant_1.RESUME_REVIEW_ACTION.REJECTED, payload);
const getResumeStats = async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const [grouped, staleReviews, awaitingReapproval] = await Promise.all([
        resume_model_1.Resume.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        resume_model_1.Resume.countDocuments({
            isDeleted: false,
            submittedAt: { $lte: threeDaysAgo },
            $or: [
                { status: resume_constant_1.RESUME_STATUS.PENDING_REVIEW },
                { status: resume_constant_1.RESUME_STATUS.APPROVED, pendingReapproval: true },
            ],
        }),
        resume_model_1.Resume.countDocuments({
            isDeleted: false,
            status: resume_constant_1.RESUME_STATUS.APPROVED,
            pendingReapproval: true,
        }),
    ]);
    const stats = {
        total: 0,
        draft: 0,
        pending_review: 0,
        approved: 0,
        rejected: 0,
        staleReviews,
        awaitingReapproval,
    };
    grouped.forEach((group) => {
        if (group._id in stats) {
            stats[group._id] = group.count;
        }
        stats.total += group.count;
    });
    // Re-approvals sit under `approved`, so the queue counter has to add them in
    // or the badge would say "0 pending" while work waits.
    stats.pending_review += awaitingReapproval;
    return stats;
};
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
exports.ResumeService = {
    // User
    createResume,
    getMyResumes,
    getMyResumeById,
    ensurePrimaryResume,
    syncFromProfile,
    updateResume,
    deleteResume,
    setDefaultResume,
    submitForReview,
    withdrawSubmission,
    // Eligibility
    getEligibility,
    assertCanApplyForJobs,
    getApplicableResume,
    // Public talent pool
    getPublicCandidateResume,
    // Admin
    getAllResumes,
    getResumeById,
    approveResume,
    rejectResume,
    getResumeStats,
};
//# sourceMappingURL=resume.service.js.map