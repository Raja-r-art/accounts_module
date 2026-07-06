'use strict';

const mongoose = require('mongoose');
const { STUDENT_STATUS } = require('../constants/status');

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required: [admissionNumber, name, department, course, semester, academicYear, email]
 */
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    section: { type: String, trim: true },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    dob: { type: Date },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit mobile number'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    parentName: { type: String, trim: true },
    parentPhone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid parent mobile number'],
    },
    parentEmail: { type: String, lowercase: true, trim: true },
    status: {
      type: String,
      enum: Object.values(STUDENT_STATUS),
      default: STUDENT_STATUS.ACTIVE,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    photo: { type: String, default: null },
    documents: [{
      name: String,
      path: String,
      uploadedAt: { type: Date, default: Date.now },
    }],
    totalFeesPaid: { type: Number, default: 0 },
    totalFeesPending: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
studentSchema.index({ admissionNumber: 1 }, { unique: true });
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ course: 1, semester: 1, academicYear: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ name: 'text', admissionNumber: 'text', email: 'text' });

// ─── Virtuals ────────────────────────────────────────────────────────────────
studentSchema.virtual('age').get(function () {
  if (!this.dob) return null;
  const today = new Date();
  const dob = new Date(this.dob);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
});

studentSchema.virtual('feeRecords', {
  ref: 'StudentFee',
  localField: '_id',
  foreignField: 'student',
});

// ─── Hooks ───────────────────────────────────────────────────────────────────
studentSchema.pre('save', function (next) {
  if (this.isNew && !this.studentId) {
    this.studentId = `STU${Date.now()}`;
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
