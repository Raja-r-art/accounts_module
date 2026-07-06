'use strict';

const FeeStructureRepository = require('../repositories/feeStructure.repository');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class FeeStructureService {
  async createFeeStructure(data) {
    const existing = await FeeStructureRepository.findOne({
      course: data.course,
      semester: data.semester,
      feeType: data.feeType,
      academicYear: data.academicYear,
    });

    if (existing) {
      throw new AppError(MESSAGES.ALREADY_EXISTS('Fee structure for this course, semester, fee type, and academic year'), 409);
    }

    return FeeStructureRepository.create(data);
  }

  async getFeeStructureById(id) {
    const fs = await FeeStructureRepository.findById(id);
    if (!fs) {
      throw new AppError(MESSAGES.NOT_FOUND('Fee structure'), 404);
    }
    return fs;
  }

  async updateFeeStructure(id, data) {
    const fs = await FeeStructureRepository.findById(id);
    if (!fs) {
      throw new AppError(MESSAGES.NOT_FOUND('Fee structure'), 404);
    }

    // Check unique constraints if compound fields are changing
    const course = data.course || fs.course;
    const semester = data.semester || fs.semester;
    const feeType = data.feeType || fs.feeType;
    const academicYear = data.academicYear || fs.academicYear;

    if (
      course !== fs.course ||
      semester !== fs.semester ||
      feeType !== fs.feeType ||
      academicYear !== fs.academicYear
    ) {
      const existing = await FeeStructureRepository.findOne({
        course,
        semester,
        feeType,
        academicYear,
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError(MESSAGES.ALREADY_EXISTS('Fee structure for this course, semester, fee type, and academic year'), 409);
      }
    }

    return FeeStructureRepository.updateById(id, data);
  }

  async deleteFeeStructure(id) {
    const fs = await FeeStructureRepository.findById(id);
    if (!fs) {
      throw new AppError(MESSAGES.NOT_FOUND('Fee structure'), 404);
    }
    return FeeStructureRepository.deleteById(id);
  }

  async findAllFeeStructures(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = FeeStructureRepository.buildFilter(query);

    const feeStructures = await FeeStructureRepository.findAll({
      filter,
      sort,
      skip,
      limit,
    });

    const total = await FeeStructureRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { feeStructures, meta };
  }
}

module.exports = new FeeStructureService();
