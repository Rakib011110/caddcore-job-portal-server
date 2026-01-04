import { TBanner } from './banner.interface';
export declare const BannerService: {
    createBanner: (payload: TBanner) => Promise<import("mongoose").Document<unknown, {}, TBanner, {}, {}> & TBanner & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    getAllBanners: () => Promise<(import("mongoose").Document<unknown, {}, TBanner, {}, {}> & TBanner & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    getBannerById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TBanner, {}, {}> & TBanner & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    updateBanner: (id: string, payload: Partial<TBanner>) => Promise<(import("mongoose").Document<unknown, {}, TBanner, {}, {}> & TBanner & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    deleteBanner: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TBanner, {}, {}> & TBanner & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=banner.services.d.ts.map