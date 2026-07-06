'use strict';

const FEE_STATUS = Object.freeze({
  PAID: 'paid',
  PENDING: 'pending',
  PARTIAL: 'partial',
  CANCELLED: 'cancelled',
});

const PAYMENT_METHODS = Object.freeze({
  CASH: 'cash',
  ONLINE: 'online',
  CHEQUE: 'cheque',
  DD: 'dd',
  NEFT: 'neft',
  UPI: 'upi',
});

const EXPENSE_CATEGORIES = Object.freeze([
  'salary', 'electricity', 'internet', 'maintenance',
  'furniture', 'stationery', 'lab', 'transport', 'other',
]);

const INCOME_SOURCES = Object.freeze([
  'admission_fee', 'hostel_fee', 'transport_fee',
  'government_fund', 'donation', 'other',
]);

const FEE_TYPES = Object.freeze([
  'tuition_fee', 'lab_fee', 'transport_fee', 'hostel_fee',
  'exam_fee', 'library_fee', 'miscellaneous',
]);

const SCHOLARSHIP_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const SALARY_STATUS = Object.freeze({
  PAID: 'paid',
  PENDING: 'pending',
  PROCESSING: 'processing',
});

const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
});

const STUDENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  DROPPED: 'dropped',
});

module.exports = {
  FEE_STATUS,
  PAYMENT_METHODS,
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  FEE_TYPES,
  SCHOLARSHIP_STATUS,
  SALARY_STATUS,
  USER_STATUS,
  STUDENT_STATUS,
};
