'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLogger');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyEmailValidator,
} = require('../validators/auth.validator');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post('/register', registerValidator, auditLog('create', 'auth'), AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 */
router.post('/login', authLimiter, loginValidator, auditLog('login', 'auth'), AuthController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 */
router.post('/logout', auditLog('logout', 'auth'), AuthController.logout);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset token email
 *     tags: [Auth]
 */
router.post('/forgot-password', forgotPasswordValidator, AuthController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post('/reset-password', resetPasswordValidator, AuthController.resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password (Authenticated)
 *     tags: [Auth]
 */
router.post('/change-password', authenticate, changePasswordValidator, AuthController.changePassword);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address with token
 *     tags: [Auth]
 */
router.post('/verify-email', verifyEmailValidator, AuthController.verifyEmail);

module.exports = router;
