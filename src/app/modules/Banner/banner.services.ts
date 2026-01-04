import { Banner } from './banner.model';
import { TBanner } from './banner.interface';

const createBanner = async (payload: TBanner) => {
  const result = await Banner.create(payload);
  return result;
};

const getAllBanners = async () => {
  const result = await Banner.find({ isActive: true }).sort({ order: 1 });
  return result;
};

const getBannerById = async (id: string) => {
  const result = await Banner.findById(id);
  return result;
};

const updateBanner = async (id: string, payload: Partial<TBanner>) => {
  const result = await Banner.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteBanner = async (id: string) => {
  const result = await Banner.findByIdAndDelete(id);
  return result;
};

export const BannerService = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};