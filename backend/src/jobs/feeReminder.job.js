'use strict';

const cron = require('node-cron');
const StudentFeeRepository = require('../repositories/studentFee.repository');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger.util');

const startFeeReminderJob = () => {
  // Run daily at midnight: '0 0 * * *'
  // For development testing, can be run more frequently if configured
  const schedule = process.env.FEE_REMINDER_CRON || '0 0 * * *';

  cron.schedule(schedule, async () => {
    logger.info('Starting scheduled fee reminder job...');

    try {
      // Find fees due in the next 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const dueFees = await StudentFeeRepository.findPendingByDueDate(threeDaysFromNow);
      logger.info(`Found ${dueFees.length} pending/partial fee records due by ${threeDaysFromNow.toLocaleDateString()}`);

      for (const fee of dueFees) {
        try {
          await NotificationService.sendFeeDueNotification(fee);
        } catch (feeError) {
          logger.error(`Failed to send fee due notification for student fee record ${fee._id}: ${feeError.message}`);
        }
      }

      logger.info('Scheduled fee reminder job finished successfully.');
    } catch (error) {
      logger.error(`Error in fee reminder job: ${error.message}`);
    }
  });

  logger.info(`Fee reminder background job scheduled with cron pattern: ${schedule}`);
};

module.exports = { startFeeReminderJob };
