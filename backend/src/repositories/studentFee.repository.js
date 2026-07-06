'use strict';

const BaseRepository = require('./base.repository');
const StudentFee = require('../models/StudentFee');

class StudentFeeRepository extends BaseRepository {
  constructor() { super(StudentFee); }

  findByStudent(studentId) {
    return StudentFee.find({ student: studentId }).populate('feeStructure').sort({ createdAt: -1 });
  }

  findByReceiptNumber(receiptNumber) {
    return StudentFee.findOne({ receiptNumber }).populate('student feeStructure');
  }

  findPendingByDueDate(date) {
    return StudentFee.find({
      status: { $in: ['pending', 'partial'] },
      dueDate: { $lte: date },
    }).populate({ path: 'student', select: 'name email phone parentEmail parentPhone' });
  }

  buildFilter(query) {
    const filter = {};
    if (query.student) filter.student = query.student;
    if (query.status) filter.status = query.status;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.fromDate || query.toDate) {
      filter.paymentDate = {};
      if (query.fromDate) filter.paymentDate.$gte = new Date(query.fromDate);
      if (query.toDate) filter.paymentDate.$lte = new Date(query.toDate);
    }
    return filter;
  }

  async getDailyCollection(date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    return StudentFee.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
    ]);
  }

  async getMonthlyCollection(year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return StudentFee.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
    ]);
  }
}

module.exports = new StudentFeeRepository();
