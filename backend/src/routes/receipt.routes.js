'use strict';

const express = require('express');
const router = express.Router();
const ReceiptController = require('../controllers/receipt.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), ReceiptController.findAllReceipts);

router.route('/:id')
  .get(mongoIdValidator, authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.STUDENT, ROLES.PARENT), ReceiptController.getReceiptById);

router.get('/:id/download', mongoIdValidator, authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.STUDENT, ROLES.PARENT), auditLog('export', 'receipt'), ReceiptController.downloadReceiptPDF);

module.exports = router;
