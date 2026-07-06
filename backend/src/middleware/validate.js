'use strict';

const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');

/**
 * Validation runner middleware
 * Collects express-validator errors and throws AppError
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
      value: e.value,
    }));
    return next(new AppError(MESSAGES.VALIDATION_ERROR, 422, formattedErrors));
  }

  next();
};

module.exports = validate;
