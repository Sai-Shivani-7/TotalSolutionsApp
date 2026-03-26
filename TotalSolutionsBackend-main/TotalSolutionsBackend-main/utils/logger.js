const winston = require('winston');
const morgan = require('morgan');
const DailyRotateFile = require('winston-daily-rotate-file');

// Winston Logger Configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'totalb-server' },
  transports: [
    // Error logs with daily rotation
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '10m', // 10MB per file
      maxDays: '2d', // Keep 2 days of logs
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
      )
    }),
    // Combined logs with daily rotation
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m', // 10MB per file
      maxDays: '2d', // Keep 2 days of logs
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
      )
    }),
    // Console logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service }) => {
          return `${timestamp} [${service}] ${level}: ${message}`;
        })
      )
    })
  ]
});

// Morgan HTTP Request Logger (for development)
const morganFormat = 'combined'

// Single stream: Both Morgan and application logs go through Winston logger
const morganStream = {
  write: (message) => logger.info(message.trim())
};
 
// Morgan middleware - logs all HTTP requests through Winston
const httpLoggerAll = morgan(morganFormat, {
  stream: morganStream
});

// Morgan middleware - logs only errors through Winston
const httpLogger = morgan(morganFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: morganStream
});

module.exports = { logger, httpLogger, httpLoggerAll };
