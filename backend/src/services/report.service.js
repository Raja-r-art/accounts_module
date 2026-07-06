'use strict';

const StudentFee = require('../models/StudentFee');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Student = require('../models/Student');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { stringify } = require('csv-stringify/sync');

class ReportService {
  // ─── Collection Aggregations ───────────────────────────────────────────────

  async getCollectionReport({ fromDate, toDate }) {
    const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
    const end = new Date(toDate); end.setHours(23, 59, 59, 999);

    const match = {
      paymentDate: { $gte: start, $lte: end },
      status: { $in: ['paid', 'partial'] },
    };

    const dailyCollection = await StudentFee.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          totalCollected: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return dailyCollection;
  }

  async getDepartmentCollection() {
    const report = await StudentFee.aggregate([
      { $match: { status: { $in: ['paid', 'partial'] } } },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.department',
          totalCollected: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalCollected: -1 } },
    ]);
    return report;
  }

  async getCourseCollection() {
    const report = await StudentFee.aggregate([
      { $match: { status: { $in: ['paid', 'partial'] } } },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.course',
          totalCollected: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalCollected: -1 } },
    ]);
    return report;
  }

  async getOutstandingFees() {
    const report = await StudentFee.aggregate([
      { $match: { status: { $in: ['pending', 'partial'] } } },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: { course: '$studentInfo.course', semester: '$studentInfo.semester' },
          totalPending: { $sum: '$pendingAmount' },
          totalAssigned: { $sum: '$totalAmount' },
          studentCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.course': 1, '_id.semester': 1 } },
    ]);
    return report;
  }

  async getExpenseReport({ fromDate, toDate }) {
    const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
    const end = new Date(toDate); end.setHours(23, 59, 59, 999);

    return Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  }

  async getIncomeReport({ fromDate, toDate }) {
    const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
    const end = new Date(toDate); end.setHours(23, 59, 59, 999);

    return Income.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$source',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  }

  async getProfitLossReport({ fromDate, toDate }) {
    const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
    const end = new Date(toDate); end.setHours(23, 59, 59, 999);

    // 1. Total Fees Collected
    const feeCol = await StudentFee.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]);

    // 2. Total Incomes (Other)
    const incCol = await Income.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // 3. Total Expenses (Other)
    const expCol = await Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // 4. Total Salary Paid
    const salCol = await Income.db.model('Salary').aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end }, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]);

    const feeIncome = feeCol[0]?.total || 0;
    const otherIncome = incCol[0]?.total || 0;
    const totalIncome = feeIncome + otherIncome;

    const operatingExpense = expCol[0]?.total || 0;
    const salaryExpense = salCol[0]?.total || 0;
    const totalExpense = operatingExpense + salaryExpense;

    const netProfit = totalIncome - totalExpense;

    return {
      revenue: { feeIncome, otherIncome, totalIncome },
      expense: { operatingExpense, salaryExpense, totalExpense },
      netProfit,
      fromDate,
      toDate,
    };
  }

  async getStudentWiseReport(studentId) {
    const student = await Student.findById(studentId).populate({
      path: 'feeRecords',
      populate: { path: 'feeStructure' },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return student;
  }

  // ─── Export Format Exporters ────────────────────────────────────────────────

  exportToCSV(headers, rows) {
    const data = [headers, ...rows];
    return stringify(data);
  }

  async exportToExcel(title, headers, rows) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Title Row
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title.toUpperCase();
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.alignment = { horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1A365D' } };

    worksheet.addRow([]); // empty row

    // Headers Row
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2B6CB0' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Data Rows
    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    // Auto-fit Columns
    worksheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const valLen = cell.value ? cell.value.toString().length : 0;
        if (valLen > maxLen) maxLen = valLen;
      });
      column.width = Math.max(15, maxLen + 3);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  exportToPDF(title, headers, rows) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 40 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Title
      doc.fillColor('#1A365D').fontSize(20).text(title.toUpperCase(), { align: 'center', bold: true }).moveDown();
      doc.fontSize(10).fillColor('#718096').text(`Report Generated On: ${new Date().toLocaleString('en-IN')}`, { align: 'center' }).moveDown(2);

      // Table Draw
      let currentY = doc.y;
      doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, currentY).lineTo(555, currentY).stroke();
      currentY += 10;

      // Draw Header row
      doc.fillColor('#2B6CB0').rect(40, currentY, 515, 20).fill();
      doc.fillColor('#FFFFFF').fontSize(10);
      
      const colWidth = 515 / headers.length;
      headers.forEach((h, i) => {
        doc.text(h, 45 + i * colWidth, currentY + 5, { width: colWidth - 10, align: 'left', bold: true });
      });

      currentY += 20;

      // Draw Rows
      doc.fillColor('#2D3748');
      rows.forEach((row, rIdx) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        doc.fillColor(rIdx % 2 === 0 ? '#FFFFFF' : '#F7FAFC').rect(40, currentY, 515, 20).fill();
        doc.fillColor('#2D3748');

        row.forEach((cell, cIdx) => {
          const val = cell !== null && cell !== undefined ? cell.toString() : '';
          doc.text(val, 45 + cIdx * colWidth, currentY + 5, { width: colWidth - 10, align: 'left' });
        });

        currentY += 20;
      });

      doc.end();
    });
  }
}

module.exports = new ReportService();
