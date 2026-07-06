'use strict';

const BaseRepository = require('./base.repository');
const Scholarship = require('../models/Scholarship');

class ScholarshipRepository extends BaseRepository {
  constructor() { super(Scholarship); }

  findByStudent(studentId) {
    return Scholarship.find({ student: studentId }).populate('approvedBy', 'name email');
  }

  buildFilter(query) {
    const filter = {};
    if (query.student) filter.student = query.student;
    if (query.status) filter.status = query.status;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.search) filter.scholarshipName = { $regex: query.search, $options: 'i' };
    return filter;
  }
}

module.exports = new ScholarshipRepository();
