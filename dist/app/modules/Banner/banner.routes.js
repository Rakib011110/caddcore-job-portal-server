"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Controller = __importStar(require("./banner.controller"));
const cloudinary_multer_1 = require("../../../lib/multer/cloudinary.multer");
const router = express_1.default.Router();
// Image upload endpoint for banners (Cloudinary)
router.post('/upload-image', (req, res, next) => {
    console.log('📤 [Banner Route] Upload request received - uploading to Cloudinary');
    next();
}, cloudinary_multer_1.uploadCloudinaryBannerImage, cloudinary_multer_1.handleUploadError, Controller.uploadImage);
// Test endpoint to check Cloudinary connection
router.get('/test-cloudinary', async (req, res) => {
    try {
        const cloudinary = require('../../../config/cloudinary').default;
        const pingResult = await cloudinary.api.ping();
        res.json({
            success: true,
            message: 'Cloudinary connection test',
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            status: pingResult.status === 'ok' ? 'Connected' : 'Failed',
            pingResult
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Cloudinary connection failed',
            error: error.message
        });
    }
});
router.post('/', Controller.createBanner);
router.get('/', Controller.getAllBanners);
router.get('/:id', Controller.getBanner);
router.patch('/:id', Controller.updateBanner);
router.delete('/:id', Controller.deleteBanner);
exports.BannerRoutes = router;
//# sourceMappingURL=banner.routes.js.map