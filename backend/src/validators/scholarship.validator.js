'use strict';

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { SCHOLARSHIP_STATUS } = require('../constants/status');

const createScholarshipValidator = [
  body('student')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid Student ID format'),
  body('scholarshipName')
    .trim()
    .notEmpty().withMessage('Scholarship name is required'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in YYYY-YYYY format'),
  body('remarks')
    .optional()
    .trim(),
  validate,
];

const updateScholarshipValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Scholarship ID'),
  body('student')
    .optional()
    .isMongoId().withMessage('Invalid Student ID format'),
  body('scholarshipName')
    .optional()
    .trim(),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in YYYY-YYYY format'),
  body('remarks')
    .optional()
    .trim(),
  validate,
];

const approveScholarshipValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Scholarship ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn([SCHOLARSHIP_STATUS.APPROVED, SCHOLARSHIP_STATUS.REJECTED]).withMessage('Status must be approved or rejected'),
  body('reason')
    .optional()
    .trim(),
  validate,
];

module.exports = {
  createScholarshipValidator,
  updateScholarshipValidator,
  approveScholarshipValidator,
};
