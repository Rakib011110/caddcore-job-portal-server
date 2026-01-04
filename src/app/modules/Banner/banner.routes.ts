import express from 'express';
import multer from 'multer';
import * as Controller from './banner.controller';
import { uploadCloudinaryBannerImage, handleUploadError } from '../../../lib/multer/cloudinary.multer';

const router = express.Router();

// Image upload endpoint for banners (Cloudinary)
router.post('/upload-image',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log('📤 [Banner Route] Upload request received - uploading to Cloudinary');
    next();
  },
  uploadCloudinaryBannerImage,
  handleUploadError,
  Controller.uploadImage
);

// Test endpoint to check Cloudinary connection
router.get('/test-cloudinary', async (req: express.Request, res: express.Response) => {
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
  } catch (error: any) {
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

export const BannerRoutes = router;