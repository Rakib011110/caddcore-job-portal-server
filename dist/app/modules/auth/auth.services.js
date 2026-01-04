"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJWT_1 = require("../../utils/verifyJWT");
const user_constant_1 = require("../User/user.constant");
const AppError_1 = __importDefault(require("../../error/AppError"));
const config_1 = __importDefault(require("../../../config"));
const user_model_1 = require("../User/user.model");
const crypto_1 = __importDefault(require("crypto"));
const emailSender_1 = require("../../utils/emailSender");
// Add this to your existing imports
// Update your registerUser function to include email verification
const registerUser = async (payload) => {
    const existingUser = await user_model_1.User.isUserExistsByEmail(payload.email);
    // 1. If user exists and already verified
    if (existingUser) {
        if (existingUser.emailVerified === true) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'This user already exists and is verified.');
        }
        if (existingUser.emailVerified === false) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This user already exists but is not verified. Please check your email.');
        }
    }
    // 2. Proceed to register new user
    payload.role = user_constant_1.USER_ROLE.USER;
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const newUser = await user_model_1.User.create({
        ...payload,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationTokenExpires,
    });
    await (0, emailSender_1.sendVerificationEmail)(newUser.email, verificationToken);
    const jwtPayload = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        role: newUser.role,
        status: newUser.status,
        emailVerified: newUser.emailVerified,
        age: newUser.age,
        cvUrl: newUser.cvUrl,
        experienceCertificateUrl: newUser.experienceCertificateUrl,
        universityCertificateUrl: newUser.universityCertificateUrl,
    };
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
        user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            emailVerified: newUser.emailVerified,
        },
    };
};
exports.registerUser = registerUser;
// Add this new function for email verification
const verifyEmail = async (token) => {
    // First, find user with this token (regardless of expiration to handle already verified case)
    const userWithToken = await user_model_1.User.findOne({
        emailVerificationToken: token,
    });
    if (!userWithToken) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid verification token');
    }
    // Check if already verified
    if (userWithToken.emailVerified) {
        return {
            message: 'Email is already verified',
            user: {
                _id: userWithToken._id,
                name: userWithToken.name,
                email: userWithToken.email,
                emailVerified: userWithToken.emailVerified,
            },
        };
    }
    // Check if token is expired
    if (userWithToken.emailVerificationTokenExpires && userWithToken.emailVerificationTokenExpires < new Date()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Verification token has expired');
    }
    // Update user to mark email as verified
    userWithToken.emailVerified = true;
    userWithToken.emailVerificationToken = undefined;
    userWithToken.emailVerificationTokenExpires = undefined;
    await userWithToken.save();
    return {
        message: 'Email verified successfully',
        user: {
            _id: userWithToken._id,
            name: userWithToken.name,
            email: userWithToken.email,
            emailVerified: userWithToken.emailVerified,
        },
    };
};
const loginUser = async (payload) => {
    const user = await user_model_1.User.isUserExistsByEmail(payload?.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    const userStatus = user?.status;
    if (userStatus === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    //checking if the password is correct
    if (!(await user_model_1.User.isPasswordMatched(payload?.password, user?.password)))
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password do not matched');
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        companyId: user.companyId, // For COMPANY role users
        emailVerified: user.emailVerified,
        status: user.status,
        age: user.age,
        cvUrl: user.cvUrl,
        experienceCertificateUrl: user.experienceCertificateUrl,
        universityCertificateUrl: user.universityCertificateUrl,
    };
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
};
const changePassword = async (userData, payload) => {
    const user = await user_model_1.User.isUserExistsByEmail(userData.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    const userStatus = user?.status;
    if (userStatus === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (!(await user_model_1.User.isPasswordMatched(payload.oldPassword, user?.password)))
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password do not matched');
    const newHashedPassword = await bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    await user_model_1.User.findOneAndUpdate({
        email: new RegExp(`^${userData.email}$`, 'i'),
        role: userData.role,
    }, {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
    });
    return null;
};
const refreshToken = async (token) => {
    // checking if the given token is valid
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_refresh_secret);
    const { email, iat } = decoded;
    // checking if the user is exist
    const user = await user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    // checking if the user is blocked
    const userStatus = user?.status;
    if (userStatus === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.passwordChangedAt &&
        user_model_1.User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized !');
    }
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        emailVerified: user.emailVerified,
        status: user.status,
        age: user.age,
        cvUrl: user.cvUrl,
        experienceCertificateUrl: user.experienceCertificateUrl,
        universityCertificateUrl: user.universityCertificateUrl,
    };
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
};
const resendVerificationEmail = async (email) => {
    const user = await user_model_1.User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.emailVerified) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Email is already verified');
    }
    // Generate new token
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpires = verificationTokenExpires;
    await user.save();
    // Send verification email
    await (0, emailSender_1.sendVerificationEmail)(user.email, verificationToken);
    return {
        message: 'Verification email resent successfully',
    };
};
const getMyProfile = async (userId) => {
    const user = await user_model_1.User.findById(userId).populate('companyId');
    if (!user)
        return null;
    // For COMPANY role users, include company status
    if (user.role === 'COMPANY' && user.companyId) {
        const userObj = user.toObject();
        const company = userObj.companyId;
        return {
            ...userObj,
            companyId: company?._id,
            companyStatus: company?.status || 'PENDING',
            companyName: company?.name,
        };
    }
    return user;
};
const forgotPassword = async (payload) => {
    const user = await user_model_1.User.findOne({ email: new RegExp(`^${payload.email}$`, 'i') });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found with this email');
    }
    // Check if user is blocked
    if (user.status === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    // Generate password reset token
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    // Update user with reset token
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = resetTokenExpires;
    await user.save();
    // Send password reset email
    await (0, emailSender_1.sendPasswordResetEmail)(user.email, resetToken);
    return {
        message: 'Password reset email sent successfully',
    };
};
const resetPassword = async (payload) => {
    // Find user with this token and check expiration
    const user = await user_model_1.User.findOne({
        passwordResetToken: payload.token,
        passwordResetTokenExpires: { $gt: new Date() },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid or expired password reset token');
    }
    // Set the new password - the pre('save') middleware will hash it automatically
    user.password = payload.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = new Date();
    // Save the user - this will trigger the pre('save') middleware to hash the password
    await user.save();
    return {
        message: 'Password reset successfully',
    };
};
const bulkRegisterUsers = async (payload) => {
    const { users } = payload;
    const results = [];
    const errors = [];
    for (const userData of users) {
        try {
            // Check if user already exists
            const existingUser = await user_model_1.User.isUserExistsByEmail(userData.email);
            if (existingUser) {
                if (existingUser.emailVerified === true) {
                    errors.push({
                        email: userData.email,
                        error: 'User already exists and is verified'
                    });
                    continue;
                }
                if (existingUser.emailVerified === false) {
                    errors.push({
                        email: userData.email,
                        error: 'User already exists but is not verified'
                    });
                    continue;
                }
            }
            // Set default role if not provided
            userData.role = userData.role || user_constant_1.USER_ROLE.USER;
            // Generate verification token
            const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
            const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            // Create new user
            const newUser = await user_model_1.User.create({
                ...userData,
                emailVerificationToken: verificationToken,
                emailVerificationTokenExpires: verificationTokenExpires,
            });
            // Send verification email
            // await sendVerificationEmail(newUser.email, verificationToken);
            results.push({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                emailVerified: newUser.emailVerified,
            });
        }
        catch (error) {
            errors.push({
                email: userData.email,
                error: error.message || 'Failed to register user'
            });
        }
    }
    return {
        message: `Bulk registration completed. ${results.length} users registered successfully, ${errors.length} errors.`,
        successful: results,
        errors: errors,
        totalProcessed: users.length,
        successCount: results.length,
        errorCount: errors.length
    };
};
// Add logout service
const logout = async (token) => {
    // In production, you might want to store this in Redis or database
    // For now, we'll just return success
    // The controller handles token blacklisting
    return {
        message: 'Logged out successfully'
    };
};
// Add this to the exports
exports.AuthServices = {
    registerUser: exports.registerUser,
    loginUser,
    logout,
    changePassword,
    refreshToken,
    verifyEmail,
    resendVerificationEmail,
    getMyProfile,
    forgotPassword,
    resetPassword,
    bulkRegisterUsers
};
//# sourceMappingURL=auth.services.js.map