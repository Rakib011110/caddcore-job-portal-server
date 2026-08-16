"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
require("./config/cloudinary"); // Initialize Cloudinary
const resume_pdf_1 = require("./app/modules/Resume/resume.pdf");
let server;
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    if (server) {
        server.close(() => {
            console.error('Server closed due to unhandled rejection');
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
async function bootstrap() {
    try {
        await mongoose_1.default.connect(config_1.default.db_url);
        console.log('🛢 Database connected successfully');
        // await seed();
        server = app_1.default.listen(config_1.default.port, () => {
            console.log(`🚀 Application is running on port ${config_1.default.port}`);
        });
    }
    catch (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
}
bootstrap();
/**
 * Close the shared Chromium used for CV PDF export.
 *
 * It runs as a child process, so without this a restarted server leaves an
 * orphaned browser holding a few hundred MB per restart.
 */
const shutdown = (signal) => {
    console.log(`${signal} received`);
    const exit = () => {
        (0, resume_pdf_1.shutdownPdfEngine)()
            .catch(() => undefined)
            .finally(() => process.exit(0));
    };
    if (server) {
        server.close(() => {
            console.log(`Server closed due to ${signal}`);
            exit();
        });
    }
    else {
        exit();
    }
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
//# sourceMappingURL=server.js.map