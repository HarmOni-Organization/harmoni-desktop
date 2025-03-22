export enum LogLevel {
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

type LogTransport = 'console' | 'localStorage' | 'server';

interface LogOptions {
  context?: string; // Optional context for the log
  transport?: LogTransport[]; // Define where the log should go
}

interface LoggerConfig {
  level: LogLevel; // Minimum log level to record
  transports: LogTransport[]; // Default transports
  serverUrl?: string; // Optional server URL for logs
}

type LogFormatter = (
  level: LogLevel,
  message: string,
  options?: LogOptions,
) => string;

type TransportHandler = (
  level: LogLevel,
  message: string,
  options?: LogOptions,
) => void;

export class Logger {
  private config: LoggerConfig;

  private transportHandlers: Map<LogTransport, TransportHandler>;

  private allowedContexts: Set<string> = new Set();

  private excludedContexts: Set<string> = new Set();

  private customFormatter?: LogFormatter;

  private maxLogs = 1000; // Maximum logs to store in localStorage

  constructor(
    private name: string,
    config?: Partial<LoggerConfig>,
  ) {
    this.config = {
      level: LogLevel.INFO,
      transports: ['console', 'localStorage'],
      ...config,
    };

    this.transportHandlers = new Map<LogTransport, TransportHandler>([
      ['console', this.logToConsole.bind(this)],
      ['localStorage', this.logToLocalStorage.bind(this)],
      ['server', this.logToServer.bind(this)],
    ]);
  }

  public setLogLevel(level: LogLevel): void {
    this.config.level = level;
  }

  public setFormatter(formatter: LogFormatter): void {
    this.customFormatter = formatter;
  }

  public allowContext(context: string): void {
    this.allowedContexts.add(context);
  }

  public disallowContext(context: string): void {
    this.allowedContexts.delete(context);
  }

  public excludeContext(context: string): void {
    this.allowedContexts.delete(context);
    this.excludedContexts.add(context);
  }

  public includeContext(context: string): void {
    this.excludedContexts.delete(context); // Remove the context from exclusions
  }

  public clearAllowedContexts(): void {
    this.allowedContexts.clear();
  }

  public clearExcludedContexts(): void {
    this.excludedContexts.clear();
  }

  private shouldLog(level: LogLevel, context?: string): boolean {
    const levels = Object.values(LogLevel);
    const contextAllowed =
      !this.allowedContexts.size || this.allowedContexts.has(context || '');
    const contextExcluded = context && this.excludedContexts.has(context);

    return (
      levels.indexOf(level) >= levels.indexOf(this.config.level) &&
      contextAllowed &&
      !contextExcluded
    );
  }

  private formatLog(
    level: LogLevel,
    message: string,
    options?: LogOptions,
  ): string {
    if (this.customFormatter) {
      return this.customFormatter(level, message, options);
    }

    const colors: { [key in LogLevel]: string } = {
      TRACE: '\x1b[37m', // White
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[41m', // Red background
    };

    const reset = '\x1b[0m'; // Reset color

    // Additional colors for specific parts
    const timestampColor = '\x1b[90m'; // Grey
    const nameColor = '\x1b[35m'; // Magenta
    const contextColor = '\x1b[34m'; // Blue
    const messageColor = '\x1b[37m'; // White (default for message)

    const timestamp = `${timestampColor}${new Date().toISOString()}${reset}`;
    const name = `${nameColor}[${this.name}]${reset}`;
    const logLevel = `${colors[level]}[${level}]${reset}`;
    const context = options?.context
      ? `${contextColor}[${options.context}]${reset}`
      : '';
    const logMessage = `${messageColor}${message}${reset}`;

    return `${timestamp} ${name} ${logLevel} ${context} ${logMessage}`;
  }

  private logToConsole(
    level: LogLevel,
    message: string,
    options?: LogOptions,
  ): void {
    const logMessage = this.formatLog(level, message, options);

    switch (level) {
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  private logToLocalStorage(
    level: LogLevel,
    message: string,
    options?: LogOptions,
  ): void {
    if (typeof localStorage === 'undefined') {
      // this.logToConsole(LogLevel.WARN, 'localStorage is not available', {
      //   context: 'Logger',
      // });
      return;
    }

    const logMessage = this.formatLog(level, message, options);
    try {
      const logs = JSON.parse(localStorage.getItem('logs') || '[]');
      if (logs.length >= this.maxLogs) {
        logs.shift(); // Remove the oldest log
      }
      logs.push({
        level,
        message: logMessage,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('logs', JSON.stringify(logs));
    } catch (error) {
      this.logToConsole(LogLevel.ERROR, 'Failed to save log to localStorage', {
        context: 'Logger',
      });
    }
  }

  private async logToServer(
    level: LogLevel,
    message: string,
    options?: LogOptions,
  ): Promise<void> {
    if (!this.config.serverUrl) {
      this.logToConsole(
        LogLevel.WARN,
        'Server logging enabled but no server URL configured',
        { context: 'Logger' },
      );
      return;
    }

    const logMessage = this.formatLog(level, message, options);

    try {
      await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message: logMessage,
          timestamp: new Date().toISOString(),
          context: options?.context,
        }),
      });
    } catch (error) {
      this.logToConsole(LogLevel.ERROR, 'Failed to send log to server', {
        context: 'Logger',
      });
    }
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    if (!this.shouldLog(level, options?.context)) {
      return;
    }

    const transports = options?.transport || this.config.transports;
    for (const transport of transports) {
      const handler = this.transportHandlers.get(transport);
      handler?.(level, message, options);
    }
  }

  public trace(message: string, options?: LogOptions): void {
    this.log(LogLevel.TRACE, message, options);
  }

  public debug(message: string, options?: LogOptions): void {
    this.log(LogLevel.DEBUG, message, options);
  }

  public info(message: string, options?: LogOptions): void {
    this.log(LogLevel.INFO, message, options);
  }

  public warn(message: string, options?: LogOptions): void {
    this.log(LogLevel.WARN, message, options);
  }

  public error(message: string, options?: LogOptions): void {
    this.log(LogLevel.ERROR, message, options);
  }

  public fatal(message: string, options?: LogOptions): void {
    this.log(LogLevel.FATAL, message, options);
  }
}

export const AppLogger = new Logger('App', {
  transports: ['console', 'localStorage'],
  level: LogLevel.TRACE,
});
export default Logger;
