'use strict';

const express = require('express');
const router = express.Router();
const FeeStructureController = require('../controllers/feeStructure.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const { createFeeStructureValidator, updateFeeStructureValidator } = require('../validators/feeStructure.validator');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.route('/')
  .get(FeeStructureController.findAllFeeStructures)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), createFeeStructureValidator, auditLog('create', 'fee_structure'), FeeStructureController.createFeeStructure);

router.route('/:id')
  .get(mongoIdValidator, FeeStructureController.getFeeStructureById)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), updateFeeStructureValidator, auditLog('update', 'fee_structure'), FeeStructureController.updateFeeStructure)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL), mongoIdValidator, auditLog('delete', 'fee_structure'), FeeStructureController.deleteFeeStructure);

module.exports = router;
