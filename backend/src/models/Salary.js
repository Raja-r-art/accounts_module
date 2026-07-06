'use strict';

const mongoose = require('mongoose');
const { SALARY_STATUS } = require('../constants/status');

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: 0,
    },
    allowances: {
      hra: { type: Number, default: 0 },
      da: { type: Number, default: 0 },
      ta: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    netSalary: { type: Number, default: 0 },
    paymentDate: { type: Date, required: true },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SALARY_STATUS),
      default: SALARY_STATUS.PENDING,
    },
    transactionId: { type: String },
    remarks: { type: String },
    slipPath: { type: String }, // generated PDF path
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate net salary before save
salarySchema.pre('save', function (next) {
  const totalAllowances = Object.values(this.allowances).reduce((a, b) => a + b, 0);
  const totalDeductions = Object.values(this.deductions).reduce((a, b) => a + b, 0);
  this.netSalary = this.basicSalary + totalAllowances - totalDeductions;
  next();
});

salarySchema.virtual('totalAllowances').get(function () {
  return Object.values(this.allowances).reduce((a, b) => a + b, 0);
});

salarySchema.virtual('totalDeductions').get(function () {
  return Object.values(this.deductions).reduce((a, b) => a + b, 0);
});

salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
salarySchema.index({ status: 1 });
salarySchema.index({ paymentDate: -1 });

const Salary = mongoose.model('Salary', salarySchema);
module.exports = Salary;
