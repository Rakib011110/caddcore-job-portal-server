"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = void 0;
const config_1 = __importDefault(require("../../config"));
const verifyJWT_1 = require("../utils/verifyJWT");
/**
 * Attach `req.user` when a valid token is present, and carry on either way.
 *
 * For endpoints that serve two kinds of caller - a signed-in admin and an
 * unauthenticated machine holding a shared secret. `auth()` would reject the
 * machine before the handler could check its secret; this lets both reach the
 * handler, which then decides.
 *
 * It never rejects, so it grants nothing on its own. Any route using it MUST
 * still authorise inside the handler.
 */
const optionalAuth = (req, _res, next) => {
    let token = req.headers.authorization;
    if (!token)
        return next();
    if (token.startsWith('Bearer '))
        token = token.slice(7);
    if (!token || token.length < 10)
        return next();
    try {
        const decoded = (0, verifyJWT_1.verifyToken)(token, config_1.default.jwt_access_secret);
        req.user = decoded;
    }
    catch {
        // A bad token is treated as no token. The handler is responsible for
        // refusing the request if it needs an authenticated caller.
    }
    next();
};
exports.optionalAuth = optionalAuth;
exports.default = exports.optionalAuth;
//# sourceMappingURL=optionalAuth.js.map