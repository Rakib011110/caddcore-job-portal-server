"use strict";
// utils/emailToken.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmailVerificationToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
// aaa
const generateEmailVerificationToken = () => {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    return { token, hashedToken };
};
exports.generateEmailVerificationToken = generateEmailVerificationToken;
//# sourceMappingURL=emailToken.js.map