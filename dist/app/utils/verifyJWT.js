"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../error/AppError"));
const createToken = (jwtPayload, secret, expiresIn) => {
    const options = {
        expiresIn,
    };
    return jsonwebtoken_1.default.sign(jwtPayload, secret, options);
};
exports.createToken = createToken;
const verifyToken = (token, secret) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new AppError_1.default(401, 'You are not authorized!');
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=verifyJWT.js.map