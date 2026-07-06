'use strict';

const IncomeRepository = require('../repositories/income.repository');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class IncomeService {
  async createIncome(data, userId) {
    data.receivedBy = userId;
    
    if (!data.academicYear) {
      const year = new Date(data.date || Date.now()).getFullYear();
      data.academicYear = `${year}-${year + 1}`;
    }

    return IncomeRepository.create(data);
  }

  async getIncomeById(id) {
    const income = await IncomeRepository.findById(id, ['receivedBy']);
    if (!income) {
      throw new AppError(MESSAGES.NOT_FOUND('Income record'), 404);
    }
    return income;
  }

  async updateIncome(id, data) {
    const income = await IncomeRepository.findById(id);
    if (!income) {
      throw new AppError(MESSAGES.NOT_FOUND('Income record'), 404);
    }
    return IncomeRepository.updateById(id, data);
  }

  async deleteIncome(id) {
    const income = await IncomeRepository.findById(id);
    if (!income) {
      throw new AppError(MESSAGES.NOT_FOUND('Income record'), 404);
    }
    return IncomeRepository.deleteById(id);
  }

  async findAllIncomes(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = IncomeRepository.buildFilter(query);

    const incomes = await IncomeRepository.findAll({
      filter,
      sort,
      skip,
      limit,
    });

    const total = await IncomeRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { incomes, meta };
  }
}

module.exports = new IncomeService();
