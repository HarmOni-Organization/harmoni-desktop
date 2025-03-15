import fs from 'fs';
import os from 'os';
import readline from 'readline';
import { AppLogger } from 'shared/logger';

/**
 * Prompts the user for the VLC executable path if the default path is not found.
 * @returns {Promise<string>} User-provided VLC path.
 */
export const requestVLCPath = (): Promise<string> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    AppLogger.info('Prompting user for VLC executable path...', {
      context: 'VLCPathResolver',
    });

    rl.question('Enter the path to the VLC executable: ', (answer) => {
      AppLogger.debug(`User provided path: ${answer.trim()}`, {
        context: 'VLCPathResolver',
      });
      rl.close();
      resolve(answer.trim());
    });
  });
};

/**
 * Retrieves the VLC executable path based on the OS platform.
 * @returns {Promise<string>} Path to the VLC executable.
 */
export const resolveVLCPath = async (): Promise<string> => {
  const platform = os.platform();
  AppLogger.debug(`Detected platform: ${platform}`, {
    context: 'VLCPathResolver',
  });

  const defaultPaths: Record<string, string> = {
    win32: 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
    darwin: '/Applications/VLC.app/Contents/MacOS/VLC',
    linux: '/usr/bin/vlc',
  };

  const defaultPath = defaultPaths[platform];
  if (!defaultPath) {
    const errorMessage = `Unsupported platform: ${platform}`;
    AppLogger.error(errorMessage, { context: 'VLCPathResolver' });
    throw new Error(errorMessage);
  }

  AppLogger.info(`Checking for VLC at default path: ${defaultPath}`, {
    context: 'VLCPathResolver',
  });

  // Check if VLC exists at the default path
  if (fs.existsSync(defaultPath)) {
    AppLogger.info(`Default VLC path found: ${defaultPath}`, {
      context: 'VLCPathResolver',
    });
    return defaultPath;
  }

  AppLogger.warn(
    'Default VLC path not found. Prompting user for executable path...',
    { context: 'VLCPathResolver' },
  );

  // If VLC not found, ask the user to select the path
  const userPath = await requestVLCPath();

  AppLogger.info(`Validating user-provided path: ${userPath}`, {
    context: 'VLCPathResolver',
  });

  // Validate the user-provided path
  if (!fs.existsSync(userPath)) {
    const errorMessage = 'Invalid VLC path or VLC is not installed.';
    AppLogger.error(errorMessage, { context: 'VLCPathResolver' });
    throw new Error(errorMessage);
  }

  AppLogger.info(`User-provided VLC path validated: ${userPath}`, {
    context: 'VLCPathResolver',
  });

  return userPath;
};
