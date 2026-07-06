'use strict';

const SalaryService = require('../services/salary.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class SalaryController {
  async createSalary(req, res) {
    const salary = await SalaryService.createSalary(req.body, req.user.id);
    return sendSuccess(res, 201, MESSAGES.CREATE_SUCCESS('Salary record'), salary);
  }

  async getSalaryById(req, res) {
    const salary = await SalaryService.getSalaryById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Salary record'), salary);
  }

  async updateSalary(req, res) {
    const salary = await SalaryService.updateSalary(req.params.id, req.body);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('Salary record'), salary);
  }

  async deleteSalary(req, res) {
    await SalaryService.deleteSalary(req.params.id);
    return sendSuccess(res, 200, MESSAGES.DELETE_SUCCESS('Salary record'));
  }

  async downloadSalarySlipPDF(req, res) {
    const slipPath = await SalaryService.downloadSalarySlipPDF(req.params.id);
    return res.download(slipPath);
  }

  async findAllSalaries(req, res) {
    const { salaries, meta } = await SalaryService.findAllSalaries(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Salary records'), salaries, meta);
  }
}

module.exports = new SalaryController();
