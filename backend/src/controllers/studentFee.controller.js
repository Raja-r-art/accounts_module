'use strict';

const StudentFeeService = require('../services/studentFee.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class StudentFeeController {
  async assignFeeToStudent(req, res) {
    const studentFee = await StudentFeeService.assignFeeToStudent(req.body);
    return sendSuccess(res, 201, MESSAGES.CREATE_SUCCESS('Fee assignment'), studentFee);
  }

  async recordPayment(req, res) {
    const collectedBy = req.user.id;
    const result = await StudentFeeService.recordPayment(req.params.id, req.body, collectedBy);
    return sendSuccess(res, 200, MESSAGES.FEE_PAYMENT_SUCCESS, result);
  }

  async getStudentFeeById(req, res) {
    const fee = await StudentFeeService.getStudentFeeById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Student fee record'), fee);
  }

  async updateStudentFee(req, res) {
    const fee = await StudentFeeService.updateStudentFee(req.params.id, req.body);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('Student fee record'), fee);
  }

  async deleteStudentFee(req, res) {
    await StudentFeeService.deleteStudentFee(req.params.id);
    return sendSuccess(res, 200, MESSAGES.DELETE_SUCCESS('Student fee record'));
  }

  async getStudentFeesByStudent(req, res) {
    const fees = await StudentFeeService.getStudentFeesByStudent(req.params.studentId);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Student fee records'), fees);
  }

  async findAllStudentFees(req, res) {
    const { studentFees, meta } = await StudentFeeService.findAllStudentFees(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Student fee records'), studentFees, meta);
  }
}

module.exports = new StudentFeeController();
