import { Document, Model, Types } from 'mongoose';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SYSTEM SETTINGS INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A generic, registry-driven settings system.
 *
 * Every setting is a namespaced dot-key (`group.name`) backed by a single
 * `settings` collection. Adding a NEW setting never requires touching the
 * model, service, controller or routes - you only add one entry to
 * `SETTINGS_REGISTRY` in `settings.constant.ts`.
 *
 * The registry is the source of truth for:
 *   - the default value (used when nothing is stored in the DB yet)
 *   - the value type (used for validation + coercion)
 *   - the admin UI metadata (label, description, group, options)
 *   - visibility (public settings can be read by any client)
 */

// ─────────────────────────────────────────────────────────────────────────────
// VALUE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const SETTING_VALUE_TYPES = {
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  STRING: 'string',
  ENUM: 'enum',
  JSON: 'json',
} as const;

export type TSettingValueType =
  (typeof SETTING_VALUE_TYPES)[keyof typeof SETTING_VALUE_TYPES];

export type TSettingValue =
  | boolean
  | number
  | string
  | Record<string, unknown>
  | unknown[];

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY DEFINITION (the developer-facing contract)
// ─────────────────────────────────────────────────────────────────────────────

export interface ISettingDefinition {
  /** Namespaced dot key, e.g. `resume.approval_required` */
  key: string;

  /** Group label shown in the admin UI, e.g. `Resume` */
  groupLabel: string;

  /** Human readable name shown in the admin UI */
  label: string;

  /** Explains what flipping this setting actually does */
  description?: string;

  type: TSettingValueType;

  /** Used whenever the DB has no stored override */
  defaultValue: TSettingValue;

  /** Allowed values when `type` is `enum` */
  options?: (string | number)[];

  /** Bounds when `type` is `number` */
  min?: number;
  max?: number;

  /** When true the setting is readable without admin rights */
  isPublic?: boolean;

  /** When false the admin UI renders it read-only (system managed) */
  isEditable?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTED DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface ISetting {
  key: string;
  value: TSettingValue;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISettingDocument extends ISetting, Document {}

export type ISettingModel = Model<ISettingDocument>;

// ─────────────────────────────────────────────────────────────────────────────
// API SHAPES
// ─────────────────────────────────────────────────────────────────────────────

/** A setting merged with its registry metadata, for the admin UI */
export interface IResolvedSetting extends ISettingDefinition {
  value: TSettingValue;
  /** true when an admin has overridden the registry default */
  isOverridden: boolean;
  updatedAt?: Date;
}

export interface ISettingsGroup {
  group: string;
  groupLabel: string;
  settings: IResolvedSetting[];
}

export interface IUpdateSettingsPayload {
  /** Flat map of `key -> value`, e.g. `{ "resume.approval_required": false }` */
  settings: Record<string, TSettingValue>;
}
