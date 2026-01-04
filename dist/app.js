"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const security_1 = require("./config/security");
const swagger_config_1 = require("./swagger.config");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security headers with Helmet
app.use((0, helmet_1.default)(security_1.SECURITY_CONFIG.HELMET));
// Handle preflight requests with security configuration
app.use((0, cors_1.default)(security_1.SECURITY_CONFIG.CORS));
// Increase payload limits to handle large file uploads
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
// Determine uploads path - works in both dev and production
// In dev: __dirname is 'src', so '../uploads'
// In prod: __dirname is 'dist', so '../uploads'
// Both resolve to project root /uploads
const uploadsPath = path_1.default.join(__dirname, '../uploads');
// console.log('📁 Uploads directory configured at:', uploadsPath);
// Serve static files BEFORE API routes to prevent conflicts
// This allows direct access to uploaded files without going through API middleware
app.use('/uploads', (req, res, next) => {
    // console.log('📁 Static file request:', req.method, req.url, req.path);
    next();
}, express_1.default.static(uploadsPath, {
    // Add options to help with file serving
    setHeaders: (res, filePath) => {
        // console.log('✅ Serving file:', filePath);
        // Set proper content type headers
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
        }
    },
    fallthrough: true, // Pass to next middleware if file not found
    index: false, // Don't serve index.html for directory requests
}));
app.use("/api", routes_1.default);
// Setup Swagger API Documentation
(0, swagger_config_1.setupSwagger)(app);
app.get("/", (req, res) => {
    res.send("Hello mongodb!");
});
// Test endpoint for file uploads access
app.get("/test-file-access", (req, res) => {
    const fs = require('fs');
    const uploadsPath = path_1.default.join(__dirname, '../uploads');
    const profileDocsPath = path_1.default.join(uploadsPath, 'profiledocs');
    const uploadsExists = fs.existsSync(uploadsPath);
    const profileDocsExists = fs.existsSync(profileDocsPath);
    let files = [];
    if (profileDocsExists) {
        try {
            files = fs.readdirSync(profileDocsPath).slice(0, 5); // First 5 files
        }
        catch (error) {
            files = ['Error reading directory'];
        }
    }
    res.json({
        message: "File access test",
        uploadsPath,
        uploadsExists,
        profileDocsPath,
        profileDocsExists,
        sampleFiles: files,
        staticMiddlewareActive: true,
        directAccessTest: files.length > 0 ? `${req.protocol}://${req.get('host')}/uploads/profiledocs/${files[0]}` : null,
        accessExample: `${req.protocol}://${req.get('host')}/uploads/profiledocs/filename.pdf`,
        serverPath: path_1.default.join(__dirname, '../uploads')
    });
});
// Test endpoint for Cloudinary connection
app.get("/test-cloudinary", async (req, res) => {
    try {
        const cloudinary = require('./config/cloudinary').default;
        // Check environment variables
        const envCheck = {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing',
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing',
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing',
        };
        // Test connection
        let connectionTest;
        try {
            connectionTest = await cloudinary.api.ping();
        }
        catch (pingError) {
            connectionTest = {
                error: pingError.message,
                code: pingError.http_code
            };
        }
        res.json({
            message: "Cloudinary Configuration Test",
            timestamp: new Date().toISOString(),
            environment: envCheck,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            connectionTest,
            status: connectionTest.status === 'ok' ? '✓ Connected' : '✗ Connection Failed'
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Cloudinary test failed",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Test endpoint for CORS and payload size
app.post("/api/test-cors", (req, res) => {
    res.json({
        message: "CORS is working correctly!",
        origin: req.headers.origin,
        method: req.method,
        payloadSize: JSON.stringify(req.body).length,
        timestamp: new Date().toISOString()
    });
});
app.use(globalErrorHandler_1.default);
app.use(notFound_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map