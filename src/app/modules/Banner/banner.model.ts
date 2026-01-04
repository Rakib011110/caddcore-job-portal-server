import { Schema, model } from 'mongoose';
import { IBannerModel, TBanner } from './banner.interface';

const bannerSchema = new Schema<TBanner, IBannerModel>(
  {
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
  },
  {
    timestamps: true,
  }
);

export const Banner = model<TBanner, IBannerModel>('Banner', bannerSchema);