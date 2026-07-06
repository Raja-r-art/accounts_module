'use strict';

const logger = require('./logger.util');

/**
 * Mock SMS Service
 * In production, replace with Twilio, MSG91, or similar
 */
const sendSMS = async ({ to, message }) => {
  // Mock implementation — log to console in dev
  logger.info(`[SMS MOCK] To: ${to} | Message: ${message}`);
  // Simulate async SMS sending
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { success: true, messageId: `MOCK_${Date.now()}`, to, message };
};

const sendFeeDueSMS = async ({ phone, studentName, amount, dueDate }) => {
  const message = `Dear ${studentName}, fee of Rs.${amount} is due on ${new Date(dueDate).toLocaleDateString('en-IN')}. Please pay on time. -College ERP`;
  return sendSMS({ to: phone, message });
};

const sendPaymentSuccessSMS = async ({ phone, studentName, amount, receiptNumber }) => {
  const message = `Dear ${studentName}, payment of Rs.${amount} received. Receipt: ${receiptNumber}. -College ERP`;
  return sendSMS({ to: phone, message });
};

const sendScholarshipApprovedSMS = async ({ phone, studentName, amount }) => {
  const message = `Dear ${studentName}, scholarship of Rs.${amount} approved. -College ERP`;
  return sendSMS({ to: phone, message });
};

module.exports = { sendSMS, sendFeeDueSMS, sendPaymentSuccessSMS, sendScholarshipApprovedSMS };
