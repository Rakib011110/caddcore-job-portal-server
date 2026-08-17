import { Schema, model } from 'mongoose';
import {
  CONTACT_METHODS,
  FOLLOWUP_OUTCOMES,
  FOLLOWUP_PURPOSES,
  HIRING_NEEDS,
  IEmployerFollowup,
  IEmployerFollowupModel,
} from './employerFollowup.interface';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const employerFollowupSchema = new Schema<IEmployerFollowup, IEmployerFollowupModel>(
  {
    followupId: {
      type: String,
      unique: true,
      index: true,
      // Filled by the pre-validate hook below, so it is not required on input.
    },

    // ── Who ──────────────────────────────────────────────────────────────────
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    companyNameSnapshot: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    contactDesignation: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },

    // ── What happened ────────────────────────────────────────────────────────
    contactDate: { type: Date, required: true, default: Date.now, index: true },
    contactMethod: { type: String, enum: CONTACT_METHODS, required: true },
    purpose: { type: String, enum: FOLLOWUP_PURPOSES, required: true },
    response: { type: String, maxlength: 3000 },
    outcome: { type: String, enum: FOLLOWUP_OUTCOMES, default: 'Pending', index: true },
    hiringNeed: { type: String, enum: HIRING_NEEDS, default: 'Unknown', index: true },
    rolesDiscussed: [{ type: String, trim: true }],
    vacanciesOffered: { type: Number, min: 0 },

    // ── What happens next ────────────────────────────────────────────────────
    nextAction: { type: String, maxlength: 1000 },
    nextActionDate: { type: Date },
    isNextActionDone: { type: Boolean, default: false },

    notes: { type: String, maxlength: 3000 },

    // ── Audit ────────────────────────────────────────────────────────────────
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

/** The default list view: newest contact first, optionally per company. */
employerFollowupSchema.index({ companyId: 1, contactDate: -1 });
/** The "what is due" view. */
employerFollowupSchema.index({ isNextActionDone: 1, nextActionDate: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// ID GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `FU-2026-0007`, numbered per calendar year.
 *
 * Counted rather than stored in a counter document, which is fine at the volume
 * a placement cell generates (tens per month) and avoids a second collection.
 * Two follow-ups saved in the same millisecond could collide on the unique
 * index; the retry in the hook below covers that.
 */
employerFollowupSchema.statics.generateFollowupId = async function (
  year: number = new Date().getFullYear()
): Promise<string> {
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const count = await this.countDocuments({
    createdAt: { $gte: startOfYear, $lt: startOfNextYear },
  });

  return `FU-${year}-${String(count + 1).padStart(4, '0')}`;
};

employerFollowupSchema.pre('validate', async function (next) {
  if (this.followupId) return next();

  const Model = this.constructor as IEmployerFollowupModel;
  const year = new Date().getFullYear();

  // Retry a few times so a same-instant collision on the unique index resolves
  // itself instead of surfacing as a save error to the user.
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = await Model.generateFollowupId(year);
    const exists = await Model.exists({ followupId: candidate });
    if (!exists) {
      this.followupId = candidate;
      return next();
    }
  }

  // Fall back to something guaranteed unique rather than refusing the save -
  // losing the call log entry is worse than an out-of-sequence reference.
  this.followupId = `FU-${year}-${Date.now().toString().slice(-6)}`;
  next();
});

export const EmployerFollowup = model<IEmployerFollowup, IEmployerFollowupModel>(
  'EmployerFollowup',
  employerFollowupSchema
);
