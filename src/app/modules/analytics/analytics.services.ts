import { User } from '../User/user.model';
import { Job } from '../jobs/job.model';
import { JobApplication } from '../jobs/Jobaplications/Jobaplications.model';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS SERVICES - Admin Dashboard Statistics
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW STATS
// ─────────────────────────────────────────────────────────────────────────────

const getOverviewStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    shortlistedApplications
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'ACTIVE' }),
    Job.countDocuments(),
    Job.countDocuments({ isActive: true }),
    JobApplication.countDocuments(),
    JobApplication.countDocuments({ applicationStatus: 'Pending' }),
    JobApplication.countDocuments({ applicationStatus: 'Shortlisted' })
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
  const [
    usersByRole,
    usersByStatus,
    recentUsers,
    usersWithCompleteProfile,
    usersWithJobAlerts
  ] = await Promise.all([
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role status profilePhoto createdAt'),
    User.countDocuments({ profileCompleteness: { $gte: 80 } }),
    User.countDocuments({ 'jobAlertPreferences.enabled': true })
  ]);

  // Get user registration trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const registrationTrend = await User.aggregate([
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
    }, {} as Record<string, number>),
    byStatus: usersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>),
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
  const [
    jobsByCategory,
    jobsByType,
    jobsByLocation,
    recentJobs,
    featuredJobs,
    expiredJobs
  ] = await Promise.all([
    Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Job.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Job.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title slug companyName jobType location isActive createdAt'),
    Job.countDocuments({ isFeatured: true }),
    Job.countDocuments({ 
      applicationDeadline: { $lt: new Date() },
      isActive: true 
    })
  ]);

  // Jobs posted trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const jobPostingTrend = await Job.aggregate([
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
    }, {} as Record<string, number>),
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
  const [
    applicationsByStatus,
    topJobsByApplications,
    recentApplications,
    applicationTrend
  ] = await Promise.all([
    JobApplication.aggregate([
      { $group: { _id: '$applicationStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    JobApplication.aggregate([
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
    JobApplication.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('jobId', 'title companyName')
      .populate('userId', 'name email profilePhoto'),
    // Application trend (last 30 days)
    (async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return JobApplication.aggregate([
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
    }, {} as Record<string, number>),
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
  const [
    totalApplications,
    shortlisted,
    selected,
    rejected
  ] = await Promise.all([
    JobApplication.countDocuments(),
    JobApplication.countDocuments({ applicationStatus: 'Shortlisted' }),
    JobApplication.countDocuments({ applicationStatus: 'Selected' }),
    JobApplication.countDocuments({ applicationStatus: 'Rejected' })
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

export const AnalyticsServices = {
  getOverviewStats,
  getUserStats,
  getJobStats,
  getApplicationStats,
  getDashboardData,
  getConversionMetrics
};
