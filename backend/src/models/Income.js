'use strict';

const mongoose = require('mongoose');
const { INCOME_SOURCES } = require('../constants/status');

const incomeSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: { values: INCOME_SOURCES, message: 'Invalid source' },
    },
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
    reference: { type: String, trim: true },
    receivedBy: {
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

incomeSchema.index({ source: 1 });
incomeSchema.index({ date: -1 });
incomeSchema.index({ academicYear: 1 });

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;
