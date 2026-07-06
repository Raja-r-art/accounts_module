'use strict';

const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const compression = require('compression');
const path = require('path');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const swaggerConfig = require('./config/swagger');
const logger = require('./utils/logger.util');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));

// CORS — allow frontend on Vite (any port on localhost or 127.0.0.1)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, curl)
    if (!origin) return callback(null, true);
    
    // Allow any localhost or 127.0.0.1 origin on any port
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost) return callback(null, true);
    
    // Also allow env configured frontend URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate Limiting
app.use('/api/', apiLimiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data Sanitization
app.use(mongoSanitize()); // NoSQL injection
app.use(xssClean());      // XSS attacks

// Compression
app.use(compression());

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
  }));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
swaggerConfig(app);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College ERP API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
