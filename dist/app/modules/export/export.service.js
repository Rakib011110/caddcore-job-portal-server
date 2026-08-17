"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHEET_FILENAMES = exports.isSheetKey = exports.SHEET_KEYS = exports.SHEET_BUILDERS = exports.buildDashboardSheet = exports.buildKpiSheet = exports.buildFollowupSheet = exports.buildPlacementSheet = exports.buildInterviewSheet = exports.buildApplicationSheet = exports.buildVacancySheet = exports.buildEmployerSheet = exports.buildStudentSheet = void 0;
const user_model_1 = require("../User/user.model");
const job_model_1 = require("../jobs/job.model");
const Jobaplications_model_1 = require("../jobs/Jobaplications/Jobaplications.model");
const company_model_1 = require("../Company/company.model");
const verification_model_1 = require("../Verification/verification.model");
const employerFollowup_model_1 = require("../EmployerFollowup/employerFollowup.model");
const resume_model_1 = require("../Resume/resume.model");
const analytics_services_1 = require("../analytics/analytics.services");
const config_1 = __importDefault(require("../../../config"));
const export_workbook_1 = require("./export.workbook");
/** A date-range match on one field, or `{}` when no range was asked for. */
const dateRangeMatch = (field, filters) => {
    if (!filters.from && !filters.to)
        return {};
    const range = {};
    if (filters.from)
        range.$gte = new Date(filters.from);
    if (filters.to) {
        const end = new Date(filters.to);
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
    }
    return { [field]: range };
};
// ─────────────────────────────────────────────────────────────────────────────
// PORTAL LINKS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Base URL of the portal itself, without a trailing slash.
 *
 * Every link in an exported sheet points back here rather than at a raw file
 * host. A Cloudinary or Drive URL in a spreadsheet is a liability: it can be
 * opened by anyone it is forwarded to, it breaks when the file is replaced, and
 * it shows the uploaded document rather than the CV the institute approved.
 * A portal link is access-controlled, always current, and lands the reader on
 * the reviewed CV with a download button already on the page.
 */
const portalBase = () => (config_1.default.client_url || 'http://localhost:3000').replace(/\/+$/, '');
/** Candidate profile - renders their APPROVED CV, falling back to the profile. */
const candidateUrl = (userId) => userId ? `${portalBase()}/candidates/${String(userId)}` : '';
/** The exact CV that was submitted with one application, frozen at apply time. */
const applicationCvUrl = (applicationId) => applicationId ? `${portalBase()}/applications/${String(applicationId)}/cv` : '';
/** Public job posting. */
const jobUrl = (slug) => slug ? `${portalBase()}/jobs/${slug}` : '';
/** Employer profile page. */
const companyUrl = (slug) => slug ? `${portalBase()}/companies/${slug}` : '';
const generatedNote = (count) => `${count} record${count === 1 ? '' : 's'} · generated ${new Date()
    .toISOString()
    .replace('T', ' ')
    .slice(0, 16)} UTC · CADD CORE Job Portal`;
/**
 * Job readiness, derived rather than stored.
 *
 * The institute's sheet has a "Job Readiness" column that used to be filled in
 * by hand. Storing it would mean a field that goes stale the moment a student
 * updates their profile, so it is computed from what the portal already knows:
 * a complete profile, an uploaded CV, and an explicit willingness to be hired.
 */
const jobReadiness = (user, resume) => {
    const completeness = user.profileCompleteness || 0;
    // An approved CV in the builder counts as much as an uploaded file - most
    // candidates now do one or the other, not both.
    const hasCv = Boolean(user.cvUrl) || resume?.status === 'approved';
    const isOpen = Boolean(user.isOpenToWork);
    const isVerified = Boolean(user.caddcoreVerification?.isVerified);
    if (completeness >= 80 && hasCv && isOpen && isVerified)
        return 'Ready - Verified';
    if (completeness >= 80 && hasCv && isOpen)
        return 'Ready';
    if (completeness >= 50 && hasCv)
        return 'Almost Ready';
    if (completeness >= 50)
        return 'Profile OK - No CV';
    return 'Not Ready';
};
// ─────────────────────────────────────────────────────────────────────────────
// 01 STUDENT DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const buildStudentSheet = async (filters = {}) => {
    const students = await user_model_1.User.find({
        role: { $in: ['USER', 'STUDENT'] },
        ...dateRangeMatch('createdAt', filters),
    })
        .select('name email mobileNumber studentId department address city country ' +
        'totalExperienceYears cvUrl socialLinks preferredLocations preferredJobTypes ' +
        'availableFrom isOpenToWork jobSeekingStatus profileCompleteness ' +
        'caddcoreVerification jobAlertPreferences placementNotes status createdAt')
        .sort({ createdAt: -1 })
        .lean();
    const studentIds = students.map((s) => s._id);
    /**
     * Three lookups, each keyed by user, instead of a populate per row.
     *
     * The resume one matters most: the CV builder writes portfolio links and
     * years of experience to the RESUME document, not to the user profile. Read
     * only `User` and those two columns come out blank on every single row even
     * though the candidate filled them in.
     */
    const [verifications, resumes, hires] = await Promise.all([
        verification_model_1.VerificationRequest.find({ userId: { $in: studentIds }, status: 'approved' })
            .select('userId batchNo coursesClaimed enrollmentYear')
            .lean(),
        resume_model_1.Resume.find({ userId: { $in: studentIds }, isDeleted: { $ne: true } })
            .select('userId status socialLinks totalExperienceYears fileUrl updatedAt')
            .sort({ updatedAt: -1 })
            .lean(),
        // Placement status has to come from the applications, not from
        // `jobSeekingStatus` - that flag is only ever set by the platinum badge
        // upgrade, so it stays "not_looking" for candidates who were actually hired.
        Jobaplications_model_1.JobApplication.find({
            userId: { $in: studentIds },
            applicationStatus: { $in: ['Selected', 'Offer Accepted'] },
        })
            .select('userId')
            .lean(),
    ]);
    const verificationByUser = new Map(verifications.map((v) => [String(v.userId), v]));
    // Sorted newest-first above, so the first resume seen per user wins. An
    // approved one always beats a newer draft - that is the CV the institute
    // stands behind.
    const resumeByUser = new Map();
    for (const resume of resumes) {
        const key = String(resume.userId);
        const existing = resumeByUser.get(key);
        if (!existing || (resume.status === 'approved' && existing.status !== 'approved')) {
            resumeByUser.set(key, resume);
        }
    }
    const placedUsers = new Set(hires.map((h) => String(h.userId)));
    const rows = students.map((student) => {
        const verification = verificationByUser.get(String(student._id));
        const resume = resumeByUser.get(String(student._id));
        const alerts = student.jobAlertPreferences;
        const courses = verification?.coursesClaimed?.map((c) => c.courseName) ||
            student.caddcoreVerification?.courses?.map((c) => c.courseName) ||
            [];
        const experienceYears = student.totalExperienceYears ?? resume?.totalExperienceYears;
        // The candidate's own portfolio is external by nature - it is their Behance
        // or GitHub, and there is nothing on our side to point at instead. When
        // they have not given one, fall back to their portal profile so the cell is
        // still something a reader can click.
        const portfolio = resume?.socialLinks?.portfolio ||
            resume?.socialLinks?.website ||
            resume?.socialLinks?.github ||
            resume?.socialLinks?.linkedin ||
            student.socialLinks?.portfolio ||
            student.socialLinks?.linkedin ||
            candidateUrl(student._id);
        // Job alerts are where candidates actually set their preferences; the
        // profile-level arrays exist but have no form behind them yet.
        const locations = student.preferredLocations?.length
            ? student.preferredLocations
            : alerts?.locations;
        const jobTypes = student.preferredJobTypes?.length
            ? student.preferredJobTypes
            : alerts?.jobTypes;
        return [
            student.studentId || '',
            student.name || '',
            student.mobileNumber || '',
            student.email || '',
            (0, export_workbook_1.xlsxList)(courses),
            student.department || '',
            verification?.batchNo || student.caddcoreVerification?.batchNo || '',
            experienceYears ? `${experienceYears} yr` : 'Fresher',
            // Always the portal page, never the raw file. It shows the approved CV
            // with a download button, and it is never blank.
            candidateUrl(student._id),
            portfolio,
            (0, export_workbook_1.xlsxList)(alerts?.categories),
            (0, export_workbook_1.xlsxList)(locations),
            (0, export_workbook_1.xlsxList)(jobTypes),
            student.availableFrom ? (0, export_workbook_1.xlsxDate)(student.availableFrom) : 'Immediate',
            jobReadiness(student, resume),
            placedUsers.has(String(student._id)) ? 'Placed' : 'Not Placed',
            student.placementNotes || '',
        ];
    });
    return {
        name: '01 Student Database',
        columns: [
            { header: 'Student ID' },
            { header: 'Student Name', width: 24 },
            { header: 'Phone' },
            { header: 'Email', width: 28 },
            { header: 'Course', width: 30 },
            { header: 'Department' },
            { header: 'Batch' },
            { header: 'Experience Level' },
            { header: 'CV Link', width: 30 },
            { header: 'Portfolio Link', width: 30 },
            { header: 'Preferred Industry', width: 24 },
            { header: 'Preferred Location', width: 24 },
            { header: 'Job Type' },
            { header: 'Availability', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Job Readiness' },
            { header: 'Placement Status' },
            { header: 'Notes', width: 40 },
        ],
        rows,
        note: generatedNote(rows.length),
    };
};
exports.buildStudentSheet = buildStudentSheet;
// ─────────────────────────────────────────────────────────────────────────────
// 02 EMPLOYER DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const buildEmployerSheet = async (filters = {}) => {
    const query = { ...dateRangeMatch('createdAt', filters) };
    if (filters.status)
        query.status = filters.status;
    const companies = await company_model_1.Company.find(query)
        .populate('userId', 'name email mobileNumber')
        .sort({ createdAt: -1 })
        .lean();
    // Which roles each employer is actually hiring for - not a stored field, so
    // it is assembled from their live job posts in one grouped query.
    const roleRows = await job_model_1.Job.aggregate([
        { $match: { isActive: true, company: { $ne: null } } },
        { $group: { _id: '$company', roles: { $addToSet: '$title' }, openJobs: { $sum: 1 } } },
    ]);
    const rolesByCompany = new Map(roleRows.map((row) => [String(row._id), row]));
    const rows = companies.map((company) => {
        const hiring = rolesByCompany.get(String(company._id));
        return [
            String(company._id),
            company.userId?.name || company.slug || '',
            company.industry || '',
            [company.city, company.country].filter(Boolean).join(', '),
            company.contactPerson?.name || company.userId?.name || '',
            company.contactPerson?.designation || '',
            company.contactPerson?.phone || company.userId?.mobileNumber || '',
            company.contactPerson?.email || company.userId?.email || '',
            company.website || '',
            (0, export_workbook_1.xlsxList)(hiring?.roles?.slice(0, 10)),
            hiring?.openJobs || 0,
            company.companySize || '',
            company.status || '',
            (0, export_workbook_1.xlsxBool)(company.isVerified),
            company.totalJobsPosted || 0,
            company.totalApplicationsReceived || 0,
            (0, export_workbook_1.xlsxDate)(company.createdAt),
            companyUrl(company.slug),
        ];
    });
    return {
        name: '02 Employer Database',
        columns: [
            { header: 'Employer ID', width: 26 },
            { header: 'Company Name', width: 28 },
            { header: 'Industry', width: 22 },
            { header: 'Location', width: 22 },
            { header: 'Contact Person', width: 22 },
            { header: 'Designation', width: 20 },
            { header: 'Phone' },
            { header: 'Email', width: 28 },
            { header: 'Website', width: 28 },
            { header: 'Hiring Roles', width: 36 },
            { header: 'Open Vacancies' },
            { header: 'Company Size' },
            { header: 'Status' },
            { header: 'Verified' },
            { header: 'Total Jobs Posted' },
            { header: 'Applications Received' },
            { header: 'Registered On', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Employer Page', width: 42 },
        ],
        rows,
        note: generatedNote(rows.length),
    };
};
exports.buildEmployerSheet = buildEmployerSheet;
// ─────────────────────────────────────────────────────────────────────────────
// 03 VACANCY DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const buildVacancySheet = async (filters = {}) => {
    const query = { ...dateRangeMatch('createdAt', filters) };
    if (filters.companyId)
        query.company = filters.companyId;
    const jobs = await job_model_1.Job.find(query).sort({ createdAt: -1 }).lean();
    const rows = jobs.map((job) => [
        String(job._id),
        job.companyName || '',
        job.title || '',
        job.category || '',
        job.location || '',
        job.jobType || '',
        job.salaryRange ||
            (job.salaryMin && job.salaryMax
                ? `${job.salaryMin} - ${job.salaryMax} ${job.salaryCurrency || ''}`.trim()
                : ''),
        job.experience || '',
        (0, export_workbook_1.xlsxList)(job.requiredSkills),
        (0, export_workbook_1.xlsxDate)(job.applicationDeadline),
        jobUrl(job.slug),
        job.vacancies || 0,
        job.locationType || '',
        (0, export_workbook_1.xlsxBool)(job.isActive),
        (0, export_workbook_1.xlsxDate)(job.datePosted || job.createdAt),
        (0, export_workbook_1.xlsxText)(job.description, 300),
    ]);
    return {
        name: '03 Vacancy Database',
        columns: [
            { header: 'Vacancy ID', width: 26 },
            { header: 'Company Name', width: 28 },
            { header: 'Job Title', width: 28 },
            { header: 'Category', width: 22 },
            { header: 'Location', width: 22 },
            { header: 'Employment Type' },
            { header: 'Salary Range', width: 24 },
            { header: 'Experience Required' },
            { header: 'Required Skills', width: 40 },
            { header: 'Deadline', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Source/Link', width: 30 },
            { header: 'No. of Vacancies' },
            { header: 'Work Mode' },
            { header: 'Active' },
            { header: 'Posted On', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Description', width: 48 },
        ],
        rows,
        note: generatedNote(rows.length),
    };
};
exports.buildVacancySheet = buildVacancySheet;
// ─────────────────────────────────────────────────────────────────────────────
// 04 APPLICATION TRACKER
// ─────────────────────────────────────────────────────────────────────────────
/** Populate shape shared by the application, interview and placement sheets. */
const applicationPopulate = [
    { path: 'jobId', select: 'title companyName jobType location company' },
    { path: 'userId', select: 'name email mobileNumber studentId cvUrl' },
];
const buildApplicationSheet = async (filters = {}) => {
    const query = { ...dateRangeMatch('appliedAt', filters) };
    if (filters.status)
        query.applicationStatus = filters.status;
    const applications = await Jobaplications_model_1.JobApplication.find(query)
        .populate([...applicationPopulate])
        .sort({ appliedAt: -1 })
        .lean();
    const rows = applications.map((app) => {
        // "Portfolio Sent" means a portfolio link travelled with the application -
        // read it off the frozen resume snapshot, which is what the employer
        // actually received. It is not the same thing as a cover letter.
        const snapshotLinks = app.resumeSnapshot?.socialLinks;
        const portfolioSent = Boolean(snapshotLinks?.portfolio || snapshotLinks?.website || snapshotLinks?.github);
        return [
            String(app._id),
            app.userId?.studentId || '',
            app.userId?.name || '',
            app.jobId?.companyName || '',
            app.jobId?.title || '',
            (0, export_workbook_1.xlsxDate)(app.appliedAt),
            (0, export_workbook_1.xlsxBool)(Boolean(app.resumeSnapshot || app.userId?.cvUrl)),
            (0, export_workbook_1.xlsxBool)(portfolioSent),
            app.applicationMethod || 'Portal',
            app.applicationStatus || '',
            (0, export_workbook_1.xlsxDate)(app.currentInterview?.scheduledDate),
            app.currentInterview?.type || '',
            app.currentInterview?.status || '',
            (0, export_workbook_1.xlsxDate)(app.followUpDate),
            app.followUpStatus || '',
            app.internalNotes || '',
            applicationCvUrl(app._id),
            candidateUrl(app.userId?._id),
        ];
    });
    return {
        name: '04 Application Tracker',
        columns: [
            { header: 'Application ID', width: 26 },
            { header: 'Student ID' },
            { header: 'Student Name', width: 24 },
            { header: 'Company Name', width: 26 },
            { header: 'Job Title', width: 26 },
            { header: 'Application Date', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'CV Sent' },
            { header: 'Portfolio Sent' },
            { header: 'Application Method' },
            { header: 'Application Status', width: 20 },
            { header: 'Interview Date', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Interview Round' },
            { header: 'Result' },
            { header: 'Follow-up Date', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Follow-up Status' },
            { header: 'Notes', width: 40 },
            { header: 'Submitted CV Link', width: 42 },
            { header: 'Candidate Profile', width: 42 },
        ],
        rows,
        note: generatedNote(rows.length),
    };
};
exports.buildApplicationSheet = buildApplicationSheet;
// ─────────────────────────────────────────────────────────────────────────────
// 05 INTERVIEW TRACKER
// ─────────────────────────────────────────────────────────────────────────────
/**
 * One row per INTERVIEW, not per application.
 *
 * A candidate who sat three rounds is three rows here, which is what makes this
 * sheet different from the tracker above - the tracker only ever shows the
 * current round.
 */
const buildInterviewSheet = async (filters = {}) => {
    const applications = await Jobaplications_model_1.JobApplication.find({
        interviews: { $exists: true, $ne: [] },
    })
        .populate([...applicationPopulate])
        .sort({ appliedAt: -1 })
        .lean();
    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(filters.to) : null;
    if (to)
        to.setHours(23, 59, 59, 999);
    const rows = [];
    for (const app of applications) {
        for (const interview of app.interviews || []) {
            const scheduled = interview.scheduledDate
                ? new Date(interview.scheduledDate)
                : null;
            // The range filters on the INTERVIEW date, not the application date.
            if (from && (!scheduled || scheduled < from))
                continue;
            if (to && (!scheduled || scheduled > to))
                continue;
            rows.push([
                String(app._id),
                app.userId?.studentId || '',
                app.userId?.name || '',
                app.userId?.mobileNumber || '',
                app.jobId?.companyName || '',
                app.jobId?.title || '',
                (0, export_workbook_1.xlsxDate)(interview.scheduledDate),
                interview.scheduledTime || '',
                interview.type || '',
                interview.status || '',
                interview.isOnline ? 'Online' : 'Offline',
                interview.isOnline
                    ? interview.meetingPlatform || 'Online'
                    : interview.location || '',
                (0, export_workbook_1.xlsxList)(interview.interviewers?.map((i) => i.name)),
                interview.feedback?.rating ?? '',
                interview.feedback?.recommendation || '',
                interview.feedback?.comments || interview.internalNotes || '',
                candidateUrl(app.userId?._id),
            ]);
        }
    }
    return {
        name: '05 Interview Tracker',
        columns: [
            { header: 'Application ID', width: 26 },
            { header: 'Student ID' },
            { header: 'Student Name', width: 24 },
            { header: 'Phone' },
            { header: 'Company Name', width: 26 },
            { header: 'Job Title', width: 26 },
            { header: 'Interview Date', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Interview Time' },
            { header: 'Interview Type' },
            { header: 'Status' },
            { header: 'Mode' },
            { header: 'Platform / Venue', width: 24 },
            { header: 'Interviewers', width: 26 },
            { header: 'Rating (1-5)' },
            { header: 'Recommendation' },
            { header: 'Feedback', width: 40 },
            { header: 'Candidate Profile', width: 42 },
        ],
        rows,
        note: generatedNote(rows.length),
    };
};
exports.buildInterviewSheet = buildInterviewSheet;
// ─────────────────────────────────────────────────────────────────────────────
// 06 PLACEMENT RECORD
// ─────────────────────────────────────────────────────────────────────────────
const buildPlacementSheet = async (filters = {}) => {
    // A placement is a hire: Selected, or an offer the candidate accepted.
    const query = {
        applicationStatus: { $in: ['Selected', 'Offer Accepted'] },
        ...dateRangeMatch('updatedAt', filters),
    };
    const placements = await Jobaplications_model_1.JobApplication.find(query)
        .populate([
        { path: 'jobId', select: 'title companyName jobType location company category' },
        {
            path: 'userId',
            select: 'name email mobileNumber studentId department caddcoreVerification',
        },
    ])
        .sort({ updatedAt: -1 })
        .lean();
    const rows = placements.map((app) => [
        String(app._id),
        app.userId?.studentId || '',
        app.userId?.name || '',
        app.userId?.mobileNumber || '',
        app.jobId?.companyName || '',
        app.jobId?.category || '',
        app.jobId?.title || '',
        (0, export_workbook_1.xlsxDate)(app.offerDetails?.joiningDate),
        app.offerDetails?.salary ?? '',
        app.jobId?.jobType || '',
        app.jobId?.location || '',
        app.placement?.source || 'Portal',
        app.placement?.recruitmentContact || '',
        app.placement?.employmentStatus || '',
        app.placement?.sixMonthFollowUpStatus || 'Pending',
        (0, export_workbook_1.xlsxBool)(app.placement?.verified),
        app.placement?.notes || '',
        candidateUrl(app.userId?._id),
    ]);
    return {
        name: '06 Placement Record',
        columns: [
            { header: 'Placement ID', width: 26 },
            { header: 'Student ID' },
            { header: 'Student Name', width: 24 },
            { header: 'Phone' },
            { header: 'Company Name', width: 26 },
            { header: 'Industry', width: 22 },
            { header: 'Position', width: 26 },
            { header: 'Joining Date', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Salary', numFmt: export_workbook_1.MONEY_FORMAT },
            { header: 'Employment Type' },
            { header: 'Location', width: 22 },
            { header: 'Placement Source' },
            { header: 'Recruitment Contact', width: 22 },
            { header: 'Employment Status' },
            { header: '6-Month Follow-up', width: 20 },
            { header: 'Placement Verified' },
            { header: 'Notes', width: 40 },
            { header: 'Candidate Profile', width: 42 },
        ],
        rows,
        note: generatedNote(rows.length),
    };
};
exports.buildPlacementSheet = buildPlacementSheet;
// ─────────────────────────────────────────────────────────────────────────────
// 07 EMPLOYER FOLLOW-UP
// ─────────────────────────────────────────────────────────────────────────────
const buildFollowupSheet = async (filters = {}) => {
    const query = { ...dateRangeMatch('contactDate', filters) };
    if (filters.companyId)
        query.companyId = filters.companyId;
    const followups = await employerFollowup_model_1.EmployerFollowup.find(query)
        .populate('recordedBy', 'name')
        .sort({ contactDate: -1 })
        .lean();
    const rows = followups.map((followup) => [
        followup.followupId || '',
        String(followup.companyId || ''),
        followup.companyNameSnapshot || '',
        (0, export_workbook_1.xlsxDate)(followup.contactDate),
        followup.contactPerson || '',
        followup.contactMethod || '',
        followup.purpose || '',
        followup.response || '',
        followup.hiringNeed || '',
        followup.nextAction || '',
        (0, export_workbook_1.xlsxDate)(followup.nextActionDate),
        followup.outcome || '',
        (0, export_workbook_1.xlsxList)(followup.rolesDiscussed),
        followup.vacanciesOffered ?? '',
        followup.recordedBy?.name || '',
        followup.notes || '',
    ]);
    return {
        name: '07 Employer Follow-up',
        columns: [
            { header: 'Follow-up ID' },
            { header: 'Employer ID', width: 26 },
            { header: 'Company Name', width: 28 },
            { header: 'Contact Date', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Contact Person', width: 22 },
            { header: 'Contact Method' },
            { header: 'Purpose', width: 22 },
            { header: 'Response', width: 40 },
            { header: 'Hiring Need' },
            { header: 'Next Action', width: 32 },
            { header: 'Next Action Date', numFmt: export_workbook_1.DATE_FORMAT },
            { header: 'Outcome' },
            { header: 'Roles Discussed', width: 28 },
            { header: 'Vacancies Offered' },
            { header: 'Recorded By', width: 20 },
            { header: 'Notes', width: 40 },
        ],
        rows,
        note: rows.length
            ? generatedNote(rows.length)
            : 'No follow-ups recorded yet. Add them from Admin → Employer Follow-up.',
    };
};
exports.buildFollowupSheet = buildFollowupSheet;
// ─────────────────────────────────────────────────────────────────────────────
// 08 MONTHLY KPI
// ─────────────────────────────────────────────────────────────────────────────
const buildKpiSheet = async (filters = {}) => {
    const kpi = await analytics_services_1.AnalyticsServices.getMonthlyKPI(filters.from, filters.to);
    const rows = kpi.months.map((month) => [
        month.label,
        month.activeStudents,
        month.jobReadyStudents,
        month.employersContacted,
        month.activeHiringEmployers,
        month.vacanciesCollected,
        month.applications,
        month.interviews,
        month.selected,
        month.placed,
        month.placementRate / 100, // Excel percent format expects a fraction.
    ]);
    // Totals row, so the sheet answers "how did the year go" without a formula.
    rows.push([
        'TOTAL',
        kpi.totals.activeStudents,
        kpi.totals.jobReadyStudents,
        kpi.totals.employersContacted,
        kpi.totals.activeHiringEmployers,
        kpi.totals.vacanciesCollected,
        kpi.totals.applications,
        kpi.totals.interviews,
        kpi.totals.selected,
        kpi.totals.placed,
        kpi.totals.applications > 0 ? kpi.totals.placed / kpi.totals.applications : 0,
    ]);
    return {
        name: '08 Monthly KPI',
        columns: [
            { header: 'Month', width: 16 },
            { header: 'Active Students' },
            { header: 'Job-ready Students' },
            { header: 'Employers Contacted' },
            { header: 'Active Hiring Employers' },
            { header: 'Vacancies Collected' },
            { header: 'Applications' },
            { header: 'Interviews' },
            { header: 'Selected' },
            { header: 'Placed' },
            { header: 'Placement Rate %', numFmt: '0.0%' },
        ],
        rows,
        note: 'Placement Rate % = Placed ÷ Applications for that month. Counts are by the month the event happened in.',
    };
};
exports.buildKpiSheet = buildKpiSheet;
// ─────────────────────────────────────────────────────────────────────────────
// 09 DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
/**
 * A flat Metric/Value summary rather than a chart.
 *
 * Charts do not survive a generated export cleanly, and the number is what
 * anyone reading this sheet actually wants. The funnel is laid out top to
 * bottom so the drop-off between stages is visible at a glance.
 */
const buildDashboardSheet = async () => {
    const [overview, conversions] = await Promise.all([
        analytics_services_1.AnalyticsServices.getOverviewStats(),
        analytics_services_1.AnalyticsServices.getConversionMetrics(),
    ]);
    const [totalCompanies, activeCompanies, jobReadyStudents, placedStudents, followupCount] = await Promise.all([
        company_model_1.Company.countDocuments(),
        company_model_1.Company.countDocuments({ status: 'APPROVED' }),
        user_model_1.User.countDocuments({
            role: { $in: ['USER', 'STUDENT'] },
            profileCompleteness: { $gte: 80 },
        }),
        user_model_1.User.countDocuments({ jobSeekingStatus: 'hired' }),
        employerFollowup_model_1.EmployerFollowup.countDocuments(),
    ]);
    const rows = [
        ['Total Students', overview.users.total, 'All registered candidate accounts'],
        ['Job-ready Students', jobReadyStudents, 'Profile completeness of 80% or more'],
        ['Active Job Seekers', overview.users.active, 'Accounts with ACTIVE status'],
        ['Total Employers', totalCompanies, 'All registered companies'],
        ['Active Hiring Employers', activeCompanies, 'Companies approved to post jobs'],
        ['Vacancies Collected', overview.jobs.total, 'All job posts ever created'],
        ['Open Vacancies', overview.jobs.active, 'Job posts currently accepting applications'],
        ['Applications', overview.applications.total, 'All applications submitted'],
        ['Pending Applications', overview.applications.pending, 'Awaiting first review'],
        ['Shortlisted', overview.applications.shortlisted, 'Moved past initial screening'],
        ['Selected', conversions.details.selected, 'Candidates chosen by an employer'],
        ['Placed', placedStudents, 'Candidates marked hired'],
        ['Employer Follow-ups Logged', followupCount, 'Contacts recorded by the placement cell'],
        ['—', '', ''],
        ['Shortlist Rate %', `${conversions.shortlistRate}%`, 'Shortlisted ÷ total applications'],
        ['Selection Rate %', `${conversions.selectionRate}%`, 'Selected ÷ total applications'],
        ['Rejection Rate %', `${conversions.rejectionRate}%`, 'Rejected ÷ total applications'],
    ];
    return {
        name: '09 Dashboard',
        columns: [
            { header: 'Metric', width: 32 },
            { header: 'Value', width: 16 },
            { header: 'What it counts', width: 46 },
        ],
        rows,
        note: `Snapshot taken ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC. Figures are live at export time.`,
    };
};
exports.buildDashboardSheet = buildDashboardSheet;
// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
/**
 * The single source of truth for which reports exist.
 *
 * The controller validates the `:sheet` URL parameter against these keys, and
 * the full workbook is built by running all of them - so a new report is added
 * here once and appears in both places.
 */
exports.SHEET_BUILDERS = {
    students: exports.buildStudentSheet,
    employers: exports.buildEmployerSheet,
    vacancies: exports.buildVacancySheet,
    applications: exports.buildApplicationSheet,
    interviews: exports.buildInterviewSheet,
    placements: exports.buildPlacementSheet,
    followups: exports.buildFollowupSheet,
    kpi: exports.buildKpiSheet,
    dashboard: exports.buildDashboardSheet,
};
exports.SHEET_KEYS = Object.keys(exports.SHEET_BUILDERS);
const isSheetKey = (value) => typeof value === 'string' && exports.SHEET_KEYS.includes(value);
exports.isSheetKey = isSheetKey;
/** Download file name per report, without the date suffix or extension. */
exports.SHEET_FILENAMES = {
    students: 'student-database',
    employers: 'employer-database',
    vacancies: 'vacancy-database',
    applications: 'application-tracker',
    interviews: 'interview-tracker',
    placements: 'placement-record',
    followups: 'employer-followup',
    kpi: 'monthly-kpi',
    dashboard: 'dashboard-summary',
};
//# sourceMappingURL=export.service.js.map