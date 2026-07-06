'use strict';

const Notification = require('../models/Notification');
const { sendFeeDueEmail, sendPaymentSuccessEmail, sendScholarshipApprovedEmail } = require('../utils/email.util');
const { sendFeeDueSMS, sendPaymentSuccessSMS, sendScholarshipApprovedSMS } = require('../utils/sms.util');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');
const logger = require('../utils/logger.util');

class NotificationService {
  async sendFeeDueNotification(studentFee) {
    const student = studentFee.student;
    if (!student) return;

    const title = 'Fee Payment Due Alert';
    const message = `Dear ${student.name}, fee of ₹${studentFee.pendingAmount} is due on ${new Date(studentFee.dueDate).toLocaleDateString('en-IN')}. Please pay on time.`;

    const channels = { email: { sent: false }, sms: { sent: false }, inApp: true };

    // Send Email
    if (student.email) {
      try {
        await sendFeeDueEmail({
          to: student.email,
          studentName: student.name,
          amount: studentFee.pendingAmount,
          dueDate: studentFee.dueDate,
        });
        channels.email.sent = true;
        channels.email.sentAt = new Date();
      } catch (err) {
        logger.error(`Notification email failed: ${err.message}`);
      }
    }

    // Send SMS
    if (student.phone) {
      try {
        await sendFeeDueSMS({
          phone: student.phone,
          studentName: student.name,
          amount: studentFee.pendingAmount,
          dueDate: studentFee.dueDate,
        });
        channels.sms.sent = true;
        channels.sms.sentAt = new Date();
      } catch (err) {
        logger.error(`Notification SMS failed: ${err.message}`);
      }
    }

    // Record notification in DB (for in-app alerts)
    if (student.user) {
      await Notification.create({
        recipient: student.user,
        title,
        message,
        type: 'fee_due',
        relatedModel: 'StudentFee',
        relatedId: studentFee._id,
        channels,
      });
    }
  }

  async sendPaymentSuccessNotification(studentFee, receiptNumber) {
    const student = studentFee.student;
    if (!student) return;

    const title = 'Fee Payment Successful';
    const message = `Dear ${student.name}, payment of ₹${studentFee.paidAmount} received successfully. Receipt: ${receiptNumber}.`;

    const channels = { email: { sent: false }, sms: { sent: false }, inApp: true };

    // Send Email
    if (student.email) {
      try {
        await sendPaymentSuccessEmail({
          to: student.email,
          studentName: student.name,
          amount: studentFee.paidAmount,
          receiptNumber,
        });
        channels.email.sent = true;
        channels.email.sentAt = new Date();
      } catch (err) {
        logger.error(`Payment success email failed: ${err.message}`);
      }
    }

    // Send SMS
    if (student.phone) {
      try {
        await sendPaymentSuccessSMS({
          phone: student.phone,
          studentName: student.name,
          amount: studentFee.paidAmount,
          receiptNumber,
        });
        channels.sms.sent = true;
        channels.sms.sentAt = new Date();
      } catch (err) {
        logger.error(`Payment success SMS failed: ${err.message}`);
      }
    }

    if (student.user) {
      await Notification.create({
        recipient: student.user,
        title,
        message,
        type: 'payment_success',
        relatedModel: 'StudentFee',
        relatedId: studentFee._id,
        channels,
      });
    }
  }

  async sendScholarshipApprovedNotification(scholarship) {
    const student = scholarship.student;
    if (!student) return;

    const title = 'Scholarship Approved Alert';
    const message = `Congratulations! Your scholarship application for "${scholarship.scholarshipName}" of ₹${scholarship.amount} has been approved.`;

    const channels = { email: { sent: false }, sms: { sent: false }, inApp: true };

    // Send Email
    if (student.email) {
      try {
        await sendScholarshipApprovedEmail({
          to: student.email,
          studentName: student.name,
          scholarshipName: scholarship.scholarshipName,
          amount: scholarship.amount,
        });
        channels.email.sent = true;
        channels.email.sentAt = new Date();
      } catch (err) {
        logger.error(`Scholarship email failed: ${err.message}`);
      }
    }

    // Send SMS
    if (student.phone) {
      try {
        await sendScholarshipApprovedSMS({
          phone: student.phone,
          studentName: student.name,
          amount: scholarship.amount,
        });
        channels.sms.sent = true;
        channels.sms.sentAt = new Date();
      } catch (err) {
        logger.error(`Scholarship SMS failed: ${err.message}`);
      }
    }

    if (student.user) {
      await Notification.create({
        recipient: student.user,
        title,
        message,
        type: 'scholarship_approved',
        relatedModel: 'Scholarship',
        relatedId: scholarship._id,
        channels,
      });
    }
  }

  async findAllNotifications(query, userId) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = { recipient: userId };
    
    if (query.isRead !== undefined) {
      filter.isRead = query.isRead === 'true';
    }

    const notifications = await Notification.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { notifications, meta };
  }

  async markAsRead(id, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  }

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }
}

module.exports = new NotificationService();
