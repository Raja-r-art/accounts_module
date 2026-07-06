'use strict';

const BaseRepository = require('./base.repository');
const Salary = require('../models/Salary');

class SalaryRepository extends BaseRepository {
  constructor() { super(Salary); }

  findByEmployeeAndMonth(employeeId, month, year) {
    return Salary.findOne({ employee: employeeId, month, year });
  }

  buildFilter(query) {
    const filter = {};
    if (query.employee) filter.employee = query.employee;
    if (query.department) filter.department = { $regex: query.department, $options: 'i' };
    if (query.month) filter.month = parseInt(query.month, 10);
    if (query.year) filter.year = parseInt(query.year, 10);
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { employeeName: { $regex: query.search, $options: 'i' } },
        { department: { $regex: query.search, $options: 'i' } },
        { designation: { $regex: query.search, $options: 'i' } },
      ];
    }
    return filter;
  }
}

module.exports = new SalaryRepository();
