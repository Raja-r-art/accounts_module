'use strict';

const StudentService = require('../services/student.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');
const AppError = require('../utils/AppError');

class StudentController {
  async createStudent(req, res) {
    const student = await StudentService.createStudent(req.body);
    return sendSuccess(res, 201, MESSAGES.CREATE_SUCCESS('Student'), student);
  }

  async getStudentById(req, res) {
    const student = await StudentService.getStudentById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Student'), student);
  }

  async updateStudent(req, res) {
    const student = await StudentService.updateStudent(req.params.id, req.body);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('Student'), student);
  }

  async deleteStudent(req, res) {
    await StudentService.deleteStudent(req.params.id);
    return sendSuccess(res, 200, MESSAGES.DELETE_SUCCESS('Student'));
  }

  async findAllStudents(req, res) {
    const { students, meta } = await StudentService.findAllStudents(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Students'), students, meta);
  }

  async uploadDocument(req, res) {
    if (!req.file) {
      throw new AppError('No file uploaded.', 400);
    }
    const student = await StudentService.uploadStudentDocument(
      req.params.id,
      req.file,
      req.body.name
    );
    return sendSuccess(res, 200, 'Document uploaded successfully.', student);
  }
}

module.exports = new StudentController();
