'use strict';

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt.util');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const UserRepository = require('../repositories/user.repository');

/**
 * Authenticate middleware — verifies JWT access token
 */
const authenticate = async (req, res, next) => {
  const token = extractTokenFromHeader(req);

  if (!token) {
    return next(new AppError(MESSAGES.AUTH_UNAUTHORIZED, 401));
  }

  const decoded = verifyAccessToken(token);
  const user = await UserRepository.findById(decoded.userId);

  if (!user) {
    return next(new AppError(MESSAGES.AUTH_UNAUTHORIZED, 401));
  }

  if (user.status !== 'active') {
    return next(new AppError(MESSAGES.AUTH_ACCOUNT_INACTIVE, 403));
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  next();
};

/**
 * Optional authentication — does not fail if no token
 */
const optionalAuthenticate = async (req, res, next) => {
  const token = extractTokenFromHeader(req);
  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    const user = await UserRepository.findById(decoded.userId);
    if (user && user.status === 'active') {
      req.user = { id: user._id.toString(), email: user.email, role: user.role, name: user.name };
    }
  } catch (_) { /* ignore */ }
  next();
};

module.exports = { authenticate, optionalAuthenticate };
