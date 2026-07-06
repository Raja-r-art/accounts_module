'use strict';

const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const { uploadDocument } = require('../config/multer');
const { createExpenseValidator, updateExpenseValidator } = require('../validators/expense.validator');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT));

router.route('/')
  .get(ExpenseController.findAllExpenses)
  .post(uploadDocument.single('attachment'), createExpenseValidator, auditLog('create', 'expense'), ExpenseController.createExpense);

router.route('/:id')
  .get(mongoIdValidator, ExpenseController.getExpenseById)
  .put(uploadDocument.single('attachment'), updateExpenseValidator, auditLog('update', 'expense'), ExpenseController.updateExpense)
  .delete(mongoIdValidator, auditLog('delete', 'expense'), ExpenseController.deleteExpense);

module.exports = router;
