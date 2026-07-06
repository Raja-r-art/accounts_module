'use strict';

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const studentRoutes = require('./student.routes');
const feeStructureRoutes = require('./feeStructure.routes');
const studentFeeRoutes = require('./studentFee.routes');
const receiptRoutes = require('./receipt.routes');
const expenseRoutes = require('./expense.routes');
const incomeRoutes = require('./income.routes');
const scholarshipRoutes = require('./scholarship.routes');
const salaryRoutes = require('./salary.routes');
const reportRoutes = require('./report.routes');
const dashboardRoutes = require('./dashboard.routes');
const auditLogRoutes = require('./auditLog.routes');
const notificationRoutes = require('./notification.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/fee-structures', feeStructureRoutes);
router.use('/student-fees', studentFeeRoutes);
router.use('/receipts', receiptRoutes);
router.use('/expenses', expenseRoutes);
router.use('/incomes', incomeRoutes);
router.use('/scholarships', scholarshipRoutes);
router.use('/salaries', salaryRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
