'use strict';

const express = require('express');
const router = express.Router();
const ScholarshipController = require('../controllers/scholarship.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const {
  createScholarshipValidator,
  updateScholarshipValidator,
  approveScholarshipValidator,
} = require('../validators/scholarship.validator');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), ScholarshipController.findAllScholarships)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), createScholarshipValidator, auditLog('create', 'scholarship'), ScholarshipController.createScholarship);

router.route('/:id')
  .get(mongoIdValidator, authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), ScholarshipController.getScholarshipById)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), updateScholarshipValidator, auditLog('update', 'scholarship'), ScholarshipController.updateScholarship)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL), mongoIdValidator, auditLog('delete', 'scholarship'), ScholarshipController.deleteScholarship);

router.post('/:id/approve', approveScholarshipValidator, auditLog('update', 'scholarship'), ScholarshipController.approveScholarship);

module.exports = router;
