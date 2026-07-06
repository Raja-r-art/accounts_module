'use strict';

const NotificationService = require('../services/notification.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class NotificationController {
  async findAllNotifications(req, res) {
    const { notifications, meta } = await NotificationService.findAllNotifications(req.query, req.user.id);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Notifications'), notifications, meta);
  }

  async markAsRead(req, res) {
    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('Notification'), notification);
  }

  async markAllAsRead(req, res) {
    await NotificationService.markAllAsRead(req.user.id);
    return sendSuccess(res, 200, 'All notifications marked as read.');
  }
}

module.exports = new NotificationController();
