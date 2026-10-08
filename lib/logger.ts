/**
 * Structured logger that no-ops in production for verbose levels
 * but always emits warnings and errors.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  const envLevel = (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test';
  // In production, only show warn and error
  if (envLevel === 'production') {
    return LOG_LEVELS[level] >= LOG_LEVELS.warn;
  }
  return true;
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(formatMessage('debug', message, meta));
    }
  },
  info(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(formatMessage('info', message, meta));
    }
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage('warn', message, meta));
    }
  },
  error(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(formatMessage('error', message, meta));
    }
  },
};
