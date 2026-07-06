'use strict';

const ScholarshipService = require('../services/scholarship.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class ScholarshipController {
  async createScholarship(req, res) {
    const scholarship = await ScholarshipService.createScholarship(req.body);
    return sendSuccess(res, 201, MESSAGES.CREATE_SUCCESS('Scholarship record'), scholarship);
  }

  async getScholarshipById(req, res) {
    const scholarship = await ScholarshipService.getScholarshipById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Scholarship record'), scholarship);
  }

  async updateScholarship(req, res) {
    const scholarship = await ScholarshipService.updateScholarship(req.params.id, req.body);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('Scholarship record'), scholarship);
  }

  async approveScholarship(req, res) {
    const { status, reason } = req.body;
    const approvedBy = req.user.id;
    const scholarship = await ScholarshipService.approveScholarship(req.params.id, status, reason, approvedBy);
    return sendSuccess(res, 200, 'Scholarship application status updated successfully.', scholarship);
  }

  async deleteScholarship(req, res) {
    await ScholarshipService.deleteScholarship(req.params.id);
    return sendSuccess(res, 200, MESSAGES.DELETE_SUCCESS('Scholarship record'));
  }

  async findAllScholarships(req, res) {
    const { scholarships, meta } = await ScholarshipService.findAllScholarships(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Scholarship records'), scholarships, meta);
  }
}

module.exports = new ScholarshipController();
