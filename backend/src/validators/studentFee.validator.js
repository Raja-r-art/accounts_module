'use strict';

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { PAYMENT_METHODS, FEE_STATUS } = require('../constants/status');

const assignFeeValidator = [
  body('student')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid Student ID format'),
  body('feeStructure')
    .notEmpty().withMessage('Fee Structure ID is required')
    .isMongoId().withMessage('Invalid Fee Structure ID format'),
  body('discount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount cannot be negative'),
  body('scholarship')
    .optional()
    .isFloat({ min: 0 }).withMessage('Scholarship cannot be negative'),
  body('fine')
    .optional()
    .isFloat({ min: 0 }).withMessage('Fine cannot be negative'),
  body('dueDate')
    .optional()
    .isISO8601().toDate().withMessage('Invalid Due Date format (YYYY-MM-DD)'),
  validate,
];

const recordPaymentValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Student Fee Record ID'),
  body('paidAmount')
    .notEmpty().withMessage('Paid amount is required')
    .isFloat({ min: 0.01 }).withMessage('Paid amount must be greater than 0'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(Object.values(PAYMENT_METHODS)).withMessage(`Invalid payment method. Allowed: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  body('transactionId')
    .optional()
    .trim(),
  body('remarks')
    .optional()
    .trim(),
  validate,
];

const updateStudentFeeValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Student Fee Record ID'),
  body('discount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount cannot be negative'),
  body('scholarship')
    .optional()
    .isFloat({ min: 0 }).withMessage('Scholarship cannot be negative'),
  body('fine')
    .optional()
    .isFloat({ min: 0 }).withMessage('Fine cannot be negative'),
  body('status')
    .optional()
    .isIn(Object.values(FEE_STATUS)).withMessage(`Invalid status. Must be one of: ${Object.values(FEE_STATUS).join(', ')}`),
  body('dueDate')
    .optional()
    .isISO8601().toDate().withMessage('Invalid Due Date'),
  validate,
];

module.exports = {
  assignFeeValidator,
  recordPaymentValidator,
  updateStudentFeeValidator,
};
