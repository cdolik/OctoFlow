import winston from 'winston';
import 'winston-daily-rotate-file';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const productionTransports = [
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  new winston.transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

const developmentTransports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format,
  transports:
    process.env.NODE_ENV === 'production'
      ? productionTransports
      : developmentTransports,
});

// Create a stream object for Morgan integration
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export const logMetric = (
  metricName: string,
  value: number,
  tags: Record<string, string | number> = {}
) => {
  logger.info('METRIC', {
    metric: metricName,
    value,
    tags,
    timestamp: new Date().toISOString(),
  });
};

export const logEvent = (
  eventName: string,
  data: Record<string, any> = {}
) => {
  logger.info('EVENT', {
    event: eventName,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const logError = (
  error: Error,
  context: Record<string, any> = {}
) => {
  logger.error('ERROR', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
  });
}; 