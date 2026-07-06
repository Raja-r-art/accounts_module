'use strict';

require('dotenv').config();
require('express-async-errors');

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger.util');
const { startFeeReminderJob } = require('./src/jobs/feeReminder.job');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`API Docs available at http://localhost:${PORT}/api/docs`);
    });

    // Start background jobs
    if (process.env.NODE_ENV !== 'test') {
      startFeeReminderJob();
    }

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => process.exit(1));
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
