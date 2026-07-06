'use strict';

const nodemailer = require('nodemailer');
const logger = require('../utils/logger.util');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'test') {
    // Use a mock transport in test environment
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    transporter.verify((error) => {
      if (error) {
        logger.warn(`Mailer configuration error: ${error.message}`);
      } else {
        logger.info('Mailer is ready to send emails.');
      }
    });
  }

  return transporter;
};

module.exports = { getTransporter };
