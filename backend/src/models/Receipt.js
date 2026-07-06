'use strict';

const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentFee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentFee',
      required: true,
    },
    paidAmount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String },
    transactionId: { type: String },
    qrCode: { type: String }, // base64 QR
    pdfPath: { type: String }, // path to generated PDF
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: { type: String },
    feeDetails: {
      feeType: String,
      course: String,
      semester: Number,
      academicYear: String,
      totalAmount: Number,
      discount: Number,
      scholarship: Number,
      fine: Number,
    },
    studentDetails: {
      name: String,
      admissionNumber: String,
      department: String,
      email: String,
      phone: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

receiptSchema.index({ receiptNumber: 1 }, { unique: true });
receiptSchema.index({ student: 1 });
receiptSchema.index({ paymentDate: -1 });

const Receipt = mongoose.model('Receipt', receiptSchema);
module.exports = Receipt;
