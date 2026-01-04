"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer_1.default.createTransport({
        host: config_1.default.email_host,
        port: Number(config_1.default.email_port),
        secure: false, // 👈 must be false for port 587
        auth: {
            user: config_1.default.email_user,
            pass: config_1.default.email_pass,
        },
    });
    const verificationUrl = `${config_1.default.client_url}/verify-email?token=${token}`;
    await transporter.sendMail({
        from: config_1.default.email_from,
        to: email,
        subject: 'Email Verification',
        html: `
      <p>Please click the following link to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, token) => {
    const transporter = nodemailer_1.default.createTransport({
        host: config_1.default.email_host,
        port: Number(config_1.default.email_port),
        secure: false,
        auth: {
            user: config_1.default.email_user,
            pass: config_1.default.email_pass,
        },
    });
    const client_url = `${config_1.default.client_url}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: config_1.default.email_from,
        to: email,
        subject: 'Password Reset Request',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You have requested to reset your password. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${client_url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${client_url}</p>
        <p><strong>Important:</strong> This link will expire in 15 minutes for security reasons.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply to this email.</p>
      </div>
    `,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=emailSender.js.map