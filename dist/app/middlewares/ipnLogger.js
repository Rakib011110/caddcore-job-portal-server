"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipnLogger = void 0;
const ipnLogger = (req, res, next) => {
    console.log('🔥 IPN MIDDLEWARE - Incoming Request:', {
        method: req.method,
        url: req.url,
        path: req.path,
        originalUrl: req.originalUrl,
        headers: {
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length'],
            'user-agent': req.headers['user-agent'],
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip']
        },
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    // Log the raw body for debugging
    if (req.body) {
        console.log('🔍 Raw Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
};
exports.ipnLogger = ipnLogger;
exports.default = exports.ipnLogger;
//# sourceMappingURL=ipnLogger.js.map