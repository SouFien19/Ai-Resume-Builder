/**
 * Professional logging system for ResumeCraft AI
 * Replaces console.log statements with structured logging
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    this.logLevel = process.env.NODE_ENV === 'production' 
      ? LogLevel.WARN 
      : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${timestamp}] ${level}: ${entry.message}${context}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    };

    if (level === LogLevel.ERROR) {
      entry.stack = new Error().stack;
    }

    const formattedMessage = this.formatMessage(entry);

    // In production, you might want to send logs to a service like DataDog, Sentry, etc.
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
      this.sendToLoggingService(entry);
    } else {
      // Console output for development
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.log(formattedMessage);
          break;
      }
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // Implement your preferred logging service integration
    // Examples: Sentry, DataDog, CloudWatch, etc.
    if (process.env.NEXT_PUBLIC_LOGGING_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_LOGGING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Fallback to console if logging service fails
        console.error('Failed to send log to service:', entry);
      });
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
}

export const logger = new Logger();

// Utility functions for common logging patterns
export const logAPIRequest = (method: string, path: string, userId?: string) => {
  logger.info(`API Request: ${method} ${path}`, { userId });
};

export const logAPIResponse = (method: string, path: string, status: number, duration?: number) => {
  logger.info(`API Response: ${method} ${path}`, { status, duration });
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error(error.message, { ...context, stack: error.stack });
};

export const logPerformance = (operation: string, duration: number, threshold = 1000) => {
  if (duration > threshold) {
    logger.warn(`Slow operation: ${operation}`, { duration, threshold });
  } else {
    logger.debug(`Performance: ${operation}`, { duration });
  }
};