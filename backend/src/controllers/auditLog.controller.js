'use strict';

const AuditLogService = require('../services/auditLog.service');
const { sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class AuditLogController {
  async findAllLogs(req, res) {
    const { logs, meta } = await AuditLogService.findAll(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Audit logs'), logs, meta);
  }
}

module.exports = new AuditLogController();
