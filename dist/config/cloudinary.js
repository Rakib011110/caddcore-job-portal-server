"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
/**
 * Cloudinary Configuration Module
 *
 * This module configures and exports the Cloudinary instance for image/file uploads.
 *
 * Environment Variables Required:
 * - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - CLOUDINARY_API_KEY: Your Cloudinary API key
 * - CLOUDINARY_API_SECRET: Your Cloudinary API secret
 */
// Configure Cloudinary with environment variables
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Verify Cloudinary connection on startup
 * This is a health check to ensure credentials are valid
 */
const verifyCloudinaryConnection = async () => {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (!cloudName || !apiKey || !apiSecret) {
            console.error("[CLOUDINARY] Missing required environment variables");
            return;
        }
        // Test connection by listing resources
        const result = await cloudinary_1.v2.api.resources({ max_results: 1 });
        console.log(`[CLOUDINARY] Connected successfully to cloud: ${cloudName}`);
    }
    catch (error) {
        console.error("[CLOUDINARY] Connection failed:", error?.error?.message || error?.message);
    }
};
// Run verification on module load
verifyCloudinaryConnection();
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map