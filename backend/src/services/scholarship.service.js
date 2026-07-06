'use strict';

const ScholarshipRepository = require('../repositories/scholarship.repository');
const StudentRepository = require('../repositories/student.repository');
const StudentFee = require('../models/StudentFee');
const NotificationService = require('./notification.service');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { SCHOLARSHIP_STATUS } = require('../constants/status');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class ScholarshipService {
  async createScholarship(data) {
    const student = await StudentRepository.findById(data.student);
    if (!student) {
      throw new AppError(MESSAGES.NOT_FOUND('Student'), 404);
    }

    if (!data.academicYear) {
      data.academicYear = student.academicYear;
    }

    data.status = SCHOLARSHIP_STATUS.PENDING;
    return ScholarshipRepository.create(data);
  }

  async getScholarshipById(id) {
    const scholarship = await ScholarshipRepository.findById(id, ['student', 'approvedBy']);
    if (!scholarship) {
      throw new AppError(MESSAGES.NOT_FOUND('Scholarship record'), 404);
    }
    return scholarship;
  }

  async updateScholarship(id, data) {
    const scholarship = await ScholarshipRepository.findById(id);
    if (!scholarship) {
      throw new AppError(MESSAGES.NOT_FOUND('Scholarship record'), 404);
    }

    if (scholarship.status !== SCHOLARSHIP_STATUS.PENDING) {
      throw new AppError('Cannot update a scholarship that has already been approved or rejected.', 400);
    }

    return ScholarshipRepository.updateById(id, data);
  }

  async approveScholarship(id, status, reason, approvedById) {
    const scholarship = await ScholarshipRepository.findById(id).populate('student');
    if (!scholarship) {
      throw new AppError(MESSAGES.NOT_FOUND('Scholarship record'), 404);
    }

    if (scholarship.status !== SCHOLARSHIP_STATUS.PENDING) {
      throw new AppError('Scholarship is already processed.', 400);
    }

    scholarship.status = status;
    scholarship.reason = reason;
    scholarship.approvedBy = approvedById;
    scholarship.approvalDate = new Date();

    await scholarship.save();

    // If approved, apply waiver to the student's pending fee record
    if (status === SCHOLARSHIP_STATUS.APPROVED) {
      const studentFee = await StudentFee.findOne({
        student: scholarship.student._id,
        academicYear: scholarship.academicYear,
        status: { $in: ['pending', 'partial'] },
      });

      if (studentFee) {
        studentFee.scholarship += scholarship.amount;
        await studentFee.save(); // Pre-save recalculates pendingAmount and status

        // Update student counters
        await StudentRepository.updateFeeStats(
          scholarship.student._id,
          0,
          -scholarship.amount
        );
      }

      // Send approved notification
      try {
        await NotificationService.sendScholarshipApprovedNotification(scholarship);
      } catch (_) {
        // ignore
      }
    }

    return scholarship;
  }

  async deleteScholarship(id) {
    const scholarship = await ScholarshipRepository.findById(id);
    if (!scholarship) {
      throw new AppError(MESSAGES.NOT_FOUND('Scholarship record'), 404);
    }

    if (scholarship.status === SCHOLARSHIP_STATUS.APPROVED) {
      throw new AppError('Cannot delete an approved scholarship.', 400);
    }

    return ScholarshipRepository.deleteById(id);
  }

  async findAllScholarships(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = ScholarshipRepository.buildFilter(query);

    const scholarships = await ScholarshipRepository.findAll({
      filter,
      sort,
      skip,
      limit,
      populate: ['student'],
    });

    const total = await ScholarshipRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { scholarships, meta };
  }
}

module.exports = new ScholarshipService();
