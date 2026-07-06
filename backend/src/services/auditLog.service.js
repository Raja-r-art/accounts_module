'use strict';

const AuditLogRepository = require('../repositories/auditLog.repository');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class AuditLogService {
  async create(data) {
    return AuditLogRepository.create(data);
  }

  async findAll(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = AuditLogRepository.buildFilter(query);

    const logs = await AuditLogRepository.findAll({
      filter,
      sort,
      skip,
      limit,
      populate: ['user'],
    });

    const total = await AuditLogRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { logs, meta };
  }
}

module.exports = new AuditLogService();
