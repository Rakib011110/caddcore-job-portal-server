import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import { Company } from '../Company/company.model';
import { EmployerFollowup } from './employerFollowup.model';
import { IEmployerFollowup, IFollowupFilters } from './employerFollowup.interface';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a company's display name.
 *
 * Company documents do not store a name - it lives on the linked User, which is
 * why this has to populate rather than read a field. The result is snapshotted
 * onto the follow-up so the log survives the company being renamed.
 */
const resolveCompanyName = async (companyId: string): Promise<string> => {
  const company = await Company.findById(companyId).populate('userId', 'name');

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, 'Company not found');
  }

  return (company.userId as any)?.name || company.slug || 'Unknown Company';
};

/** Turn request filters into a Mongo query. */
const buildQuery = (filters: IFollowupFilters): Record<string, unknown> => {
  const query: Record<string, any> = {};

  if (filters.companyId) query.companyId = filters.companyId;
  if (filters.contactMethod) query.contactMethod = filters.contactMethod;
  if (filters.purpose) query.purpose = filters.purpose;
  if (filters.outcome) query.outcome = filters.outcome;
  if (filters.hiringNeed) query.hiringNeed = filters.hiringNeed;

  if (filters.pendingActionsOnly) {
    query.isNextActionDone = false;
    query.nextAction = { $exists: true, $ne: '' };
  }

  if (filters.from || filters.to) {
    query.contactDate = {};
    if (filters.from) query.contactDate.$gte = new Date(filters.from);
    if (filters.to) {
      // `to` is an inclusive day: push to the end of it so a same-day
      // follow-up is not silently excluded.
      const to = new Date(filters.to);
      to.setHours(23, 59, 59, 999);
      query.contactDate.$lte = to;
    }
  }

  if (filters.search) {
    const term = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { followupId: term },
      { companyNameSnapshot: term },
      { contactPerson: term },
      { response: term },
      { nextAction: term },
    ];
  }

  return query;
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

const createFollowup = async (
  payload: Partial<IEmployerFollowup>,
  recordedBy: string
): Promise<IEmployerFollowup> => {
  if (!payload.companyId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'companyId is required');
  }

  const companyName = await resolveCompanyName(String(payload.companyId));

  const followup = await EmployerFollowup.create({
    ...payload,
    companyNameSnapshot: companyName,
    recordedBy: new Types.ObjectId(recordedBy),
  });

  return followup;
};

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

const getAllFollowups = async (filters: IFollowupFilters = {}) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const query = buildQuery(filters);

  const [data, total] = await Promise.all([
    EmployerFollowup.find(query)
      .populate({
        path: 'companyId',
        select: 'slug industry city country status userId',
        populate: { path: 'userId', select: 'name email mobileNumber' },
      })
      .populate('recordedBy', 'name email')
      .sort({ contactDate: -1 })
      .skip(skip)
      .limit(limit),
    EmployerFollowup.countDocuments(query),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getFollowupById = async (id: string): Promise<IEmployerFollowup> => {
  const followup = await EmployerFollowup.findById(id)
    .populate({
      path: 'companyId',
      select: 'slug industry city country status userId',
      populate: { path: 'userId', select: 'name email mobileNumber' },
    })
    .populate('recordedBy', 'name email');

  if (!followup) {
    throw new AppError(httpStatus.NOT_FOUND, 'Follow-up not found');
  }

  return followup;
};

/** Every follow-up for one employer, oldest last - the relationship history. */
const getFollowupsByCompany = async (companyId: string) =>
  EmployerFollowup.find({ companyId })
    .populate('recordedBy', 'name email')
    .sort({ contactDate: -1 });

/**
 * Next actions that are open and already due.
 *
 * This is the working queue for the placement cell, so it is capped and sorted
 * by how overdue an item is rather than paginated.
 */
const getDueFollowups = async (limit = 50) =>
  EmployerFollowup.find({
    isNextActionDone: false,
    nextActionDate: { $lte: new Date() },
    nextAction: { $exists: true, $ne: '' },
  })
    .populate({
      path: 'companyId',
      select: 'slug userId',
      populate: { path: 'userId', select: 'name email' },
    })
    .sort({ nextActionDate: 1 })
    .limit(limit);

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE / DELETE
// ─────────────────────────────────────────────────────────────────────────────

const updateFollowup = async (
  id: string,
  payload: Partial<IEmployerFollowup>
): Promise<IEmployerFollowup> => {
  // followupId and recordedBy are the audit trail - an edit must not rewrite
  // who made the call or renumber the reference other records already quote.
  const { followupId, recordedBy, ...safePayload } = payload as any;

  const updated = await EmployerFollowup.findByIdAndUpdate(id, safePayload, {
    new: true,
    runValidators: true,
  }).populate('recordedBy', 'name email');

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Follow-up not found');
  }

  return updated;
};

/** Tick off the next action without touching anything else. */
const markActionDone = async (id: string): Promise<IEmployerFollowup> => {
  const updated = await EmployerFollowup.findByIdAndUpdate(
    id,
    { isNextActionDone: true },
    { new: true }
  );

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Follow-up not found');
  }

  return updated;
};

const deleteFollowup = async (id: string): Promise<void> => {
  const deleted = await EmployerFollowup.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Follow-up not found');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Headline numbers for the follow-up screen.
 *
 * `employersContacted` counts DISTINCT companies, not follow-ups - it feeds the
 * "Employers Contacted" column of the monthly KPI sheet, where calling one
 * employer five times is still one employer.
 */
const getFollowupStats = async (from?: string, to?: string) => {
  const match: Record<string, any> = {};

  if (from || to) {
    match.contactDate = {};
    if (from) match.contactDate.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      match.contactDate.$lte = end;
    }
  }

  const [totals, byOutcome, byMethod, byHiringNeed, distinctCompanies, pendingActions] =
    await Promise.all([
      EmployerFollowup.countDocuments(match),
      EmployerFollowup.aggregate([
        { $match: match },
        { $group: { _id: '$outcome', count: { $sum: 1 } } },
      ]),
      EmployerFollowup.aggregate([
        { $match: match },
        { $group: { _id: '$contactMethod', count: { $sum: 1 } } },
      ]),
      EmployerFollowup.aggregate([
        { $match: match },
        { $group: { _id: '$hiringNeed', count: { $sum: 1 } } },
      ]),
      EmployerFollowup.distinct('companyId', match),
      EmployerFollowup.countDocuments({
        ...match,
        isNextActionDone: false,
        nextAction: { $exists: true, $ne: '' },
      }),
    ]);

  const toMap = (rows: Array<{ _id: string; count: number }>) =>
    rows.reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[row._id] = row.count;
      return acc;
    }, {});

  return {
    totalFollowups: totals,
    employersContacted: distinctCompanies.length,
    pendingActions,
    byOutcome: toMap(byOutcome),
    byMethod: toMap(byMethod),
    byHiringNeed: toMap(byHiringNeed),
  };
};

export const EmployerFollowupService = {
  createFollowup,
  getAllFollowups,
  getFollowupById,
  getFollowupsByCompany,
  getDueFollowups,
  updateFollowup,
  markActionDone,
  deleteFollowup,
  getFollowupStats,
};
