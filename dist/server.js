"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
require("./config/cloudinary"); // Initialize Cloudinary
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
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    if (server) {
        server.close(() => {
            console.log('Server closed due to SIGTERM');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
});
process.on('SIGINT', () => {
    console.log('SIGINT received');
    if (server) {
        server.close(() => {
            console.log('Server closed due to SIGINT');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
});
//# sourceMappingURL=server.js.map