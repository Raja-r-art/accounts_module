'use strict';

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { EXPENSE_CATEGORIES } = require('../constants/status');

const createExpenseValidator = [
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(EXPENSE_CATEGORIES).withMessage(`Invalid category. Allowed: ${EXPENSE_CATEGORIES.join(', ')}`),
  body('vendor')
    .optional()
    .trim(),
  body('invoiceNumber')
    .optional()
    .trim(),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid Date format (YYYY-MM-DD)'),
  body('description')
    .optional()
    .trim(),
  body('paymentMethod')
    .optional()
    .trim(),
  body('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in YYYY-YYYY format'),
  body('remarks')
    .optional()
    .trim(),
  validate,
];

const updateExpenseValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Expense ID'),
  body('category')
    .optional()
    .isIn(EXPENSE_CATEGORIES).withMessage(`Invalid category. Allowed: ${EXPENSE_CATEGORIES.join(', ')}`),
  body('vendor')
    .optional()
    .trim(),
  body('invoiceNumber')
    .optional()
    .trim(),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid Date format (YYYY-MM-DD)'),
  body('description')
    .optional()
    .trim(),
  body('paymentMethod')
    .optional()
    .trim(),
  body('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in YYYY-YYYY format'),
  body('remarks')
    .optional()
    .trim(),
  validate,
];

module.exports = {
  createExpenseValidator,
  updateExpenseValidator,
};
