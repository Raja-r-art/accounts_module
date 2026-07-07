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
    // Use direct Mongoose query with populate (NOT the async repository method)
    const Scholarship = require('../models/Scholarship');
    const scholarship = await Scholarship.findById(id).populate('student');
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

    // If approved, deduct scholarship amount from student's fee record
    if (status === SCHOLARSHIP_STATUS.APPROVED) {
      const studentId = scholarship.student._id;

      // Find any fee record for this academic year
      let studentFee = await StudentFee.findOne({
        student: studentId,
        academicYear: scholarship.academicYear,
      }).sort({ createdAt: -1 });

      // Fallback: if no fee record found for exact academicYear, fall back to the student's most recent fee record
      if (!studentFee) {
        studentFee = await StudentFee.findOne({
          student: studentId,
        }).sort({ createdAt: -1 });
      }

      if (studentFee) {
        const oldPending = studentFee.pendingAmount;
        studentFee.scholarship += scholarship.amount;
        await studentFee.save(); // pre-save recalculates pendingAmount and status

        const pendingDelta = studentFee.pendingAmount - oldPending; // will be negative (reduction)

        // Update student counters: paid increases by reduction in pending, pending decreases
        await StudentRepository.updateFeeStats(
          studentId,
          -pendingDelta, // paidDelta (if pending went down, effectively "paid" goes up)
          pendingDelta   // pendingDelta (negative = reduction)
        );
      }

      // Send approved notification
      try {
        await NotificationService.sendScholarshipApprovedNotification(scholarship);
      } catch (_) {
        // ignore notification failures
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
