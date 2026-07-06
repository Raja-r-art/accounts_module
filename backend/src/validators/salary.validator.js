'use strict';

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { SALARY_STATUS } = require('../constants/status');

const createSalaryValidator = [
  body('employee')
    .notEmpty().withMessage('Employee ID is required')
    .isMongoId().withMessage('Invalid Employee ID format'),
  body('employeeName')
    .trim()
    .notEmpty().withMessage('Employee name is required'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  body('designation')
    .trim()
    .notEmpty().withMessage('Designation is required'),
  body('basicSalary')
    .notEmpty().withMessage('Basic salary is required')
    .isFloat({ min: 0 }).withMessage('Basic salary must be a positive number'),
  body('allowances')
    .optional()
    .isObject().withMessage('Allowances must be an object'),
  body('allowances.hra')
    .optional()
    .isFloat({ min: 0 }).withMessage('HRA allowance must be positive'),
  body('allowances.da')
    .optional()
    .isFloat({ min: 0 }).withMessage('DA allowance must be positive'),
  body('allowances.ta')
    .optional()
    .isFloat({ min: 0 }).withMessage('TA allowance must be positive'),
  body('allowances.medical')
    .optional()
    .isFloat({ min: 0 }).withMessage('Medical allowance must be positive'),
  body('allowances.other')
    .optional()
    .isFloat({ min: 0 }).withMessage('Other allowance must be positive'),
  body('deductions')
    .optional()
    .isObject().withMessage('Deductions must be an object'),
  body('deductions.pf')
    .optional()
    .isFloat({ min: 0 }).withMessage('PF deduction must be positive'),
  body('deductions.esi')
    .optional()
    .isFloat({ min: 0 }).withMessage('ESI deduction must be positive'),
  body('deductions.tax')
    .optional()
    .isFloat({ min: 0 }).withMessage('Tax deduction must be positive'),
  body('deductions.other')
    .optional()
    .isFloat({ min: 0 }).withMessage('Other deduction must be positive'),
  body('paymentDate')
    .notEmpty().withMessage('Payment date is required')
    .isISO8601().toDate().withMessage('Invalid Payment Date format (YYYY-MM-DD)'),
  body('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt().withMessage('Year must be an integer'),
  body('status')
    .optional()
    .isIn(Object.values(SALARY_STATUS)).withMessage(`Invalid status. Allowed: ${Object.values(SALARY_STATUS).join(', ')}`),
  body('transactionId')
    .optional()
    .trim(),
  body('remarks')
    .optional()
    .trim(),
  validate,
];

const updateSalaryValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Salary Record ID'),
  body('employeeName')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('designation')
    .optional()
    .trim(),
  body('basicSalary')
    .optional()
    .isFloat({ min: 0 }).withMessage('Basic salary must be positive'),
  body('allowances.hra').optional().isFloat({ min: 0 }),
  body('allowances.da').optional().isFloat({ min: 0 }),
  body('allowances.ta').optional().isFloat({ min: 0 }),
  body('allowances.medical').optional().isFloat({ min: 0 }),
  body('allowances.other').optional().isFloat({ min: 0 }),
  body('deductions.pf').optional().isFloat({ min: 0 }),
  body('deductions.esi').optional().isFloat({ min: 0 }),
  body('deductions.tax').optional().isFloat({ min: 0 }),
  body('deductions.other').optional().isFloat({ min: 0 }),
  body('paymentDate')
    .optional()
    .isISO8601().toDate().withMessage('Invalid Payment Date format (YYYY-MM-DD)'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year')
    .optional()
    .isInt().withMessage('Year must be an integer'),
  body('status')
    .optional()
    .isIn(Object.values(SALARY_STATUS)).withMessage(`Invalid status. Allowed: ${Object.values(SALARY_STATUS).join(', ')}`),
  body('transactionId')
    .optional()
    .trim(),
  body('remarks')
    .optional()
    .trim(),
  validate,
];

module.exports = {
  createSalaryValidator,
  updateSalaryValidator,
};
