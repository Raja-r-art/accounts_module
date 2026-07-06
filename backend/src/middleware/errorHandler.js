'use strict';

const AppError = require('../utils/AppError');
const logger = require('../utils/logger.util');

/**
 * Handle Mongoose Validation Errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed.', 400, errors);
};

/**
 * Handle Mongoose Cast Errors (invalid ObjectId)
 */
const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

/**
 * Handle MongoDB Duplicate Key Errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`Duplicate value for field '${field}'. Please use a different value.`, 409);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => new AppError('Invalid token. Please login again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please login again.', 401);

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  if (err.statusCode >= 500) {
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
      stack: err.stack,
      body: req.body,
    });
  } else {
    logger.warn(`${err.statusCode} - ${err.message} - ${req.originalUrl}`);
  }

  let error = err;

  if (err.name === 'ValidationError') error = handleValidationError(err);
  else if (err.name === 'CastError') error = handleCastError(err);
  else if (err.code === 11000) error = handleDuplicateKeyError(err);
  else if (err.name === 'JsonWebTokenError') error = handleJWTError();
  else if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const response = {
    success: false,
    status: error.status || 'error',
    message: error.message || 'Internal Server Error',
  };

  if (error.errors && error.errors.length > 0) response.errors = error.errors;

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
