'use strict';

const fs = require('fs');
const path = require('path');
const ExpenseRepository = require('../repositories/expense.repository');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class ExpenseService {
  async createExpense(data, file, userId) {
    if (file) {
      data.attachment = `src/uploads/${file.filename}`;
    }
    
    data.paidBy = userId;
    data.approvedBy = userId; // Auto-approved in this simple ERP

    if (!data.academicYear) {
      const year = new Date(data.date || Date.now()).getFullYear();
      data.academicYear = `${year}-${year + 1}`;
    }

    return ExpenseRepository.create(data);
  }

  async getExpenseById(id) {
    const expense = await ExpenseRepository.findById(id, ['paidBy', 'approvedBy']);
    if (!expense) {
      throw new AppError(MESSAGES.NOT_FOUND('Expense'), 404);
    }
    return expense;
  }

  async updateExpense(id, data, file) {
    const expense = await ExpenseRepository.findById(id);
    if (!expense) {
      throw new AppError(MESSAGES.NOT_FOUND('Expense'), 404);
    }

    if (file) {
      // Remove old attachment if exists
      if (expense.attachment) {
        const oldPath = path.join(__dirname, '..', '..', expense.attachment);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      data.attachment = `src/uploads/${file.filename}`;
    }

    return ExpenseRepository.updateById(id, data);
  }

  async deleteExpense(id) {
    const expense = await ExpenseRepository.findById(id);
    if (!expense) {
      throw new AppError(MESSAGES.NOT_FOUND('Expense'), 404);
    }

    // Remove attachment if exists
    if (expense.attachment) {
      const oldPath = path.join(__dirname, '..', '..', expense.attachment);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return ExpenseRepository.deleteById(id);
  }

  async findAllExpenses(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = ExpenseRepository.buildFilter(query);

    const expenses = await ExpenseRepository.findAll({
      filter,
      sort,
      skip,
      limit,
    });

    const total = await ExpenseRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { expenses, meta };
  }
}

module.exports = new ExpenseService();
