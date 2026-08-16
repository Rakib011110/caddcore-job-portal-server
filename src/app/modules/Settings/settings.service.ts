import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { Setting } from './settings.model';
import {
  IResolvedSetting,
  ISettingDefinition,
  ISettingsGroup,
  SETTING_VALUE_TYPES,
  TSettingValue,
} from './settings.interface';
import {
  SETTINGS_REGISTRY,
  getSettingDefinition,
  getSettingGroup,
} from './settings.constant';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SETTINGS SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * READING (anywhere in the codebase):
 *   const required = await SettingsService.get<boolean>(SETTING_KEYS.RESUME_APPROVAL_REQUIRED);
 *   const { resume } = await SettingsService.getResolvedConfig();
 *
 * Reads are served from a short-lived in-process cache so hot paths (like the
 * job-application gate) do not hit Mongo on every request. Writes clear it.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CACHE
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 1000;

let overridesCache: Map<string, TSettingValue> | null = null;
let overridesCacheExpiresAt = 0;
/** De-dupes concurrent cache refills so a cold cache issues one query, not N */
let overridesCacheLoader: Promise<Map<string, TSettingValue>> | null = null;

const invalidateCache = (): void => {
  overridesCache = null;
  overridesCacheExpiresAt = 0;
  overridesCacheLoader = null;
};

const loadOverrides = async (): Promise<Map<string, TSettingValue>> => {
  const now = Date.now();

  if (overridesCache && now < overridesCacheExpiresAt) {
    return overridesCache;
  }

  if (overridesCacheLoader) {
    return overridesCacheLoader;
  }

  overridesCacheLoader = (async () => {
    try {
      const rows = await Setting.find().select('key value').lean();
      const map = new Map<string, TSettingValue>(
        rows.map((row) => [row.key, row.value as TSettingValue])
      );

      overridesCache = map;
      overridesCacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return map;
    } catch (error) {
      // Never let a settings read take down a request - fall back to defaults.
      console.error('[Settings] Failed to load overrides, using defaults:', error);
      return new Map<string, TSettingValue>();
    } finally {
      overridesCacheLoader = null;
    }
  })();

  return overridesCacheLoader;
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION / COERCION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Coerces an incoming value to the type declared in the registry and validates
 * it. HTTP bodies and env-style inputs routinely deliver "true"/"5" as strings,
 * so coercion here keeps every caller honest.
 */
const coerceValue = (
  definition: ISettingDefinition,
  rawValue: unknown
): TSettingValue => {
  const { key, type } = definition;

  if (rawValue === undefined || rawValue === null) {
    throw new AppError(httpStatus.BAD_REQUEST, `Setting "${key}" cannot be empty`);
  }

  switch (type) {
    case SETTING_VALUE_TYPES.BOOLEAN: {
      if (typeof rawValue === 'boolean') return rawValue;
      if (rawValue === 'true' || rawValue === 1 || rawValue === '1') return true;
      if (rawValue === 'false' || rawValue === 0 || rawValue === '0') return false;
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Setting "${key}" must be a boolean`
      );
    }

    case SETTING_VALUE_TYPES.NUMBER: {
      const parsed =
        typeof rawValue === 'number' ? rawValue : Number(String(rawValue).trim());

      if (!Number.isFinite(parsed)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Setting "${key}" must be a number`
        );
      }
      if (definition.min !== undefined && parsed < definition.min) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Setting "${key}" must be at least ${definition.min}`
        );
      }
      if (definition.max !== undefined && parsed > definition.max) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Setting "${key}" must be at most ${definition.max}`
        );
      }
      return parsed;
    }

    case SETTING_VALUE_TYPES.STRING: {
      if (typeof rawValue !== 'string') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Setting "${key}" must be a string`
        );
      }
      return rawValue;
    }

    case SETTING_VALUE_TYPES.ENUM: {
      const allowed = definition.options || [];
      if (!allowed.includes(rawValue as string | number)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Setting "${key}" must be one of: ${allowed.join(', ')}`
        );
      }
      return rawValue as string | number;
    }

    case SETTING_VALUE_TYPES.JSON: {
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue) as TSettingValue;
        } catch {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `Setting "${key}" must be valid JSON`
          );
        }
      }
      if (typeof rawValue === 'object') return rawValue as TSettingValue;
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Setting "${key}" must be an object or array`
      );
    }

    default:
      return rawValue as TSettingValue;
  }
};

const requireDefinition = (key: string): ISettingDefinition => {
  const definition = getSettingDefinition(key);

  if (!definition) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Unknown setting "${key}". Register it in SETTINGS_REGISTRY first.`
    );
  }

  return definition;
};

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads a single setting. Falls back to the registry default when the setting
 * has never been overridden.
 */
const get = async <T extends TSettingValue = TSettingValue>(
  key: string
): Promise<T> => {
  const definition = requireDefinition(key);
  const overrides = await loadOverrides();

  const stored = overrides.get(key);
  return (stored === undefined ? definition.defaultValue : stored) as T;
};

/** Reads several settings at once as a flat `key -> value` map */
const getMany = async (
  keys: string[]
): Promise<Record<string, TSettingValue>> => {
  const overrides = await loadOverrides();

  return keys.reduce<Record<string, TSettingValue>>((acc, key) => {
    const definition = requireDefinition(key);
    const stored = overrides.get(key);
    acc[key] = stored === undefined ? definition.defaultValue : stored;
    return acc;
  }, {});
};

/**
 * The whole config as a nested object, exactly the shape consumers expect:
 *   { resume: { approval_required: true }, job_application: { ... } }
 */
const getResolvedConfig = async (
  options: { publicOnly?: boolean } = {}
): Promise<Record<string, Record<string, TSettingValue>>> => {
  const overrides = await loadOverrides();
  const config: Record<string, Record<string, TSettingValue>> = {};

  for (const definition of SETTINGS_REGISTRY) {
    if (options.publicOnly && !definition.isPublic) continue;

    const group = getSettingGroup(definition.key);
    const name = definition.key.slice(group.length + 1) || definition.key;
    const stored = overrides.get(definition.key);

    if (!config[group]) config[group] = {};
    config[group][name] =
      stored === undefined ? definition.defaultValue : stored;
  }

  return config;
};

/** Registry metadata + current values, grouped for the admin settings screen */
const getAllGrouped = async (): Promise<ISettingsGroup[]> => {
  const overrides = await loadOverrides();
  const rows = await Setting.find().select('key updatedAt').lean();
  const updatedAtByKey = new Map(
    rows.map((row) => [row.key, row.updatedAt as Date | undefined])
  );

  const groups = new Map<string, ISettingsGroup>();

  for (const definition of SETTINGS_REGISTRY) {
    const group = getSettingGroup(definition.key);
    const stored = overrides.get(definition.key);

    const resolved: IResolvedSetting = {
      ...definition,
      value: stored === undefined ? definition.defaultValue : stored,
      isOverridden: stored !== undefined,
    };

    const updatedAt = updatedAtByKey.get(definition.key);
    if (updatedAt) resolved.updatedAt = updatedAt;

    if (!groups.has(group)) {
      groups.set(group, {
        group,
        groupLabel: definition.groupLabel,
        settings: [],
      });
    }

    groups.get(group)?.settings.push(resolved);
  }

  return [...groups.values()];
};

// ─────────────────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────────────────

const set = async (
  key: string,
  rawValue: unknown,
  updatedBy?: string
): Promise<IResolvedSetting> => {
  const definition = requireDefinition(key);

  if (definition.isEditable === false) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Setting "${key}" is managed by the system and cannot be changed`
    );
  }

  const value = coerceValue(definition, rawValue);

  const updated = await Setting.findOneAndUpdate(
    { key },
    { key, value, ...(updatedBy ? { updatedBy } : {}) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  invalidateCache();

  return {
    ...definition,
    value,
    isOverridden: true,
    ...(updated?.updatedAt ? { updatedAt: updated.updatedAt } : {}),
  };
};

/** Updates a batch of settings. Validates every key BEFORE writing any of them. */
const setMany = async (
  settings: Record<string, unknown>,
  updatedBy?: string
): Promise<ISettingsGroup[]> => {
  const entries = Object.entries(settings || {});

  if (entries.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No settings provided');
  }

  // Validate everything first so a bad key cannot leave a half-applied update.
  const validated = entries.map(([key, rawValue]) => {
    const definition = requireDefinition(key);

    if (definition.isEditable === false) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Setting "${key}" is managed by the system and cannot be changed`
      );
    }

    return { key, value: coerceValue(definition, rawValue) };
  });

  await Setting.bulkWrite(
    validated.map(({ key, value }) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: { key, value, ...(updatedBy ? { updatedBy } : {}) },
        },
        upsert: true,
      },
    }))
  );

  invalidateCache();

  return getAllGrouped();
};

/** Drops the override so the setting returns to its registry default */
const reset = async (key: string): Promise<IResolvedSetting> => {
  const definition = requireDefinition(key);

  await Setting.deleteOne({ key });
  invalidateCache();

  return {
    ...definition,
    value: definition.defaultValue,
    isOverridden: false,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const SettingsService = {
  get,
  getMany,
  getResolvedConfig,
  getAllGrouped,
  set,
  setMany,
  reset,
  invalidateCache,
};
