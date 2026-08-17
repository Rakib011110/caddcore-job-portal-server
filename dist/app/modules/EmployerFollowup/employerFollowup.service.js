"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerFollowupService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../error/AppError"));
const company_model_1 = require("../Company/company.model");
const employerFollowup_model_1 = require("./employerFollowup.model");
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
const resolveCompanyName = async (companyId) => {
    const company = await company_model_1.Company.findById(companyId).populate('userId', 'name');
    if (!company) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Company not found');
    }
    return company.userId?.name || company.slug || 'Unknown Company';
};
/** Turn request filters into a Mongo query. */
const buildQuery = (filters) => {
    const query = {};
    if (filters.companyId)
        query.companyId = filters.companyId;
    if (filters.contactMethod)
        query.contactMethod = filters.contactMethod;
    if (filters.purpose)
        query.purpose = filters.purpose;
    if (filters.outcome)
        query.outcome = filters.outcome;
    if (filters.hiringNeed)
        query.hiringNeed = filters.hiringNeed;
    if (filters.pendingActionsOnly) {
        query.isNextActionDone = false;
        query.nextAction = { $exists: true, $ne: '' };
    }
    if (filters.from || filters.to) {
        query.contactDate = {};
        if (filters.from)
            query.contactDate.$gte = new Date(filters.from);
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
const createFollowup = async (payload, recordedBy) => {
    if (!payload.companyId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'companyId is required');
    }
    const companyName = await resolveCompanyName(String(payload.companyId));
    const followup = await employerFollowup_model_1.EmployerFollowup.create({
        ...payload,
        companyNameSnapshot: companyName,
        recordedBy: new mongoose_1.Types.ObjectId(recordedBy),
    });
    return followup;
};
// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────
const getAllFollowups = async (filters = {}) => {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;
    const query = buildQuery(filters);
    const [data, total] = await Promise.all([
        employerFollowup_model_1.EmployerFollowup.find(query)
            .populate({
            path: 'companyId',
            select: 'slug industry city country status userId',
            populate: { path: 'userId', select: 'name email mobileNumber' },
        })
            .populate('recordedBy', 'name email')
            .sort({ contactDate: -1 })
            .skip(skip)
            .limit(limit),
        employerFollowup_model_1.EmployerFollowup.countDocuments(query),
    ]);
    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};
const getFollowupById = async (id) => {
    const followup = await employerFollowup_model_1.EmployerFollowup.findById(id)
        .populate({
        path: 'companyId',
        select: 'slug industry city country status userId',
        populate: { path: 'userId', select: 'name email mobileNumber' },
    })
        .populate('recordedBy', 'name email');
    if (!followup) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Follow-up not found');
    }
    return followup;
};
/** Every follow-up for one employer, oldest last - the relationship history. */
const getFollowupsByCompany = async (companyId) => employerFollowup_model_1.EmployerFollowup.find({ companyId })
    .populate('recordedBy', 'name email')
    .sort({ contactDate: -1 });
/**
 * Next actions that are open and already due.
 *
 * This is the working queue for the placement cell, so it is capped and sorted
 * by how overdue an item is rather than paginated.
 */
const getDueFollowups = async (limit = 50) => employerFollowup_model_1.EmployerFollowup.find({
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
const updateFollowup = async (id, payload) => {
    // followupId and recordedBy are the audit trail - an edit must not rewrite
    // who made the call or renumber the reference other records already quote.
    const { followupId, recordedBy, ...safePayload } = payload;
    const updated = await employerFollowup_model_1.EmployerFollowup.findByIdAndUpdate(id, safePayload, {
        new: true,
        runValidators: true,
    }).populate('recordedBy', 'name email');
    if (!updated) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Follow-up not found');
    }
    return updated;
};
/** Tick off the next action without touching anything else. */
const markActionDone = async (id) => {
    const updated = await employerFollowup_model_1.EmployerFollowup.findByIdAndUpdate(id, { isNextActionDone: true }, { new: true });
    if (!updated) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Follow-up not found');
    }
    return updated;
};
const deleteFollowup = async (id) => {
    const deleted = await employerFollowup_model_1.EmployerFollowup.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Follow-up not found');
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
const getFollowupStats = async (from, to) => {
    const match = {};
    if (from || to) {
        match.contactDate = {};
        if (from)
            match.contactDate.$gte = new Date(from);
        if (to) {
            const end = new Date(to);
            end.setHours(23, 59, 59, 999);
            match.contactDate.$lte = end;
        }
    }
    const [totals, byOutcome, byMethod, byHiringNeed, distinctCompanies, pendingActions] = await Promise.all([
        employerFollowup_model_1.EmployerFollowup.countDocuments(match),
        employerFollowup_model_1.EmployerFollowup.aggregate([
            { $match: match },
            { $group: { _id: '$outcome', count: { $sum: 1 } } },
        ]),
        employerFollowup_model_1.EmployerFollowup.aggregate([
            { $match: match },
            { $group: { _id: '$contactMethod', count: { $sum: 1 } } },
        ]),
        employerFollowup_model_1.EmployerFollowup.aggregate([
            { $match: match },
            { $group: { _id: '$hiringNeed', count: { $sum: 1 } } },
        ]),
        employerFollowup_model_1.EmployerFollowup.distinct('companyId', match),
        employerFollowup_model_1.EmployerFollowup.countDocuments({
            ...match,
            isNextActionDone: false,
            nextAction: { $exists: true, $ne: '' },
        }),
    ]);
    const toMap = (rows) => rows.reduce((acc, row) => {
        if (row._id)
            acc[row._id] = row.count;
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
exports.EmployerFollowupService = {
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
//# sourceMappingURL=employerFollowup.service.js.map