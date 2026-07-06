'use strict';

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { mongoIdValidator } = require('../validators/user.validator');

router.use(authenticate);

router.get('/', NotificationController.findAllNotifications);
router.put('/read-all', NotificationController.markAllAsRead);
router.put('/:id/read', mongoIdValidator, NotificationController.markAsRead);

module.exports = router;
