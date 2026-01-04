import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BannerService } from './banner.services';
import { getUploadedFileUrl } from '../../../lib/multer/cloudinary.multer';

export const uploadImage = catchAsync(async (req, res) => {
  console.log('🖼️ [Banner] Cloudinary upload request received');

  if (!req.file) {
    console.log('❌ [Banner] No image file uploaded');
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'No image file uploaded',
      data: null,
    });
  }

  // Get Cloudinary URL from uploaded file
  const imageUrl = getUploadedFileUrl(req.file);

  if (!imageUrl) {
    console.log('❌ [Banner] Failed to get Cloudinary URL');
    return sendResponse(res, {
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

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Image uploaded to Cloudinary successfully',
    data: { imagePath: imageUrl },
  });
});

export const createBanner = catchAsync(async (req, res) => {
  const result = await BannerService.createBanner(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Banner created successfully',
    data: result,
  });
});

export const getAllBanners = catchAsync(async (req, res) => {
  const result = await BannerService.getAllBanners();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Banners fetched successfully',
    data: result,
  });
});

export const getBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Banner ID is required',
      data: null,
    });
  }
  const result = await BannerService.getBannerById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Banner fetched successfully',
    data: result,
  });
});

export const updateBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Banner ID is required',
      data: null,
    });
  }
  const result = await BannerService.updateBanner(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Banner updated successfully',
    data: result,
  });
});

export const deleteBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Banner ID is required',
      data: null,
    });
  }
  const result = await BannerService.deleteBanner(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Banner deleted successfully',
    data: result,
  });
});