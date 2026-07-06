'use strict';

const AuthService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');
const jwtConfig = require('../config/jwt');

class AuthController {
  async register(req, res) {
    const result = await AuthService.register(req.body);
    return sendSuccess(res, 211, MESSAGES.AUTH_REGISTER_SUCCESS, result);
  }

  async login(req, res) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const { email, password } = req.body;

    const result = await AuthService.login(email, password, ipAddress, userAgent);

    // Set refresh token cookie
    res.cookie('refreshToken', result.refreshToken, jwtConfig.cookieOptions);

    return sendSuccess(res, 200, MESSAGES.AUTH_LOGIN_SUCCESS, {
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  async logout(req, res) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    res.clearCookie('refreshToken', jwtConfig.cookieOptions);
    return sendSuccess(res, 200, MESSAGES.AUTH_LOGOUT_SUCCESS);
  }

  async refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required.' });
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.refreshToken(refreshToken, ipAddress, userAgent);

    return sendSuccess(res, 200, MESSAGES.AUTH_REFRESH_SUCCESS, result);
  }

  async forgotPassword(req, res) {
    await AuthService.forgotPassword(req.body.email);
    return sendSuccess(res, 200, MESSAGES.AUTH_FORGOT_PASSWORD_SUCCESS);
  }

  async resetPassword(req, res) {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    return sendSuccess(res, 200, MESSAGES.AUTH_RESET_PASSWORD_SUCCESS);
  }

  async changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user.id, oldPassword, newPassword);
    return sendSuccess(res, 200, MESSAGES.AUTH_CHANGE_PASSWORD_SUCCESS);
  }

  async verifyEmail(req, res) {
    await AuthService.verifyEmail(req.body.token);
    return sendSuccess(res, 200, 'Email verified successfully.');
  }
}

module.exports = new AuthController();
