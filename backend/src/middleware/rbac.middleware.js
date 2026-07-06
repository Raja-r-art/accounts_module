'use strict';

const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');

/**
 * Role-Based Access Control middleware
 * @param {...string} allowedRoles - Roles that can access this route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(MESSAGES.AUTH_UNAUTHORIZED, 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(
        `${MESSAGES.AUTH_FORBIDDEN} Required roles: ${allowedRoles.join(', ')}`,
        403
      ));
    }

    next();
  };
};

module.exports = { authorize };
