"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Setting = void 0;
const mongoose_1 = require("mongoose");
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
const settingSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    value: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
    minimize: false, // keep empty objects/arrays as stored values
});
exports.Setting = (0, mongoose_1.model)('Setting', settingSchema);
//# sourceMappingURL=settings.model.js.map