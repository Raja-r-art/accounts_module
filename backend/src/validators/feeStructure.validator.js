'use strict';

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { FEE_TYPES } = require('../constants/status');

const createFeeStructureValidator = [
  body('course')
    .trim()
    .notEmpty().withMessage('Course is required'),
  body('semester')
    .notEmpty().withMessage('Semester is required')
    .isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
  body('feeType')
    .notEmpty().withMessage('Fee type is required')
    .isIn(FEE_TYPES).withMessage(`Invalid fee type. Must be one of: ${FEE_TYPES.join(', ')}`),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().toDate().withMessage('Invalid Due Date format (YYYY-MM-DD)'),
  body('academicYear')
    .trim()
    .notEmpty().withMessage('Academic year is required')
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in YYYY-YYYY format'),
  body('description')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  validate,
];

const updateFeeStructureValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Fee Structure ID'),
  body('course')
    .optional()
    .trim(),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
  body('feeType')
    .optional()
    .isIn(FEE_TYPES).withMessage(`Invalid fee type. Must be one of: ${FEE_TYPES.join(', ')}`),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate')
    .optional()
    .isISO8601().toDate().withMessage('Invalid Due Date format (YYYY-MM-DD)'),
  body('academicYear')
    .optional()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in YYYY-YYYY format'),
  body('description')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  validate,
];

module.exports = {
  createFeeStructureValidator,
  updateFeeStructureValidator,
};
