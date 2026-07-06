'use strict';

const { getTransporter } = require('../config/mailer');
const logger = require('./logger.util');

/**
 * Send an email
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'College ERP <noreply@collegeerp.com>',
      to,
      subject,
      text: text || '',
      html: html || '',
      attachments,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Send fee due reminder email
 */
const sendFeeDueEmail = async ({ to, studentName, amount, dueDate }) => {
  const subject = 'Fee Due Reminder - College ERP';
  const html = `
    <h2>Fee Due Reminder</h2>
    <p>Dear ${studentName},</p>
    <p>This is a reminder that your fee payment of <strong>₹${amount}</strong> is due on <strong>${new Date(dueDate).toLocaleDateString('en-IN')}</strong>.</p>
    <p>Please make the payment before the due date to avoid late fees.</p>
    <p>Regards,<br/>College Accounts Department</p>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * Send payment success email
 */
const sendPaymentSuccessEmail = async ({ to, studentName, amount, receiptNumber }) => {
  const subject = 'Payment Successful - College ERP';
  const html = `
    <h2>Payment Confirmation</h2>
    <p>Dear ${studentName},</p>
    <p>Your payment of <strong>₹${amount}</strong> has been received successfully.</p>
    <p>Receipt Number: <strong>${receiptNumber}</strong></p>
    <p>Please keep this for your records.</p>
    <p>Regards,<br/>College Accounts Department</p>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * Send scholarship approved email
 */
const sendScholarshipApprovedEmail = async ({ to, studentName, scholarshipName, amount }) => {
  const subject = 'Scholarship Approved - College ERP';
  const html = `
    <h2>Scholarship Approval Notice</h2>
    <p>Dear ${studentName},</p>
    <p>Congratulations! Your scholarship <strong>${scholarshipName}</strong> of <strong>₹${amount}</strong> has been approved.</p>
    <p>The amount will be credited to your fee account.</p>
    <p>Regards,<br/>College Accounts Department</p>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ to, resetToken }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request - College ERP';
  const html = `
    <h2>Password Reset</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>This link expires in 15 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return sendEmail({ to, subject, html });
};

module.exports = {
  sendEmail,
  sendFeeDueEmail,
  sendPaymentSuccessEmail,
  sendScholarshipApprovedEmail,
  sendPasswordResetEmail,
};
