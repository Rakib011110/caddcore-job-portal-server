"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsServices = void 0;
const user_model_1 = require("../User/user.model");
const job_model_1 = require("../jobs/job.model");
const Jobaplications_model_1 = require("../jobs/Jobaplications/Jobaplications.model");
const employerFollowup_model_1 = require("../EmployerFollowup/employerFollowup.model");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS SERVICES - Admin Dashboard Statistics
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW STATS
// ─────────────────────────────────────────────────────────────────────────────
const getOverviewStats = async () => {
    const [totalUsers, activeUsers, totalJobs, activeJobs, totalApplications, pendingApplications, shortlistedApplications] = await Promise.all([
        user_model_1.User.countDocuments(),
        user_model_1.User.countDocuments({ status: 'ACTIVE' }),
        job_model_1.Job.countDocuments(),
        job_model_1.Job.countDocuments({ isActive: true }),
        Jobaplications_model_1.JobApplication.countDocuments(),
        Jobaplications_model_1.JobApplication.countDocuments({ applicationStatus: 'Pending' }),
        Jobaplications_model_1.JobApplication.countDocuments({ applicationStatus: 'Shortlisted' })
    ]);
    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers
        },
        jobs: {
            total: totalJobs,
            active: activeJobs,
            inactive: totalJobs - activeJobs
        },
        applications: {
            total: totalApplications,
            pending: pendingApplications,
            shortlisted: shortlistedApplications
        }
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// USER STATS
// ─────────────────────────────────────────────────────────────────────────────
const getUserStats = async () => {
    const [usersByRole, usersByStatus, recentUsers, usersWithCompleteProfile, usersWithJobAlerts] = await Promise.all([
        user_model_1.User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        user_model_1.User.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        user_model_1.User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email role status profilePhoto createdAt'),
        user_model_1.User.countDocuments({ profileCompleteness: { $gte: 80 } }),
        user_model_1.User.countDocuments({ 'jobAlertPreferences.enabled': true })
    ]);
    // Get user registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const registrationTrend = await user_model_1.User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    return {
        byRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        byStatus: usersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        recentUsers,
        withCompleteProfile: usersWithCompleteProfile,
        withJobAlerts: usersWithJobAlerts,
        registrationTrend
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// JOB STATS
// ─────────────────────────────────────────────────────────────────────────────
const getJobStats = async () => {
    const [jobsByCategory, jobsByType, jobsByLocation, recentJobs, featuredJobs, expiredJobs] = await Promise.all([
        job_model_1.Job.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        job_model_1.Job.aggregate([
            { $group: { _id: '$jobType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        job_model_1.Job.aggregate([
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        job_model_1.Job.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title slug companyName jobType location isActive createdAt'),
        job_model_1.Job.countDocuments({ isFeatured: true }),
        job_model_1.Job.countDocuments({
            applicationDeadline: { $lt: new Date() },
            isActive: true
        })
    ]);
    // Jobs posted trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const jobPostingTrend = await job_model_1.Job.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    return {
        byCategory: jobsByCategory,
        byType: jobsByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        byLocation: jobsByLocation,
        recentJobs,
        featured: featuredJobs,
        expired: expiredJobs,
        postingTrend: jobPostingTrend
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION STATS
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationStats = async () => {
    const [applicationsByStatus, topJobsByApplications, recentApplications, applicationTrend] = await Promise.all([
        Jobaplications_model_1.JobApplication.aggregate([
            { $group: { _id: '$applicationStatus', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        Jobaplications_model_1.JobApplication.aggregate([
            { $group: { _id: '$jobId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'jobs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            { $unwind: '$job' },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    'job.title': 1,
                    'job.slug': 1,
                    'job.companyName': 1
                }
            }
        ]),
        Jobaplications_model_1.JobApplication.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('jobId', 'title companyName')
            .populate('userId', 'name email profilePhoto'),
        // Application trend (last 30 days)
        (async () => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return Jobaplications_model_1.JobApplication.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        })()
    ]);
    return {
        byStatus: applicationsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        topJobs: topJobsByApplications,
        recent: recentApplications,
        trend: applicationTrend
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// COMBINED DASHBOARD DATA
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardData = async () => {
    const [overview, users, jobs, applications] = await Promise.all([
        getOverviewStats(),
        getUserStats(),
        getJobStats(),
        getApplicationStats()
    ]);
    return {
        overview,
        users,
        jobs,
        applications,
        generatedAt: new Date()
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// CONVERSION METRICS
// ─────────────────────────────────────────────────────────────────────────────
const getConversionMetrics = async () => {
    const [totalApplications, shortlisted, selected, rejected] = await Promise.all([
        Jobaplications_model_1.JobApplication.countDocuments(),
        Jobaplications_model_1.JobApplication.countDocuments({ applicationStatus: 'Shortlisted' }),
        Jobaplications_model_1.JobApplication.countDocuments({ applicationStatus: 'Selected' }),
        Jobaplications_model_1.JobApplication.countDocuments({ applicationStatus: 'Rejected' })
    ]);
    return {
        shortlistRate: totalApplications > 0 ? ((shortlisted / totalApplications) * 100).toFixed(2) : 0,
        selectionRate: totalApplications > 0 ? ((selected / totalApplications) * 100).toFixed(2) : 0,
        rejectionRate: totalApplications > 0 ? ((rejected / totalApplications) * 100).toFixed(2) : 0,
        details: {
            total: totalApplications,
            shortlisted,
            selected,
            rejected
        }
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY KPI
// ─────────────────────────────────────────────────────────────────────────────
/**
 * One row per calendar month, matching the institute's KPI sheet.
 *
 * Two things here are easy to get wrong and are done deliberately:
 *
 *   - Every count is "created in that month", not "currently in that state".
 *     A student who registered in March and was placed in June contributes to
 *     March's registrations and June's placements. Counting current state per
 *     month would make history change every time someone's status changed.
 *
 *   - Months with no activity still appear, as zero rows. A sheet that silently
 *     skips July reads as "July is missing" rather than "July was quiet", and
 *     the placement rate line on the chart would jump across the gap.
 *
 * `placementRate` is placements ÷ applications for that month, which is the
 * definition the institute already reports on. It is not placements ÷ students.
 */
const getMonthlyKPI = async (from, to) => {
    // Default window: the last 12 months, inclusive of the current one.
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);
    const start = from
        ? new Date(from)
        : new Date(end.getFullYear(), end.getMonth() - 11, 1);
    start.setHours(0, 0, 0, 0);
    /** Group a collection into { 'YYYY-MM': count } over the window. */
    const countByMonth = async (model, dateField, extraMatch = {}) => {
        const rows = await model.aggregate([
            { $match: { [dateField]: { $gte: start, $lte: end }, ...extraMatch } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: `$${dateField}` } },
                    count: { $sum: 1 }
                }
            }
        ]);
        return rows.reduce((acc, row) => {
            acc[row._id] = row.count;
            return acc;
        }, {});
    };
    const [newStudents, jobReadyStudents, vacancies, applications, interviews, selected, placed, followupRows] = await Promise.all([
        countByMonth(user_model_1.User, 'createdAt', { role: { $in: ['USER', 'STUDENT'] } }),
        countByMonth(user_model_1.User, 'createdAt', {
            role: { $in: ['USER', 'STUDENT'] },
            profileCompleteness: { $gte: 80 }
        }),
        countByMonth(job_model_1.Job, 'createdAt'),
        countByMonth(Jobaplications_model_1.JobApplication, 'appliedAt'),
        // An interview counts in the month it was SCHEDULED FOR, not the month the
        // application arrived - that is what the institute reports.
        Jobaplications_model_1.JobApplication.aggregate([
            { $unwind: '$interviews' },
            { $match: { 'interviews.scheduledDate': { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m', date: '$interviews.scheduledDate' }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).then((rows) => rows.reduce((acc, row) => {
            acc[row._id] = row.count;
            return acc;
        }, {})),
        countByMonth(Jobaplications_model_1.JobApplication, 'updatedAt', { applicationStatus: 'Selected' }),
        // "Placed" means an actual joining date was recorded, which is a stricter
        // bar than "Selected" and is the number that goes in the annual report.
        Jobaplications_model_1.JobApplication.aggregate([
            {
                $match: {
                    'offerDetails.joiningDate': { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m', date: '$offerDetails.joiningDate' }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).then((rows) => rows.reduce((acc, row) => {
            acc[row._id] = row.count;
            return acc;
        }, {})),
        // Distinct employers contacted per month - one employer called five times
        // is still one employer.
        employerFollowup_model_1.EmployerFollowup.aggregate([
            { $match: { contactDate: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: '%Y-%m', date: '$contactDate' } },
                        companyId: '$companyId'
                    }
                }
            },
            { $group: { _id: '$_id.month', count: { $sum: 1 } } }
        ]).then((rows) => rows.reduce((acc, row) => {
            acc[row._id] = row.count;
            return acc;
        }, {}))
    ]);
    // Active hiring employers: companies that posted at least one job that month.
    const hiringEmployerRows = await job_model_1.Job.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, company: { $ne: null } } },
        {
            $group: {
                _id: {
                    month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    company: '$company'
                }
            }
        },
        { $group: { _id: '$_id.month', count: { $sum: 1 } } }
    ]);
    const activeHiringEmployers = hiringEmployerRows.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
    }, {});
    // Walk the window month by month so quiet months appear as zeros.
    const months = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
        const monthApplications = applications[key] || 0;
        const monthPlaced = placed[key] || 0;
        months.push({
            month: key,
            label: cursor.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
            activeStudents: newStudents[key] || 0,
            jobReadyStudents: jobReadyStudents[key] || 0,
            employersContacted: followupRows[key] || 0,
            activeHiringEmployers: activeHiringEmployers[key] || 0,
            vacanciesCollected: vacancies[key] || 0,
            applications: monthApplications,
            interviews: interviews[key] || 0,
            selected: selected[key] || 0,
            placed: monthPlaced,
            placementRate: monthApplications > 0
                ? Number(((monthPlaced / monthApplications) * 100).toFixed(1))
                : 0
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }
    return {
        from: start,
        to: end,
        months,
        totals: months.reduce((acc, month) => ({
            activeStudents: acc.activeStudents + month.activeStudents,
            jobReadyStudents: acc.jobReadyStudents + month.jobReadyStudents,
            employersContacted: acc.employersContacted + month.employersContacted,
            activeHiringEmployers: acc.activeHiringEmployers + month.activeHiringEmployers,
            vacanciesCollected: acc.vacanciesCollected + month.vacanciesCollected,
            applications: acc.applications + month.applications,
            interviews: acc.interviews + month.interviews,
            selected: acc.selected + month.selected,
            placed: acc.placed + month.placed
        }), {
            activeStudents: 0,
            jobReadyStudents: 0,
            employersContacted: 0,
            activeHiringEmployers: 0,
            vacanciesCollected: 0,
            applications: 0,
            interviews: 0,
            selected: 0,
            placed: 0
        })
    };
};
exports.AnalyticsServices = {
    getOverviewStats,
    getUserStats,
    getJobStats,
    getApplicationStats,
    getDashboardData,
    getConversionMetrics,
    getMonthlyKPI
};
//# sourceMappingURL=analytics.services.js.map