'use strict';

/**
 * Standard success response
 */
const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Standard error response
 */
const sendError = (res, statusCode, message, errors = []) => {
  const response = { success: false, message };
  if (errors.length > 0) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 */
const sendPaginated = (res, statusCode, message, data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
