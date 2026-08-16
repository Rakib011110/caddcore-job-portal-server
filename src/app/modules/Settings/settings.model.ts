import { Schema, model } from 'mongoose';
import { ISettingDocument, ISettingModel } from './settings.interface';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SETTING MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * One document per overridden setting. Settings that still use their registry
 * default have NO document at all - that keeps the collection tiny and makes
 * "reset to default" a simple delete.
 *
 * `value` is intentionally Mixed: the registry (settings.constant.ts) owns the
 * type contract, which is enforced in the service layer on write.
 */

const settingSchema = new Schema<ISettingDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    minimize: false, // keep empty objects/arrays as stored values
  }
);

export const Setting = model<ISettingDocument, ISettingModel>(
  'Setting',
  settingSchema
);
