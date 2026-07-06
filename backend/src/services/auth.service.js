'use strict';

const crypto = require('crypto');
const UserRepository = require('../repositories/user.repository');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const { sendPasswordResetEmail, sendEmail } = require('../utils/email.util');

class AuthService {
  async register(userData) {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError(MESSAGES.ALREADY_EXISTS('User with this email'), 409);
    }

    const user = await UserRepository.create(userData);

    // Generate email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // In a real app, send verification email
    // For development, we'll log it and prepare to send
    try {
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your email - College ERP',
        html: `<h2>Email Verification</h2><p>Please verify your email by clicking: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
      });
    } catch (_) {
      // Don't fail registration if mail fails in dev
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  async login(email, password, ipAddress, userAgent) {
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError(MESSAGES.AUTH_INVALID_CREDENTIALS, 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError(MESSAGES.AUTH_INVALID_CREDENTIALS, 401);
    }

    if (user.status !== 'active') {
      throw new AppError(MESSAGES.AUTH_ACCOUNT_INACTIVE, 403);
    }

    await UserRepository.updateLastLogin(user._id);

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    const expiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10) || 7;
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(tokenString) {
    await RefreshToken.findOneAndUpdate({ token: tokenString }, { isRevoked: true });
  }

  async refreshToken(tokenString, ipAddress, userAgent) {
    const decoded = verifyRefreshToken(tokenString);

    const savedToken = await RefreshToken.findOne({ token: tokenString, isRevoked: false });
    if (!savedToken) {
      throw new AppError('Refresh token has been revoked or is invalid.', 401);
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      throw new AppError(MESSAGES.AUTH_ACCOUNT_INACTIVE, 403);
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const newAccessToken = generateAccessToken(payload);

    return { accessToken: newAccessToken };
  }

  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // To prevent user enumeration, we don't throw an error, just return success
      return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    await sendPasswordResetEmail({ to: user.email, resetToken });
  }

  async resetPassword(token, password) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserRepository.findByPasswordResetToken(hashedToken);
    if (!user) {
      throw new AppError('Reset token is invalid or has expired.', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all existing refresh tokens for the user
    await RefreshToken.revokeAllForUser(user._id);
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError(MESSAGES.NOT_FOUND('User'), 404);
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new AppError('Incorrect old password.', 400);
    }

    user.password = newPassword;
    await user.save();

    // Revoke all other sessions after password change
    await RefreshToken.revokeAllForUser(userId);
  }

  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Verification token is invalid or has expired.', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }
}

module.exports = new AuthService();
