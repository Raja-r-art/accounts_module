'use strict';

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { INCOME_SOURCES } = require('../constants/status');

const createIncomeValidator = [
  body('source')
    .notEmpty().withMessage('Source is required')
    .isIn(INCOME_SOURCES).withMessage(`Invalid source. Allowed: ${INCOME_SOURCES.join(', ')}`),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid Date format (YYYY-MM-DD)'),
  body('description')
    .optional()
    .trim(),
  body('reference')
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

const updateIncomeValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Income ID'),
  body('source')
    .optional()
    .isIn(INCOME_SOURCES).withMessage(`Invalid source. Allowed: ${INCOME_SOURCES.join(', ')}`),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid Date format (YYYY-MM-DD)'),
  body('description')
    .optional()
    .trim(),
  body('reference')
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
  createIncomeValidator,
  updateIncomeValidator,
};
