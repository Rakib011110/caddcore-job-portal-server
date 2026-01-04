"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentFailedEmail = exports.sendPaymentSuccessEmail = void 0;
// utils/sendPaymentEmail.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailTemplates_1 = require("./emailTemplates");
// 1. Transporter তৈরি
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // => Gmail App Password
    },
});
// 2. SMTP Verify — রানটাইমে একবার
transporter.verify((err, success) => {
    if (err) {
        console.error('SMTP verification failed:', err);
    }
    else {
        console.log('✅ SMTP ready:', success);
    }
});
const sendPaymentSuccessEmail = async (email, userName, courseTitle, amount, transactionId) => {
    const html = (0, emailTemplates_1.paymentSuccessTemplate)(userName, courseTitle, amount, transactionId);
    console.log('Sending success email to', email);
    try {
        const info = await transporter.sendMail({
            from: `"CADD CORE" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '✅ Payment Successful - CADD CORE',
            html,
        });
        console.log('Email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending success email:', error);
        throw error;
    }
};
exports.sendPaymentSuccessEmail = sendPaymentSuccessEmail;
const sendPaymentFailedEmail = async (email, userName, amount, transactionId) => {
    const html = (0, emailTemplates_1.paymentFailedTemplate)(userName, amount, transactionId);
    console.log('Sending failure email to', email);
    try {
        const info = await transporter.sendMail({
            from: `"CADD CORE" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '❌ Payment Failed - CADD CORE',
            html,
        });
        console.log('Failure email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending failure email:', error);
        throw error;
    }
};
exports.sendPaymentFailedEmail = sendPaymentFailedEmail;
//# sourceMappingURL=sendPaymentEmail.js.map