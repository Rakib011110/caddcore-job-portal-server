"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.getBanner = exports.getAllBanners = exports.createBanner = exports.uploadImage = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const banner_services_1 = require("./banner.services");
const cloudinary_multer_1 = require("../../../lib/multer/cloudinary.multer");
exports.uploadImage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    console.log('🖼️ [Banner] Cloudinary upload request received');
    if (!req.file) {
        console.log('❌ [Banner] No image file uploaded');
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: 'No image file uploaded',
            data: null,
        });
    }
    // Get Cloudinary URL from uploaded file
    const imageUrl = (0, cloudinary_multer_1.getUploadedFileUrl)(req.file);
    if (!imageUrl) {
        console.log('❌ [Banner] Failed to get Cloudinary URL');
        return (0, sendResponse_1.default)(res, {
            statusCode: 500,
            success: false,
            message: 'Failed to upload image to Cloudinary',
            data: null,
        });
    }
    console.log('✅ [Banner] Image uploaded to Cloudinary successfully:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        cloudinaryUrl: imageUrl
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Image uploaded to Cloudinary successfully',
        data: { imagePath: imageUrl },
    });
});
exports.createBanner = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await banner_services_1.BannerService.createBanner(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Banner created successfully',
        data: result,
    });
});
exports.getAllBanners = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await banner_services_1.BannerService.getAllBanners();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Banners fetched successfully',
        data: result,
    });
});
exports.getBanner = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: 'Banner ID is required',
            data: null,
        });
    }
    const result = await banner_services_1.BannerService.getBannerById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Banner fetched successfully',
        data: result,
    });
});
exports.updateBanner = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: 'Banner ID is required',
            data: null,
        });
    }
    const result = await banner_services_1.BannerService.updateBanner(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Banner updated successfully',
        data: result,
    });
});
exports.deleteBanner = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: 'Banner ID is required',
            data: null,
        });
    }
    const result = await banner_services_1.BannerService.deleteBanner(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Banner deleted successfully',
        data: result,
    });
});
//# sourceMappingURL=banner.controller.js.map