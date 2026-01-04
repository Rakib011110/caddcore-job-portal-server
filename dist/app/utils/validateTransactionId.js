"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransactionId = validateTransactionId;
function validateTransactionId(req, res, next) {
    const { transactionId } = req.params;
    if (!transactionId || typeof transactionId !== 'string' || transactionId.length !== 24) {
        res.status(400).json({ message: 'Invalid transaction ID' });
        return;
    }
    next();
}
//# sourceMappingURL=validateTransactionId.js.map