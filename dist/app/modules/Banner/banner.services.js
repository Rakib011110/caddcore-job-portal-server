"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerService = void 0;
const banner_model_1 = require("./banner.model");
const createBanner = async (payload) => {
    const result = await banner_model_1.Banner.create(payload);
    return result;
};
const getAllBanners = async () => {
    const result = await banner_model_1.Banner.find({ isActive: true }).sort({ order: 1 });
    return result;
};
const getBannerById = async (id) => {
    const result = await banner_model_1.Banner.findById(id);
    return result;
};
const updateBanner = async (id, payload) => {
    const result = await banner_model_1.Banner.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
const deleteBanner = async (id) => {
    const result = await banner_model_1.Banner.findByIdAndDelete(id);
    return result;
};
exports.BannerService = {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
};
//# sourceMappingURL=banner.services.js.map