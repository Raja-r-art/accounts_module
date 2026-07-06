'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const SalaryRepository = require('../repositories/salary.repository');
const UserRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class SalaryService {
  async createSalary(data, userId) {
    // Check if duplicate record exists
    const existing = await SalaryRepository.findByEmployeeAndMonth(data.employee, data.month, data.year);
    if (existing) {
      throw new AppError('Salary record for this employee and month already exists.', 400);
    }

    data.processedBy = userId;
    const salary = await SalaryRepository.create(data);

    // Save triggers pre-save to calculate netSalary, then build PDF
    await salary.save();

    const slipPath = await this.buildSalarySlipPDF(salary);
    salary.slipPath = slipPath;
    await salary.save();

    return salary;
  }

  async getSalaryById(id) {
    const salary = await SalaryRepository.findById(id, ['employee', 'processedBy']);
    if (!salary) {
      throw new AppError(MESSAGES.NOT_FOUND('Salary record'), 404);
    }
    return salary;
  }

  async updateSalary(id, data) {
    const salary = await SalaryRepository.findById(id);
    if (!salary) {
      throw new AppError(MESSAGES.NOT_FOUND('Salary record'), 404);
    }

    // Update fields
    if (data.basicSalary !== undefined) salary.basicSalary = data.basicSalary;
    if (data.allowances) salary.allowances = { ...salary.allowances.toObject(), ...data.allowances };
    if (data.deductions) salary.deductions = { ...salary.deductions.toObject(), ...data.deductions };
    if (data.status !== undefined) salary.status = data.status;
    if (data.paymentDate !== undefined) salary.paymentDate = data.paymentDate;
    if (data.transactionId !== undefined) salary.transactionId = data.transactionId;
    if (data.remarks !== undefined) salary.remarks = data.remarks;

    await salary.save(); // triggers recalculation of netSalary

    // Rebuild PDF
    const slipPath = await this.buildSalarySlipPDF(salary);
    salary.slipPath = slipPath;
    await salary.save();

    return salary;
  }

  async deleteSalary(id) {
    const salary = await SalaryRepository.findById(id);
    if (!salary) {
      throw new AppError(MESSAGES.NOT_FOUND('Salary record'), 404);
    }

    // Delete PDF file
    if (salary.slipPath) {
      const oldPath = path.join(__dirname, '..', '..', salary.slipPath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return SalaryRepository.deleteById(id);
  }

  async downloadSalarySlipPDF(id) {
    const salary = await this.getSalaryById(id);
    if (!salary.slipPath) {
      throw new AppError('Salary slip has not been generated for this record.', 400);
    }
    const absolutePath = path.join(__dirname, '..', '..', salary.slipPath);
    if (!fs.existsSync(absolutePath)) {
      // Rebuild PDF if deleted locally
      await this.buildSalarySlipPDF(salary);
    }
    return absolutePath;
  }

  async buildSalarySlipPDF(salary) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `salary-slip-${salary._id}.pdf`;
        
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const relativePdfPath = `src/uploads/${filename}`;
        const absolutePdfPath = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(absolutePdfPath);

        doc.pipe(writeStream);

        // Header Section
        doc.fillColor('#1A365D')
           .fontSize(22)
           .text('COLLEGE OF EXCELLENCE', { align: 'center', bold: true })
           .fontSize(10)
           .fillColor('#4A5568')
           .text('123 Education Boulevard, Knowledge City, PIN-560001', { align: 'center' })
           .text('SALARY SLIP FOR THE MONTH OF ' + this.getMonthName(salary.month) + ' ' + salary.year, { align: 'center', bold: true })
           .moveDown();

        doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, 100).lineTo(545, 100).stroke();

        // Employee details block
        doc.moveDown()
           .fillColor('#2D3748')
           .fontSize(12)
           .text('Employee Details', 50, doc.y, { bold: true })
           .fontSize(10);
        
        let startY = doc.y + 10;
        doc.text(`Employee Name: ${salary.employeeName}`, 50, startY);
        doc.text(`Department: ${salary.department}`, 50, startY + 15);
        doc.text(`Designation: ${salary.designation}`, 50, startY + 30);
        
        doc.text(`Payment Date: ${new Date(salary.paymentDate).toLocaleDateString('en-IN')}`, 350, startY);
        doc.text(`Salary Month: ${this.getMonthName(salary.month)} ${salary.year}`, 350, startY + 15);
        doc.text(`Status: ${salary.status.toUpperCase()}`, 350, startY + 30);
        
        doc.moveDown(4);
        startY = doc.y + 20;

        // Draw Earnings vs Deductions Table
        doc.strokeColor('#CBD5E0').rect(50, startY, 495, 200).stroke();
        doc.strokeColor('#CBD5E0').moveTo(297, startY).lineTo(297, startY + 200).stroke(); // vertical middle line
        
        // Headers
        doc.fillColor('#2B6CB0').rect(50, startY, 247, 20).fill();
        doc.fillColor('#FFFFFF').text('Earnings', 60, startY + 5, { bold: true });
        doc.text('Amount (INR)', 220, startY + 5);

        doc.fillColor('#2B6CB0').rect(297, startY, 248, 20).fill();
        doc.fillColor('#FFFFFF').text('Deductions', 307, startY + 5, { bold: true });
        doc.text('Amount (INR)', 470, startY + 5);

        // Populate table content
        doc.fillColor('#2D3748').fontSize(9);
        let earnY = startY + 25;
        let dedY = startY + 25;

        // Earnings column
        doc.text(`Basic Salary:`, 60, earnY);
        doc.text(`₹${salary.basicSalary.toFixed(2)}`, 200, earnY, { align: 'right', width: 80 });
        earnY += 15;

        const alls = salary.allowances.toObject();
        Object.keys(alls).forEach((key) => {
          if (alls[key] > 0) {
            doc.text(`${key.toUpperCase()}:`, 60, earnY);
            doc.text(`₹${alls[key].toFixed(2)}`, 200, earnY, { align: 'right', width: 80 });
            earnY += 15;
          }
        });

        // Deductions column
        const deds = salary.deductions.toObject();
        Object.keys(deds).forEach((key) => {
          if (deds[key] > 0) {
            doc.text(`${key.toUpperCase()}:`, 307, dedY);
            doc.text(`₹${deds[key].toFixed(2)}`, 450, dedY, { align: 'right', width: 80 });
            dedY += 15;
          }
        });

        // Calculations bottom summaries
        const totalEarnings = salary.basicSalary + Object.values(alls).reduce((a, b) => a + b, 0);
        const totalDeductions = Object.values(deds).reduce((a, b) => a + b, 0);

        doc.strokeColor('#CBD5E0').moveTo(50, startY + 160).lineTo(545, startY + 160).stroke();
        
        doc.fontSize(10).fillColor('#2D3748');
        doc.text('Total Earnings:', 60, startY + 165, { bold: true });
        doc.text(`₹${totalEarnings.toFixed(2)}`, 200, startY + 165, { align: 'right', width: 80, bold: true });

        doc.text('Total Deductions:', 307, startY + 165, { bold: true });
        doc.text(`₹${totalDeductions.toFixed(2)}`, 450, startY + 165, { align: 'right', width: 80, bold: true });

        doc.strokeColor('#CBD5E0').moveTo(50, startY + 180).lineTo(545, startY + 180).stroke();
        
        // Net salary bottom panel
        doc.rect(50, startY + 180, 495, 20).fill('#EDF2F7');
        doc.fontSize(10).fillColor('#1A365D');
        doc.text('NET SALARY PAYABLE:', 60, startY + 185, { bold: true });
        doc.text(`₹${salary.netSalary.toFixed(2)}`, 430, startY + 185, { align: 'right', width: 100, bold: true });

        // Signatures
        const sigY = startY + 230;
        doc.fontSize(10).fillColor('#4A5568');
        doc.text('----------------------------------', 50, sigY, { width: 200, align: 'center' });
        doc.text("Employee Signature", 50, sigY + 12, { width: 200, align: 'center' });

        doc.text('----------------------------------', 345, sigY, { width: 200, align: 'center' });
        doc.text('Accountant / Authorized Officer', 345, sigY + 12, { width: 200, align: 'center' });

        // Footer note
        doc.fontSize(8)
           .fillColor('#718096')
           .text('This is a computer-generated slip and does not require a physical signature.', 50, sigY + 50, { align: 'center' });

        doc.end();

        writeStream.on('finish', () => {
          resolve(relativePdfPath);
        });

        writeStream.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  getMonthName(monthNum) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1] || '';
  }

  async findAllSalaries(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = SalaryRepository.buildFilter(query);

    const salaries = await SalaryRepository.findAll({
      filter,
      sort,
      skip,
      limit,
    });

    const total = await SalaryRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { salaries, meta };
  }
}

module.exports = new SalaryService();
