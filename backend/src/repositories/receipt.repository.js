'use strict';

const BaseRepository = require('./base.repository');
const Receipt = require('../models/Receipt');

class ReceiptRepository extends BaseRepository {
  constructor() { super(Receipt); }

  findByReceiptNumber(receiptNumber) {
    return Receipt.findOne({ receiptNumber }).populate('student issuedBy');
  }

  findByStudent(studentId) {
    return Receipt.find({ student: studentId }).sort({ createdAt: -1 });
  }

  buildFilter(query) {
    const filter = {};
    if (query.student) filter.student = query.student;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.search) {
      filter.$or = [
        { receiptNumber: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.fromDate || query.toDate) {
      filter.paymentDate = {};
      if (query.fromDate) filter.paymentDate.$gte = new Date(query.fromDate);
      if (query.toDate) filter.paymentDate.$lte = new Date(query.toDate);
    }
    return filter;
  }
}

module.exports = new ReceiptRepository();
