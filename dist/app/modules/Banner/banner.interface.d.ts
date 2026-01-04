import { Model } from 'mongoose';
export type TBanner = {
    _id?: string;
    title?: string;
    imageUrl: string;
    altText?: string;
    isActive: boolean;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
};
export interface IBannerModel extends Model<TBanner> {
}
//# sourceMappingURL=banner.interface.d.ts.map