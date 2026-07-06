'use strict';

const { body, query } = require('express-validator');
const validate = require('../middleware/validate');
const { ROLES } = require('../constants/roles');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`),
  validate,
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  validate,
];

const resetPasswordValidator = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required'),
  body('password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  validate,
];

const changePasswordValidator = [
  body('oldPassword')
    .notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('New password must be different from the old password');
      }
      return true;
    }),
  validate,
];

const verifyEmailValidator = [
  body('token')
    .trim()
    .notEmpty().withMessage('Verification token is required'),
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyEmailValidator,
};
