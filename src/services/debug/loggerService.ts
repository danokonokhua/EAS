import * as Sentry from '@sentry/react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: any;
}

class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private readonly maxLogs: number = 1000;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    };

    this.logs.push(logEntry);

    // Keep logs under limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (__DEV__) {
      console[level](message, data);
    } else {
      Sentry.addBreadcrumb({
        category: 'app',
        message,
        data,
        level,
      });
    }
  }

  debug(message: string, data?: any) {
    this.addLog('debug', message, data);
  }

  info(message: string, data?: any) {
    this.addLog('info', message, data);
  }

  warn(message: string, data?: any) {
    this.addLog('warn', message, data);
  }

  error(message: string, error?: Error, data?: any) {
    this.addLog('error', message, { error, ...data });
    if (!__DEV__) {
      Sentry.captureException(error || new Error(message), {
        extra: data,
      });
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const loggerService = LoggerService.getInstance();
