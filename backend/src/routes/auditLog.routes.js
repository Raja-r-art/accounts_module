'use strict';

const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/auditLog.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/', AuditLogController.findAllLogs);

module.exports = router;
