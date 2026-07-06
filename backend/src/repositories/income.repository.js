'use strict';

const BaseRepository = require('./base.repository');
const Income = require('../models/Income');

class IncomeRepository extends BaseRepository {
  constructor() { super(Income); }

  buildFilter(query) {
    const filter = {};
    if (query.source) filter.source = query.source;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.fromDate || query.toDate) {
      filter.date = {};
      if (query.fromDate) filter.date.$gte = new Date(query.fromDate);
      if (query.toDate) filter.date.$lte = new Date(query.toDate);
    }
    return filter;
  }
}

module.exports = new IncomeRepository();
