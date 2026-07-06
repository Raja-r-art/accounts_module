'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const ReceiptRepository = require('../repositories/receipt.repository');
const StudentRepository = require('../repositories/student.repository');
const Receipt = require('../models/Receipt');
const { generateQRCodeDataURL } = require('../utils/qrcode.util');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class ReceiptService {
  async generateReceipt(studentFee, issuedById, remarks = '') {
    // Fetch student details
    const student = await StudentRepository.findById(studentFee.student);
    if (!student) {
      throw new AppError(MESSAGES.NOT_FOUND('Student'), 404);
    }

    // Auto-generate receipt number
    const receiptNumber = `REC${Date.now()}`;

    // Populate feeDetails and studentDetails for receipt history
    const feeDetails = {
      feeType: studentFee.feeStructure?.feeType || 'Fee Payment',
      course: studentFee.feeStructure?.course || student.course,
      semester: studentFee.feeStructure?.semester || student.semester,
      academicYear: studentFee.feeStructure?.academicYear || studentFee.academicYear,
      totalAmount: studentFee.totalAmount,
      discount: studentFee.discount,
      scholarship: studentFee.scholarship,
      fine: studentFee.fine,
    };

    const studentDetails = {
      name: student.name,
      admissionNumber: student.admissionNumber,
      department: student.department,
      email: student.email,
      phone: student.phone,
    };

    // Generate QR Code
    const qrData = {
      receiptNumber,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      paidAmount: studentFee.paidAmount,
      date: new Date().toISOString(),
    };
    const qrCodeBase64 = await generateQRCodeDataURL(qrData);

    // Create receipt record
    const receipt = await ReceiptRepository.create({
      receiptNumber,
      student: student._id,
      studentFee: studentFee._id,
      paidAmount: studentFee.paidAmount,
      paymentDate: studentFee.paymentDate || new Date(),
      paymentMethod: studentFee.paymentMethod,
      transactionId: studentFee.transactionId,
      qrCode: qrCodeBase64,
      issuedBy: issuedById,
      remarks,
      feeDetails,
      studentDetails,
    });

    // Generate PDF Receipt
    const pdfPath = await this.buildReceiptPDF(receipt, studentFee.pendingAmount);
    
    // Update receipt with PDF path
    receipt.pdfPath = pdfPath;
    await receipt.save();

    return receipt;
  }

  async buildReceiptPDF(receipt, balanceAmount) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `receipt-${receipt.receiptNumber}.pdf`;
        
        // Ensure uploads directory exists
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const relativePdfPath = `src/uploads/${filename}`;
        const absolutePdfPath = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(absolutePdfPath);

        doc.pipe(writeStream);

        // Header Section
        doc.fillColor('#1A2E4A')
           .fontSize(20)
           .text('SRI ESHWAR COLLEGE OF ENGINEERING', { align: 'center', bold: true })
           .fontSize(9)
           .fillColor('#4A5568')
           .text('Kondampatti Post, Kinathukadavu, Coimbatore - 641 202, Tamil Nadu', { align: 'center' })
           .text('Email: info@sece.ac.in | Tel: 0422-2667588 | www.sece.ac.in', { align: 'center' })
           .moveDown();

        doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, 110).lineTo(545, 110).stroke();

        // Title
        doc.moveDown()
           .fillColor('#2B6CB0')
           .fontSize(16)
           .text('FEE PAYMENT RECEIPT', { align: 'center', bold: true })
           .moveDown();

        // Info Block (Two columns)
        const leftColX = 50;
        const rightColX = 350;
        let currentY = doc.y;

        doc.fillColor('#2D3748').fontSize(10);
        
        // Student Info (Left Column)
        doc.text(`Student Name: ${receipt.studentDetails.name}`, leftColX, currentY);
        doc.text(`Admission No: ${receipt.studentDetails.admissionNumber}`, leftColX, currentY + 15);
        doc.text(`Department: ${receipt.studentDetails.department}`, leftColX, currentY + 30);
        doc.text(`Course & Sem: ${receipt.feeDetails.course} - Sem ${receipt.feeDetails.semester}`, leftColX, currentY + 45);

        // Receipt Info (Right Column)
        doc.text(`Receipt Number: ${receipt.receiptNumber}`, rightColX, currentY);
        doc.text(`Payment Date: ${new Date(receipt.paymentDate).toLocaleDateString('en-IN')}`, rightColX, currentY + 15);
        doc.text(`Payment Method: ${receipt.paymentMethod?.toUpperCase()}`, rightColX, currentY + 30);
        if (receipt.transactionId) {
          doc.text(`Transaction ID: ${receipt.transactionId}`, rightColX, currentY + 45);
        }

        doc.moveDown(4);
        currentY = doc.y + 20;

        // Table Header
        doc.fillColor('#FFFFFF');
        doc.rect(50, currentY, 495, 20).fill('#2B6CB0');
        doc.fillColor('#FFFFFF').fontSize(10);
        doc.text('Fee Description', 60, currentY + 5);
        doc.text('Amount (INR)', 450, currentY + 5, { width: 80, align: 'right' });

        // Table Row
        doc.fillColor('#2D3748');
        currentY += 20;
        doc.rect(50, currentY, 495, 20).fill('#F7FAFC');
        doc.fillColor('#2D3748');
        const feeNameFormatted = receipt.feeDetails.feeType.replace('_', ' ').toUpperCase();
        doc.text(feeNameFormatted, 60, currentY + 5);
        doc.text(`₹${receipt.feeDetails.totalAmount.toFixed(2)}`, 450, currentY + 5, { width: 80, align: 'right' });

        // Breakdowns
        currentY += 20;
        let lineIdx = 0;
        
        const addBreakdownRow = (label, amt) => {
          if (amt > 0) {
            doc.rect(50, currentY, 495, 20).fill(lineIdx % 2 === 0 ? '#FFFFFF' : '#F7FAFC');
            doc.fillColor('#4A5568');
            doc.text(label, 70, currentY + 5);
            doc.text(`₹${amt.toFixed(2)}`, 450, currentY + 5, { width: 80, align: 'right' });
            currentY += 20;
            lineIdx++;
          }
        };

        addBreakdownRow('Discount Applied', receipt.feeDetails.discount);
        addBreakdownRow('Scholarship Waiver', receipt.feeDetails.scholarship);
        addBreakdownRow('Fine / Late Fee', receipt.feeDetails.fine);

        // Totals Box
        currentY += 10;
        doc.strokeColor('#CBD5E0').rect(280, currentY, 265, 80).stroke();
        
        doc.fillColor('#2D3748');
        doc.text('Total Paid Amount:', 290, currentY + 10);
        doc.fontSize(12).fillColor('#2B6CB0').text(`₹${receipt.paidAmount.toFixed(2)}`, 430, currentY + 8, { width: 100, align: 'right' });
        
        doc.fontSize(10).fillColor('#2D3748');
        doc.text('Pending Balance:', 290, currentY + 35);
        doc.fontSize(12).fillColor('#E53E3E').text(`₹${balanceAmount.toFixed(2)}`, 430, currentY + 33, { width: 100, align: 'right' });

        // Add QR Code
        if (receipt.qrCode) {
          const base64Data = receipt.qrCode.replace(/^data:image\/png;base64,/, '');
          const qrBuffer = Buffer.from(base64Data, 'base64');
          doc.image(qrBuffer, 50, currentY, { width: 90, height: 90 });
        }

        // Signatures
        currentY += 120;
        doc.fontSize(10).fillColor('#4A5568');
        doc.text('----------------------------------', 50, currentY, { width: 200, align: 'center' });
        doc.text('Student Signature', 50, currentY + 12, { width: 200, align: 'center' });

        doc.text('----------------------------------', 345, currentY, { width: 200, align: 'center' });
        doc.text('Authorized Signatory / Accountant', 345, currentY + 12, { width: 200, align: 'center' });

        // Footer note
        doc.fontSize(8)
           .fillColor('#718096')
           .text('This is a computer-generated receipt and does not require a physical signature.', 50, currentY + 50, { align: 'center' });

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

  async getReceiptById(id) {
    const receipt = await ReceiptRepository.findById(id, ['student', 'studentFee', 'issuedBy']);
    if (!receipt) {
      throw new AppError(MESSAGES.NOT_FOUND('Receipt'), 404);
    }
    return receipt;
  }

  async downloadReceiptPDF(id) {
    const receipt = await this.getReceiptById(id);
    if (!receipt.pdfPath) {
      throw new AppError('PDF not generated for this receipt', 400);
    }
    const absolutePath = path.join(__dirname, '..', '..', receipt.pdfPath);
    if (!fs.existsSync(absolutePath)) {
      // Rebuild PDF if deleted locally
      const studentFee = await mongoose.model('StudentFee').findById(receipt.studentFee);
      const balanceAmount = studentFee ? studentFee.pendingAmount : 0;
      await this.buildReceiptPDF(receipt, balanceAmount);
    }
    return absolutePath;
  }

  async findAllReceipts(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = ReceiptRepository.buildFilter(query);

    // Direct Mongoose query to guarantee student name populates
    const receipts = await Receipt.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'student', select: 'name admissionNumber email course department' })
      .populate({ path: 'issuedBy', select: 'name email' })
      .lean();

    const total = await ReceiptRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { receipts, meta };
  }
}

module.exports = new ReceiptService();
