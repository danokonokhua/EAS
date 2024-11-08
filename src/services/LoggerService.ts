export interface LogMessage {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LoggerObserver {
  onLogMessage: (message: LogMessage) => void;
}

export class LoggerService {
  private observers: LoggerObserver[] = [];
  private logHistory: LogMessage[] = [];
  private readonly MAX_HISTORY = 1000;

  addObserver(observer: LoggerObserver) {
    this.observers.push(observer);
  }

  removeObserver(observer: LoggerObserver) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notify(message: LogMessage) {
    this.observers.forEach(observer => observer.onLogMessage(message));
  }

  log(level: LogMessage['level'], message: string, metadata?: Record<string, any>) {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date(),
      metadata
    };

    this.logHistory.push(logMessage);
    if (this.logHistory.length > this.MAX_HISTORY) {
      this.logHistory.shift();
    }

    this.notify(logMessage);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }

  getLogHistory(): LogMessage[] {
    return [...this.logHistory];
  }

  clearHistory() {
    this.logHistory = [];
  }
}

// Create a singleton instance
export const loggerService = new LoggerService();
