'use strict';

const winston = require('winston');
const path = require('path');

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        simple()
      ),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// Add http level
logger.http = (message) => logger.log('http', message);

module.exports = logger;
