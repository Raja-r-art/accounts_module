'use strict';

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['fee_due', 'payment_success', 'scholarship_approved', 'general', 'reminder'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    relatedModel: { type: String },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    channels: {
      email: { sent: Boolean, sentAt: Date },
      sms: { sent: Boolean, sentAt: Date },
      inApp: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
