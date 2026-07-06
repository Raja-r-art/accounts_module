'use strict';

const AuditLogService = require('../services/auditLog.service');
const logger = require('../utils/logger.util');

/**
 * Audit Logger Middleware Factory
 * @param {string} action - The action to log
 * @param {string} resource - The resource type
 */
const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      res.locals.responseData = data;
      return originalJson(data);
    };

    res.on('finish', async () => {
      try {
        if (res.statusCode < 400) {
          const userId = req.user?.id || null;
          const resourceId = req.params?.id || res.locals.responseData?.data?._id || null;

          await AuditLogService.create({
            user: userId,
            action,
            resource,
            resourceId: resourceId ? resourceId.toString() : null,
            ipAddress: req.ip || req.socket?.remoteAddress,
            userAgent: req.headers['user-agent'],
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            details: resource === 'auth' ? { email: req.body?.email } : null,
          });
        }
      } catch (err) {
        logger.error(`Audit log failed: ${err.message}`);
      }
    });

    next();
  };
};

module.exports = { auditLog };
