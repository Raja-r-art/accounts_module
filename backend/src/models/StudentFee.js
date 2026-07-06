'use strict';

const mongoose = require('mongoose');
const { FEE_STATUS, PAYMENT_METHODS } = require('../constants/status');

const studentFeeSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
      required: [true, 'Fee structure is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: { type: Number, default: 0, min: 0 },
    scholarship: { type: Number, default: 0, min: 0 },
    fine: { type: Number, default: 0, min: 0 },
    paymentDate: { type: Date },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
    },
    transactionId: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(FEE_STATUS),
      default: FEE_STATUS.PENDING,
    },
    remarks: { type: String, trim: true },
    receipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Receipt',
      default: null,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    academicYear: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentFeeSchema.index({ student: 1, status: 1 });
studentFeeSchema.index({ student: 1, feeStructure: 1 });
studentFeeSchema.index({ status: 1 });
studentFeeSchema.index({ paymentDate: -1 });
studentFeeSchema.index({ dueDate: 1 });
studentFeeSchema.index({ receiptNumber: 1 });
studentFeeSchema.index({ academicYear: 1 });

// Auto-calculate pending amount before save
studentFeeSchema.pre('save', function (next) {
  const effectiveTotal = this.totalAmount - this.discount - this.scholarship + this.fine;
  this.pendingAmount = Math.max(0, effectiveTotal - this.paidAmount);
  if (this.paidAmount <= 0) this.status = FEE_STATUS.PENDING;
  else if (this.pendingAmount <= 0) this.status = FEE_STATUS.PAID;
  else this.status = FEE_STATUS.PARTIAL;
  next();
});

const StudentFee = mongoose.model('StudentFee', studentFeeSchema);
module.exports = StudentFee;
