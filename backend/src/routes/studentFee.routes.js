'use strict';

const express = require('express');
const router = express.Router();
const StudentFeeController = require('../controllers/studentFee.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const {
  assignFeeValidator,
  recordPaymentValidator,
  updateStudentFeeValidator,
} = require('../validators/studentFee.validator');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

// Assign and retrieve list of fee records
router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), StudentFeeController.findAllStudentFees)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), assignFeeValidator, auditLog('create', 'student_fee'), StudentFeeController.assignFeeToStudent);

// Get student fees list for specific student
router.get('/student/:studentId', mongoIdValidator, authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.STUDENT, ROLES.PARENT), StudentFeeController.getStudentFeesByStudent);

// Actions on single student fee record
router.route('/:id')
  .get(mongoIdValidator, authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.STUDENT, ROLES.PARENT), StudentFeeController.getStudentFeeById)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), updateStudentFeeValidator, auditLog('update', 'student_fee'), StudentFeeController.updateStudentFee)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL), mongoIdValidator, auditLog('delete', 'student_fee'), StudentFeeController.deleteStudentFee);

// Pay against fee record
router.post('/:id/pay', recordPaymentValidator, auditLog('payment', 'student_fee'), StudentFeeController.recordPayment);

module.exports = router;
