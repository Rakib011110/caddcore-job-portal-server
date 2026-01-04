"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSSLCommerzEnvironment = exports.getSSLCommerzConfig = void 0;
const getSSLCommerzConfig = () => {
    // 🚀 FORCE PRODUCTION MODE - Always use live credentials
    const isProduction = true; // Force production mode
    console.log('🔧 Environment Detection:', {
        NODE_ENV: process.env.NODE_ENV,
        isProduction,
        forcedProduction: true
    });
    // 🔥 ALWAYS USE PRODUCTION CONFIGURATION
    return {
        // storeId: 'caddc682c38c3b2c12', // Live store ID
        // storePassword: 'caddc682c38c3b2c12@ssl', // Live store password
        storeId: 'caddcore1live', // Live store ID
        storePassword: '687744026C85953040', // Live store password
        isLive: true, // Always true for production
        // 🔥 PRODUCTION URLs (uncomment for production)
        successUrl: 'https://www.caddcore.net/payment/success',
        failUrl: 'https://www.caddcore.net/payment/fail',
        cancelUrl: 'https://www.caddcore.net/payment/cancel',
        // 🔧 LOCAL TESTING URLs (uncomment for local testing)
        // successUrl: 'http://localhost:3000/payment/success',
        // failUrl: 'http://localhost:3000/payment/fail',
        // cancelUrl: 'http://localhost:3000/payment/cancel',
        ipnUrl: 'https://caddcoreapi-ten.vercel.app/api/payments/ipn'
    };
};
exports.getSSLCommerzConfig = getSSLCommerzConfig;
const validateSSLCommerzEnvironment = () => {
    try {
        const config = (0, exports.getSSLCommerzConfig)();
        console.log('🔧 SSLCommerz Configuration:', {
            storeId: config.storeId,
            isLive: config.isLive,
            successUrl: config.successUrl,
            failUrl: config.failUrl,
            cancelUrl: config.cancelUrl,
            ipnUrl: config.ipnUrl
        });
        // Validate required fields
        if (!config.storeId || !config.storePassword) {
            throw new Error('Store ID and Password are required');
        }
        // Additional validation for production
        if (config.isLive) {
            // Check if URLs are HTTPS
            const httpsUrls = [config.successUrl, config.failUrl, config.cancelUrl, config.ipnUrl];
            const invalidUrls = httpsUrls.filter(url => !url.startsWith('https://'));
            if (invalidUrls.length > 0) {
                console.warn('⚠️  Production URLs should use HTTPS:', invalidUrls);
            }
            // Check if using correct live store ID
            if (config.storeId !== 'caddcore1live') {
                console.warn('⚠️  Expected live store ID "caddcore1live", got:', config.storeId);
            }
        }
        return true;
    }
    catch (error) {
        console.error('❌ SSLCommerz configuration validation failed:', error);
        return false;
    }
};
exports.validateSSLCommerzEnvironment = validateSSLCommerzEnvironment;
// Export for use in other modules
exports.default = {
    getSSLCommerzConfig: exports.getSSLCommerzConfig,
    validateSSLCommerzEnvironment: exports.validateSSLCommerzEnvironment
};
//# sourceMappingURL=sslcommerz.config.js.map