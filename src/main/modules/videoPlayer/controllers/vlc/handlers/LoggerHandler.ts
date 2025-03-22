import { Logger, LogLevel } from 'shared/logger';

/**
 * Initializes and returns a logger instance.
 *
 * @param {string} moduleName - Name of the module using the logger.
 * @returns {Logger} Configured logger instance.
 */
export const initializeLogger = (moduleName: string): Logger => {
  return new Logger(moduleName, {
    level: LogLevel.INFO,
    transports: ['console'],
  });
};
