'use strict';

const ExpenseService = require('../services/expense.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class ExpenseController {
  async createExpense(req, res) {
    const expense = await ExpenseService.createExpense(req.body, req.file, req.user.id);
    return sendSuccess(res, 201, MESSAGES.CREATE_SUCCESS('Expense'), expense);
  }

  async getExpenseById(req, res) {
    const expense = await ExpenseService.getExpenseById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Expense'), expense);
  }

  async updateExpense(req, res) {
    const expense = await ExpenseService.updateExpense(req.params.id, req.body, req.file);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('Expense'), expense);
  }

  async deleteExpense(req, res) {
    await ExpenseService.deleteExpense(req.params.id);
    return sendSuccess(res, 200, MESSAGES.DELETE_SUCCESS('Expense'));
  }

  async findAllExpenses(req, res) {
    const { expenses, meta } = await ExpenseService.findAllExpenses(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Expenses'), expenses, meta);
  }
}

module.exports = new ExpenseController();
