'use strict';

const BaseRepository = require('./base.repository');
const AuditLog = require('../models/AuditLog');

class AuditLogRepository extends BaseRepository {
  constructor() { super(AuditLog); }

  buildFilter(query) {
    const filter = {};
    if (query.user) filter.user = query.user;
    if (query.action) filter.action = query.action;
    if (query.resource) filter.resource = query.resource;
    if (query.fromDate || query.toDate) {
      filter.createdAt = {};
      if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
      if (query.toDate) filter.createdAt.$lte = new Date(query.toDate);
    }
    return filter;
  }
}

module.exports = new AuditLogRepository();
