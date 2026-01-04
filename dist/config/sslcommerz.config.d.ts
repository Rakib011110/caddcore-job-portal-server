interface SSLCommerzConfig {
    storeId: string;
    storePassword: string;
    isLive: boolean;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    ipnUrl: string;
}
export declare const getSSLCommerzConfig: () => SSLCommerzConfig;
export declare const validateSSLCommerzEnvironment: () => boolean;
declare const _default: {
    getSSLCommerzConfig: () => SSLCommerzConfig;
    validateSSLCommerzEnvironment: () => boolean;
};
export default _default;
//# sourceMappingURL=sslcommerz.config.d.ts.map