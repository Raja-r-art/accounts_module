'use strict';

const express = require('express');
const router = express.Router();
const SalaryController = require('../controllers/salary.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const { createSalaryValidator, updateSalaryValidator } = require('../validators/salary.validator');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT));

router.route('/')
  .get(SalaryController.findAllSalaries)
  .post(createSalaryValidator, auditLog('create', 'salary'), SalaryController.createSalary);

router.route('/:id')
  .get(mongoIdValidator, SalaryController.getSalaryById)
  .put(updateSalaryValidator, auditLog('update', 'salary'), SalaryController.updateSalary)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL), mongoIdValidator, auditLog('delete', 'salary'), SalaryController.deleteSalary);

router.get('/:id/slip', mongoIdValidator, auditLog('export', 'salary'), SalaryController.downloadSalarySlipPDF);

module.exports = router;
