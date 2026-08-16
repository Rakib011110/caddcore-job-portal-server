"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
require("./config/cloudinary"); // Initialize Cloudinary
let isConnected = false;
const connectToDatabase = async () => {
    if (isConnected) {
        return;
    }
    try {
        await mongoose_1.default.connect(config_1.default.db_url);
        isConnected = true;
        console.log('🛢 Database connected successfully');
    }
    catch (error) {
        console.error('Failed to connect to database:', error);
    }
};
exports.default = async (req, res) => {
    await connectToDatabase();
    (0, app_1.default)(req, res);
};
//# sourceMappingURL=vercel.js.map