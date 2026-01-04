"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = require("mongoose");
const bannerSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: false,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    altText: {
        type: String,
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.Banner = (0, mongoose_1.model)('Banner', bannerSchema);
//# sourceMappingURL=banner.model.js.map