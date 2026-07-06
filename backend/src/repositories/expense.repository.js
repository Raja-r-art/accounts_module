'use strict';

const BaseRepository = require('./base.repository');
const Expense = require('../models/Expense');

class ExpenseRepository extends BaseRepository {
  constructor() { super(Expense); }

  buildFilter(query) {
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.vendor) filter.vendor = { $regex: query.vendor, $options: 'i' };
    if (query.fromDate || query.toDate) {
      filter.date = {};
      if (query.fromDate) filter.date.$gte = new Date(query.fromDate);
      if (query.toDate) filter.date.$lte = new Date(query.toDate);
    }
    return filter;
  }

  async getCategoryWiseTotals(startDate, endDate) {
    return Expense.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
  }
}

module.exports = new ExpenseRepository();
