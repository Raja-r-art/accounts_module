'use strict';

const StudentFeeRepository = require('../repositories/studentFee.repository');
const StudentRepository = require('../repositories/student.repository');
const FeeStructureRepository = require('../repositories/feeStructure.repository');
const ReceiptService = require('./receipt.service');
const NotificationService = require('./notification.service');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { FEE_STATUS } = require('../constants/status');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');
const StudentFee = require('../models/StudentFee');

class StudentFeeService {
  async assignFeeToStudent(data) {
    const student = await StudentRepository.findById(data.student);
    if (!student) {
      throw new AppError(MESSAGES.NOT_FOUND('Student'), 404);
    }

    const feeStructure = await FeeStructureRepository.findById(data.feeStructure);
    if (!feeStructure) {
      throw new AppError(MESSAGES.NOT_FOUND('Fee structure'), 404);
    }

    // Check if fee already assigned
    const existing = await StudentFeeRepository.findOne({
      student: data.student,
      feeStructure: data.feeStructure,
    });
    if (existing) {
      throw new AppError(MESSAGES.ALREADY_EXISTS('This fee is already assigned to the student'), 400);
    }

    const discount = data.discount || 0;
    const scholarship = data.scholarship || 0;
    const fine = data.fine || 0;
    const totalAmount = feeStructure.amount;
    const dueDate = data.dueDate || feeStructure.dueDate;
    const academicYear = feeStructure.academicYear;

    const studentFee = await StudentFeeRepository.create({
      student: student._id,
      feeStructure: feeStructure._id,
      totalAmount,
      discount,
      scholarship,
      fine,
      dueDate,
      academicYear,
      status: FEE_STATUS.PENDING,
    });

    // Auto-calculate pending amount before save runs in pre('save')
    // We save studentFee to run pre('save') hooks which set pendingAmount
    await studentFee.save();

    // Increment student total fees pending stats
    await StudentRepository.updateFeeStats(student._id, 0, studentFee.pendingAmount);

    return studentFee;
  }

  async recordPayment(id, paymentData, collectedById) {
    const studentFee = await StudentFeeRepository.findById(id, ['feeStructure', 'student']);
    if (!studentFee) {
      throw new AppError(MESSAGES.NOT_FOUND('Student fee record'), 404);
    }

    if (studentFee.status === FEE_STATUS.PAID) {
      throw new AppError('Fee is already fully paid.', 400);
    }

    if (studentFee.status === FEE_STATUS.CANCELLED) {
      throw new AppError('Cannot record payment on a cancelled fee.', 400);
    }

    const paidAmountDelta = paymentData.paidAmount;
    if (paidAmountDelta > studentFee.pendingAmount) {
      throw new AppError(`Payment amount ₹${paidAmountDelta} exceeds the pending balance of ₹${studentFee.pendingAmount}.`, 400);
    }

    // Add to paid amount
    studentFee.paidAmount += paidAmountDelta;
    studentFee.paymentMethod = paymentData.paymentMethod;
    studentFee.transactionId = paymentData.transactionId;
    studentFee.paymentDate = new Date();
    studentFee.collectedBy = collectedById;
    studentFee.remarks = paymentData.remarks;

    // Save triggers pre('save') to recalculate pendingAmount and status
    await studentFee.save();

    // Generate receipt
    const receipt = await ReceiptService.generateReceipt(studentFee, collectedById, paymentData.remarks);
    
    // Link receipt to student fee
    studentFee.receipt = receipt._id;
    studentFee.receiptNumber = receipt.receiptNumber;
    await studentFee.save();

    // Update student metrics
    await StudentRepository.updateFeeStats(studentFee.student._id, paidAmountDelta, -paidAmountDelta);

    // Trigger Notification
    try {
      await NotificationService.sendPaymentSuccessNotification(studentFee, receipt.receiptNumber);
    } catch (_) {
      // Don't fail the transaction if notification fails
    }

    return { studentFee, receipt };
  }

  async getStudentFeeById(id) {
    const fee = await StudentFeeRepository.findById(id, ['student', 'feeStructure', 'receipt', 'collectedBy']);
    if (!fee) {
      throw new AppError(MESSAGES.NOT_FOUND('Fee record'), 404);
    }
    return fee;
  }

  async updateStudentFee(id, updateData) {
    const studentFee = await StudentFeeRepository.findById(id);
    if (!studentFee) {
      throw new AppError(MESSAGES.NOT_FOUND('Fee record'), 404);
    }

    const oldPending = studentFee.pendingAmount;
    const oldPaid = studentFee.paidAmount;

    // Update values
    if (updateData.discount !== undefined) studentFee.discount = updateData.discount;
    if (updateData.scholarship !== undefined) studentFee.scholarship = updateData.scholarship;
    if (updateData.fine !== undefined) studentFee.fine = updateData.fine;
    if (updateData.status !== undefined) studentFee.status = updateData.status;
    if (updateData.dueDate !== undefined) studentFee.dueDate = updateData.dueDate;

    await studentFee.save(); // pre-save recalculates pendingAmount and status

    // Recalculate Student stats
    const paidDelta = studentFee.paidAmount - oldPaid;
    const pendingDelta = studentFee.pendingAmount - oldPending;

    if (paidDelta !== 0 || pendingDelta !== 0) {
      await StudentRepository.updateFeeStats(studentFee.student, paidDelta, pendingDelta);
    }

    return studentFee;
  }

  async deleteStudentFee(id) {
    const studentFee = await StudentFeeRepository.findById(id);
    if (!studentFee) {
      throw new AppError(MESSAGES.NOT_FOUND('Fee record'), 404);
    }

    // Decrement Student stats
    await StudentRepository.updateFeeStats(
      studentFee.student,
      -studentFee.paidAmount,
      -studentFee.pendingAmount
    );

    return StudentFeeRepository.deleteById(id);
  }

  async getStudentFeesByStudent(studentId) {
    return StudentFeeRepository.findByStudent(studentId);
  }

  async findAllStudentFees(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = StudentFeeRepository.buildFilter(query);

    // Use direct Mongoose query to guarantee populate works with field selection
    const studentFees = await StudentFee.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'student', select: 'name admissionNumber email phone course department semester' })
      .populate({ path: 'feeStructure', select: 'feeType amount course semester academicYear' })
      .populate({ path: 'collectedBy', select: 'name email' })
      .lean();

    const total = await StudentFeeRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { studentFees, meta };
  }
}

module.exports = new StudentFeeService();
