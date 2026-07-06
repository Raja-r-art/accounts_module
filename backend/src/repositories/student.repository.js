'use strict';

const BaseRepository = require('./base.repository');
const Student = require('../models/Student');

class StudentRepository extends BaseRepository {
  constructor() { super(Student); }

  findByAdmissionNumber(admissionNumber) {
    return Student.findOne({ admissionNumber: admissionNumber.toUpperCase() });
  }

  findByEmail(email) {
    return Student.findOne({ email: email.toLowerCase() });
  }

  async findWithFees(studentId) {
    return Student.findById(studentId).populate('feeRecords');
  }

  async updateFeeStats(studentId, paidDelta, pendingDelta) {
    return Student.findByIdAndUpdate(
      studentId,
      {
        $inc: {
          totalFeesPaid: paidDelta,
          totalFeesPending: pendingDelta,
        },
      },
      { new: true }
    );
  }

  buildFilter(query) {
    const filter = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { admissionNumber: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.department) filter.department = { $regex: query.department, $options: 'i' };
    if (query.course) filter.course = { $regex: query.course, $options: 'i' };
    if (query.semester) filter.semester = parseInt(query.semester, 10);
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.status) filter.status = query.status;
    if (query.gender) filter.gender = query.gender;
    return filter;
  }
}

module.exports = new StudentRepository();
