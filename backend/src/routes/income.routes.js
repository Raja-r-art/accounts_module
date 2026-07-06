'use strict';

const express = require('express');
const router = express.Router();
const IncomeController = require('../controllers/income.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const { createIncomeValidator, updateIncomeValidator } = require('../validators/income.validator');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT));

router.route('/')
  .get(IncomeController.findAllIncomes)
  .post(createIncomeValidator, auditLog('create', 'income'), IncomeController.createIncome);

router.route('/:id')
  .get(mongoIdValidator, IncomeController.getIncomeById)
  .put(updateIncomeValidator, auditLog('update', 'income'), IncomeController.updateIncome)
  .delete(mongoIdValidator, auditLog('delete', 'income'), IncomeController.deleteIncome);

module.exports = router;
