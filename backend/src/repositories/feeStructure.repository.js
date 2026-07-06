'use strict';

const BaseRepository = require('./base.repository');
const FeeStructure = require('../models/FeeStructure');

class FeeStructureRepository extends BaseRepository {
  constructor() { super(FeeStructure); }

  findByCourseAndSemester(course, semester, academicYear) {
    return FeeStructure.find({ course, semester, academicYear, isActive: true });
  }

  buildFilter(query) {
    const filter = {};
    if (query.course) filter.course = { $regex: query.course, $options: 'i' };
    if (query.semester) filter.semester = parseInt(query.semester, 10);
    if (query.feeType) filter.feeType = query.feeType;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    return filter;
  }
}

module.exports = new FeeStructureRepository();
