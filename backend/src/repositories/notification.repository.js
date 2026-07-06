'use strict';

const BaseRepository = require('./base.repository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor() { super(Notification); }

  findByUser(userId) {
    return Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(50);
  }

  markAllRead(userId) {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  countUnread(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }
}

module.exports = new NotificationRepository();
