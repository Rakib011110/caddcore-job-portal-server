import { IResolvedSetting, ISettingsGroup, TSettingValue } from './settings.interface';
export declare const SettingsService: {
    get: <T extends TSettingValue = TSettingValue>(key: string) => Promise<T>;
    getMany: (keys: string[]) => Promise<Record<string, TSettingValue>>;
    getResolvedConfig: (options?: {
        publicOnly?: boolean;
    }) => Promise<Record<string, Record<string, TSettingValue>>>;
    getAllGrouped: () => Promise<ISettingsGroup[]>;
    set: (key: string, rawValue: unknown, updatedBy?: string) => Promise<IResolvedSetting>;
    setMany: (settings: Record<string, unknown>, updatedBy?: string) => Promise<ISettingsGroup[]>;
    reset: (key: string) => Promise<IResolvedSetting>;
    invalidateCache: () => void;
};
//# sourceMappingURL=settings.service.d.ts.map