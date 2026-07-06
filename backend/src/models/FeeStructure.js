'use strict';

const mongoose = require('mongoose');
const { FEE_TYPES } = require('../constants/status');

const feeStructureSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 12,
    },
    feeType: {
      type: String,
      required: [true, 'Fee type is required'],
      enum: {
        values: FEE_TYPES,
        message: 'Invalid fee type',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'],
    },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: {
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

// Compound index — a fee structure is unique per course+semester+feeType+academicYear
feeStructureSchema.index({ course: 1, semester: 1, feeType: 1, academicYear: 1 }, { unique: true });
feeStructureSchema.index({ academicYear: 1 });
feeStructureSchema.index({ isActive: 1 });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
module.exports = FeeStructure;
