'use strict';

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { STUDENT_STATUS } = require('../constants/status');

const createStudentValidator = [
  body('admissionNumber')
    .trim()
    .notEmpty().withMessage('Admission number is required')
    .isLength({ min: 3, max: 30 }).withMessage('Admission number must be between 3 and 30 characters'),
  body('name')
    .trim()
    .notEmpty().withMessage('Student name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  body('course')
    .trim()
    .notEmpty().withMessage('Course is required'),
  body('semester')
    .notEmpty().withMessage('Semester is required')
    .isInt({ min: 1, max: 12 }).withMessage('Semester must be an integer between 1 and 12'),
  body('section')
    .optional({ checkFalsy: true })
    .trim(),
  body('academicYear')
    .trim()
    .notEmpty().withMessage('Academic year is required')
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in YYYY-YYYY format'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('dob')
    .optional({ checkFalsy: true })
    .isISO8601().toDate().withMessage('Invalid Date of Birth format (YYYY-MM-DD)'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit mobile number'),
  body('parentName')
    .optional({ checkFalsy: true })
    .trim(),
  body('parentPhone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit parent mobile number'),
  body('parentEmail')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Please provide a valid parent email address')
    .normalizeEmail(),
  body('address')
    .optional()
    .isObject().withMessage('Address must be an object'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),
  validate,
];

const updateStudentValidator = [
  param('id')
    .isMongoId().withMessage('Invalid Student ID'),
  body('admissionNumber')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Admission number must be between 3 and 30 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('department').optional().trim(),
  body('course').optional().trim(),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Semester must be an integer between 1 and 12'),
  body('section').optional().trim(),
  body('academicYear')
    .optional()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in YYYY-YYYY format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('dob')
    .optional({ checkFalsy: true })
    .isISO8601().toDate().withMessage('Invalid Date of Birth format (YYYY-MM-DD)'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit mobile number'),
  body('parentName').optional().trim(),
  body('parentPhone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit parent mobile number'),
  body('parentEmail')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Please provide a valid parent email address')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(Object.values(STUDENT_STATUS)).withMessage(`Invalid status. Must be one of: ${Object.values(STUDENT_STATUS).join(', ')}`),
  validate,
];

module.exports = {
  createStudentValidator,
  updateStudentValidator,
};
