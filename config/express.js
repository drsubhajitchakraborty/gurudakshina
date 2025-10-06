const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
const errorHandler = require('../middleware/errorHandler');
const winston = require('winston');

const authRoutes = require('../routes/authRoutes');

module.exports = () => {
  const app = express();
  app.use(Sentry.Handlers.requestHandler());
  app.use(express.json());
  app.use(helmet());
  app.use(cors());

  // Rate limiting for auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many requests, please try again later.'
  });
  app.use('/api/auth', authLimiter, authRoutes);

  // Sentry error handler
  app.use(Sentry.Handlers.errorHandler());

  // Winston logger setup
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });

  // Global error handler
  app.use((err, req, res, next) => {
    logger.error({ message: err.message, stack: err.stack });
    errorHandler(err, req, res, next);
  });

  return app;
};
