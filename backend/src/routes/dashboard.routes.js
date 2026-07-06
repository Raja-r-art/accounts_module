'use strict';

const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT));

router.get('/stats', DashboardController.getStats);
router.get('/charts', DashboardController.getChartsData);

module.exports = router;
