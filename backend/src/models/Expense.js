'use strict';

const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('../constants/status');

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: EXPENSE_CATEGORIES, message: 'Invalid category' },
    },
    vendor: { type: String, trim: true },
    invoiceNumber: { type: String, trim: true, unique: true, sparse: true },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: { type: String, trim: true },
    attachment: { type: String }, // file path
    paymentMethod: { type: String },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    academicYear: { type: String },
    remarks: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ academicYear: 1 });
expenseSchema.index({ date: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
