'use strict';

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const AppError = require('./AppError');

/**
 * Generate Access Token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn,
    issuer: 'college-erp',
    audience: 'college-erp-client',
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn,
    issuer: 'college-erp',
    audience: 'college-erp-client',
  });
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.access.secret, {
      issuer: 'college-erp',
      audience: 'college-erp-client',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token has expired.', 401);
    }
    throw new AppError('Invalid access token.', 401);
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refresh.secret, {
      issuer: 'college-erp',
      audience: 'college-erp-client',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token has expired. Please login again.', 401);
    }
    throw new AppError('Invalid refresh token.', 401);
  }
};

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
};
