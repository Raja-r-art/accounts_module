'use strict';

const mongoose = require('mongoose');
const { SCHOLARSHIP_STATUS } = require('../constants/status');

const scholarshipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    scholarshipName: {
      type: String,
      required: [true, 'Scholarship name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(SCHOLARSHIP_STATUS),
      default: SCHOLARSHIP_STATUS.PENDING,
    },
    reason: { type: String, trim: true },
    applicationDate: { type: Date, default: Date.now },
    approvalDate: { type: Date },
    academicYear: { type: String },
    remarks: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

scholarshipSchema.index({ student: 1 });
scholarshipSchema.index({ status: 1 });
scholarshipSchema.index({ academicYear: 1 });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
module.exports = Scholarship;
