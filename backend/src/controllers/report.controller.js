'use strict';

const ReportService = require('../services/report.service');
const { sendSuccess } = require('../utils/response.util');

class ReportController {
  // Helper to handle downloads based on formats
  async handleExport(res, title, headers, rows, format) {
    if (format === 'csv') {
      const csv = ReportService.exportToCSV(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${title.toLowerCase().replace(/ /g, '_')}.csv`);
      return res.status(200).send(csv);
    } else if (format === 'excel') {
      const buffer = await ReportService.exportToExcel(title, headers, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${title.toLowerCase().replace(/ /g, '_')}.xlsx`);
      return res.status(200).send(buffer);
    } else if (format === 'pdf') {
      const buffer = await ReportService.exportToPDF(title, headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${title.toLowerCase().replace(/ /g, '_')}.pdf`);
      return res.status(200).send(buffer);
    }
  }

  async getCollectionReport(req, res) {
    const fromDate = req.query.fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = req.query.toDate || new Date().toISOString().split('T')[0];
    const format = req.query.format;

    const data = await ReportService.getCollectionReport({ fromDate, toDate });

    if (format && ['csv', 'excel', 'pdf'].includes(format.toLowerCase())) {
      const headers = ['Date', 'Amount Collected (INR)', 'Payments Count'];
      const rows = data.map((d) => [d._id, d.totalCollected, d.count]);
      return this.handleExport(res, `Collection Report ${fromDate} to ${toDate}`, headers, rows, format.toLowerCase());
    }

    return sendSuccess(res, 200, 'Collection report fetched successfully.', data);
  }

  async getDepartmentCollection(req, res) {
    const format = req.query.format;
    const data = await ReportService.getDepartmentCollection();

    if (format && ['csv', 'excel', 'pdf'].includes(format.toLowerCase())) {
      const headers = ['Department', 'Amount Collected (INR)', 'Transactions Count'];
      const rows = data.map((d) => [d._id || 'General/Unassigned', d.totalCollected, d.count]);
      return this.handleExport(res, 'Department-wise Fee Collection', headers, rows, format.toLowerCase());
    }

    return sendSuccess(res, 200, 'Department-wise collection fetched successfully.', data);
  }

  async getCourseCollection(req, res) {
    const format = req.query.format;
    const data = await ReportService.getCourseCollection();

    if (format && ['csv', 'excel', 'pdf'].includes(format.toLowerCase())) {
      const headers = ['Course', 'Amount Collected (INR)', 'Transactions Count'];
      const rows = data.map((d) => [d._id, d.totalCollected, d.count]);
      return this.handleExport(res, 'Course-wise Fee Collection', headers, rows, format.toLowerCase());
    }

    return sendSuccess(res, 200, 'Course-wise collection fetched successfully.', data);
  }

  async getOutstandingFees(req, res) {
    const format = req.query.format;
    const data = await ReportService.getOutstandingFees();

    if (format && ['csv', 'excel', 'pdf'].includes(format.toLowerCase())) {
      const headers = ['Course', 'Semester', 'Assigned Amount (INR)', 'Outstanding Balance (INR)', 'Pending Students Count'];
      const rows = data.map((d) => [d._id.course, d._id.semester, d.totalAssigned, d.totalPending, d.studentCount]);
      return this.handleExport(res, 'Outstanding Fees Balances', headers, rows, format.toLowerCase());
    }

    return sendSuccess(res, 200, 'Outstanding fees fetched successfully.', data);
  }

  async getExpenseReport(req, res) {
    const fromDate = req.query.fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = req.query.toDate || new Date().toISOString().split('T')[0];
    const format = req.query.format;

    const data = await ReportService.getExpenseReport({ fromDate, toDate });

    if (format && ['csv', 'excel', 'pdf'].includes(format.toLowerCase())) {
      const headers = ['Category', 'Total Expended (INR)', 'Transactions Count'];
      const rows = data.map((d) => [d._id.replace('_', ' ').toUpperCase(), d.totalAmount, d.count]);
      return this.handleExport(res, `Operating Expense Report ${fromDate} to ${toDate}`, headers, rows, format.toLowerCase());
    }

    return sendSuccess(res, 200, 'Expense report fetched successfully.', data);
  }

  async getIncomeReport(req, res) {
    const fromDate = req.query.fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = req.query.toDate || new Date().toISOString().split('T')[0];
    const format = req.query.format;

    const data = await ReportService.getIncomeReport({ fromDate, toDate });

    if (format && ['csv', 'excel', 'pdf'].includes(format.toLowerCase())) {
      const headers = ['Source', 'Total Earned (INR)', 'Transactions Count'];
      const rows = data.map((d) => [d._id.replace('_', ' ').toUpperCase(), d.totalAmount, d.count]);
      return this.handleExport(res, `Other Income Report ${fromDate} to ${toDate}`, headers, rows, format.toLowerCase());
    }

    return sendSuccess(res, 200, 'Income report fetched successfully.', data);
  }

  async getProfitLossReport(req, res) {
    const fromDate = req.query.fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = req.query.toDate || new Date().toISOString().split('T')[0];
    const format = req.query.format;

    const data = await ReportService.getProfitLossReport({ fromDate, toDate });

    if (format && ['csv', 'excel', 'pdf'].includes(format.toLowerCase())) {
      const headers = ['Category', 'Sub-Category', 'Amount (INR)'];
      const rows = [
        ['REVENUE', 'Student Fee Collections', data.revenue.feeIncome],
        ['REVENUE', 'Other College Incomes', data.revenue.otherIncome],
        ['REVENUE', 'TOTAL COLLEGE REVENUE', data.revenue.totalIncome],
        ['EXPENSE', 'Operating Expenses', data.expense.operatingExpense],
        ['EXPENSE', 'Staff Salary Disbursements', data.expense.salaryExpense],
        ['EXPENSE', 'TOTAL COLLEGE EXPENSES', data.expense.totalExpense],
        ['PROFIT / LOSS', 'NET FINANCIAL SURPLUS', data.netProfit],
      ];
      return this.handleExport(res, `Profit & Loss Statement ${fromDate} to ${toDate}`, headers, rows, format.toLowerCase());
    }

    return sendSuccess(res, 200, 'Profit and Loss statement fetched successfully.', data);
  }

  async getStudentWiseReport(req, res) {
    const student = await ReportService.getStudentWiseReport(req.params.studentId);
    return sendSuccess(res, 200, 'Student-wise transactions history fetched successfully.', student);
  }
}

module.exports = new ReportController();
