import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { createToken } from '../../utils/verifyJWT';
import { USER_ROLE } from '../User/user.constant';
import { TLoginUser, TRegisterUser, TBulkRegisterUser } from './auth.interface';
import AppError from '../../error/AppError';
import config from '../../../config';
import { User } from '../User/user.model';

import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/emailSender';
import { TUser } from '../User/user.interface';
import { TForgotPassword, TResetPassword } from './auth.interface';

// Add this to your existing imports

// Update your registerUser function to include email verification
export const registerUser = async (payload: TRegisterUser) => {
  const existingUser = await User.isUserExistsByEmail(payload.email);

// 1. If user exists and already verified
if (existingUser) {
  if (existingUser.emailVerified === true) {
    throw new AppError(httpStatus.CONFLICT, 'This user already exists and is verified.');
  }

  
  if (existingUser.emailVerified === false) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This user already exists but is not verified. Please check your email.');
  }
}

// 2. Proceed to register new user
payload.role = USER_ROLE.USER;

const verificationToken = crypto.randomBytes(32).toString('hex');
const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

const newUser = await User.create({
  ...payload,
  emailVerificationToken: verificationToken,
  emailVerificationTokenExpires: verificationTokenExpires,
});

await sendVerificationEmail(newUser.email, verificationToken);

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

const accessToken = createToken(
  jwtPayload as any,
  config.jwt_access_secret as string,
  config.jwt_access_expires_in as string
);

const refreshToken = createToken(
  jwtPayload as any,
  config.jwt_refresh_secret as string,
  config.jwt_refresh_expires_in as string
);

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
// Add this new function for email verification
const verifyEmail = async (token: string) => {
  // First, find user with this token (regardless of expiration to handle already verified case)
  const userWithToken = await User.findOne({
    emailVerificationToken: token,
  });

  if (!userWithToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid verification token');
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
    throw new AppError(httpStatus.BAD_REQUEST, 'Verification token has expired');
  }

  // Update user to mark email as verified
  userWithToken.emailVerified = true;
  userWithToken.emailVerificationToken = undefined as any;
  userWithToken.emailVerificationTokenExpires = undefined as any;
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



const loginUser = async (payload: TLoginUser) => {
 
   const user = await User.isUserExistsByEmail(payload?.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  const userStatus = user?.status;

  if (userStatus === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');


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

  const accessToken = createToken(
    jwtPayload as any,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload as any,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  const user = await User.isUserExistsByEmail(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }


  const userStatus = user?.status;

  if (userStatus === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }


  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      email: new RegExp(`^${userData.email}$`, 'i'),
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  return null;
};




const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string
  ) as JwtPayload;

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
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

  const accessToken = createToken(
    jwtPayload as any,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};




const resendVerificationEmail = async (email: string) => {
  const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.emailVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email is already verified');
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Update user with new token
  user.emailVerificationToken = verificationToken;
  user.emailVerificationTokenExpires = verificationTokenExpires;
  await user.save();

  // Send verification email
  await sendVerificationEmail(user.email, verificationToken);

  return {
    message: 'Verification email resent successfully',
  };
};

const getMyProfile = async (userId: string): Promise<any> => {
  const user = await User.findById(userId).populate('companyId');
  
  if (!user) return null;
  
  // For COMPANY role users, include company status
  if (user.role === 'COMPANY' && user.companyId) {
    const userObj = user.toObject();
    const company = userObj.companyId as any;
    return {
      ...userObj,
      companyId: company?._id,
      companyStatus: company?.status || 'PENDING',
      companyName: company?.name,
    };
  }
  
  return user;
};

const forgotPassword = async (payload: TForgotPassword) => {
  const user = await User.findOne({ email: new RegExp(`^${payload.email}$`, 'i') });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found with this email');
  }

  // Check if user is blocked
  if (user.status === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  // Generate password reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Update user with reset token
  user.passwordResetToken = resetToken;
  user.passwordResetTokenExpires = resetTokenExpires;
  await user.save();

  // Send password reset email
  await sendPasswordResetEmail(user.email, resetToken);

  return {
    message: 'Password reset email sent successfully',
  };
};

const resetPassword = async (payload: TResetPassword) => {
  // Find user with this token and check expiration
  const user = await User.findOne({
    passwordResetToken: payload.token,
    passwordResetTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired password reset token');
  }

  // Set the new password - the pre('save') middleware will hash it automatically
  user.password = payload.newPassword;
  user.passwordResetToken = undefined as any;
  user.passwordResetTokenExpires = undefined as any;
  user.passwordChangedAt = new Date();
  
  // Save the user - this will trigger the pre('save') middleware to hash the password
  await user.save();

  return {
    message: 'Password reset successfully',
  };
};

const bulkRegisterUsers = async (payload: TBulkRegisterUser) => {
  const { users } = payload;
  const results = [];
  const errors = [];

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await User.isUserExistsByEmail(userData.email);

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
      userData.role = userData.role || USER_ROLE.USER;

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new user
      const newUser = await User.create({
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

    } catch (error: any) {
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
const logout = async (token: string) => {
  // In production, you might want to store this in Redis or database
  // For now, we'll just return success
  // The controller handles token blacklisting
  return {
    message: 'Logged out successfully'
  };
};

// Add this to the exports
export const AuthServices = {
  registerUser,
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