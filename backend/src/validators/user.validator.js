'use strict';

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { ROLES } = require('../constants/roles');
const { USER_STATUS } = require('../constants/status');

const createUserValidator = [
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
    .notEmpty().withMessage('Role is required')
    .isIn(Object.values(ROLES)).withMessage(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`),
  body('status')
    .optional()
    .isIn(Object.values(USER_STATUS)).withMessage(`Invalid status. Must be one of: ${Object.values(USER_STATUS).join(', ')}`),
  validate,
];

const updateUserValidator = [
  param('id')
    .isMongoId().withMessage('Invalid User ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`),
  body('status')
    .optional()
    .isIn(Object.values(USER_STATUS)).withMessage(`Invalid status. Must be one of: ${Object.values(USER_STATUS).join(', ')}`),
  validate,
];

const mongoIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate,
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  mongoIdValidator,
};
