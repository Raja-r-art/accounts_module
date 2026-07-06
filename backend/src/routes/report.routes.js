'use strict';

const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

// Financial reports are restricted to Super Admin, Principal, and Accountant
router.get('/collection', authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), auditLog('export', 'report'), ReportController.getCollectionReport);
router.get('/department-collection', authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), auditLog('export', 'report'), ReportController.getDepartmentCollection);
router.get('/course-collection', authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), auditLog('export', 'report'), ReportController.getCourseCollection);
router.get('/outstanding', authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), auditLog('export', 'report'), ReportController.getOutstandingFees);
router.get('/expense', authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), auditLog('export', 'report'), ReportController.getExpenseReport);
router.get('/income', authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), auditLog('export', 'report'), ReportController.getIncomeReport);
router.get('/profit-loss', authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), auditLog('export', 'report'), ReportController.getProfitLossReport);

// Student wise report can be retrieved by their respective users as well
router.get('/student/:studentId', mongoIdValidator, authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.STUDENT, ROLES.PARENT), ReportController.getStudentWiseReport);

module.exports = router;
