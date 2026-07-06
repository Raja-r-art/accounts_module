'use strict';

const IncomeService = require('../services/income.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class IncomeController {
  async createIncome(req, res) {
    const income = await IncomeService.createIncome(req.body, req.user.id);
    return sendSuccess(res, 201, MESSAGES.CREATE_SUCCESS('Income record'), income);
  }

  async getIncomeById(req, res) {
    const income = await IncomeService.getIncomeById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Income record'), income);
  }

  async updateIncome(req, res) {
    const income = await IncomeService.updateIncome(req.params.id, req.body);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('Income record'), income);
  }

  async deleteIncome(req, res) {
    await IncomeService.deleteIncome(req.params.id);
    return sendSuccess(res, 200, MESSAGES.DELETE_SUCCESS('Income record'));
  }

  async findAllIncomes(req, res) {
    const { incomes, meta } = await IncomeService.findAllIncomes(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Income records'), incomes, meta);
  }
}

module.exports = new IncomeController();
