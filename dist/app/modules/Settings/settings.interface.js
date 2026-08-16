"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTING_VALUE_TYPES = void 0;
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
exports.SETTING_VALUE_TYPES = {
    BOOLEAN: 'boolean',
    NUMBER: 'number',
    STRING: 'string',
    ENUM: 'enum',
    JSON: 'json',
};
//# sourceMappingURL=settings.interface.js.map