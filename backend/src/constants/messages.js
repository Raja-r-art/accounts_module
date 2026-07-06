'use strict';

const MESSAGES = Object.freeze({
  // Auth
  AUTH_REGISTER_SUCCESS: 'User registered successfully.',
  AUTH_LOGIN_SUCCESS: 'Login successful.',
  AUTH_LOGOUT_SUCCESS: 'Logged out successfully.',
  AUTH_REFRESH_SUCCESS: 'Token refreshed successfully.',
  AUTH_FORGOT_PASSWORD_SUCCESS: 'Password reset email sent successfully.',
  AUTH_RESET_PASSWORD_SUCCESS: 'Password reset successfully.',
  AUTH_CHANGE_PASSWORD_SUCCESS: 'Password changed successfully.',
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password.',
  AUTH_TOKEN_EXPIRED: 'Token has expired. Please login again.',
  AUTH_TOKEN_INVALID: 'Invalid token. Please login again.',
  AUTH_UNAUTHORIZED: 'Unauthorized. Please login to continue.',
  AUTH_FORBIDDEN: 'Access denied. Insufficient permissions.',
  AUTH_ACCOUNT_INACTIVE: 'Account is inactive. Contact administrator.',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email to continue.',

  // CRUD
  CREATE_SUCCESS: (resource) => `${resource} created successfully.`,
  UPDATE_SUCCESS: (resource) => `${resource} updated successfully.`,
  DELETE_SUCCESS: (resource) => `${resource} deleted successfully.`,
  FETCH_SUCCESS: (resource) => `${resource} fetched successfully.`,
  NOT_FOUND: (resource) => `${resource} not found.`,
  ALREADY_EXISTS: (resource) => `${resource} already exists.`,

  // Validation
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  INVALID_ID: 'Invalid ID format.',

  // Fee
  FEE_PAYMENT_SUCCESS: 'Fee payment recorded successfully.',
  RECEIPT_GENERATED: 'Receipt generated successfully.',

  // General
  SERVER_ERROR: 'Internal server error. Please try again later.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
});

module.exports = { MESSAGES };
