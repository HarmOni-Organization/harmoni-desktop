import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import os from 'os';
import * as path from 'path';
import { AppLogger } from 'shared/logger';
/**
 * Checks if a VLC instance with the specified port is running.
 * @param {number} port - Port to check for VLC.
 * @returns {boolean} True if a VLC instance is running on the port, false otherwise.
 */
export const checkVLCRunning = (port: number): boolean => {
  const platform = os.platform();
  try {
    // AppLogger.debug('Checking if VLC is running...', { context: 'VLCManager' });

    if (platform === 'win32') {
      const result = execSync('tasklist', { stdio: 'pipe' }).toString();
      const isRunning = result.toLowerCase().includes('vlc.exe');
      AppLogger.debug(`VLC check result on Windows: ${isRunning}`, {
        context: 'VLCManager',
      });
      return isRunning;
    }

    const result = execSync(`lsof -i:${port}`, { stdio: 'pipe' }).toString();
    const isRunning = result.toLowerCase().includes('vlc');
    // AppLogger.debug(`VLC check result on Unix: ${isRunning}`, {
    //   context: 'VLCManager',
    // });
    return isRunning;
  } catch (error) {
    AppLogger.warn('VLC is not running or could not be checked', {
      context: 'VLCManager',
    });
    return false; // VLC process not found
  }
};

/**
 * Starts VLC with specified HTTP interface settings and optionally loads a media file.
 * @param {string} host - VLC HTTP interface host.
 * @param {number} port - VLC HTTP interface port.
 * @param {string} password - VLC HTTP interface password.
 * @param {string} playerPath - Path to the VLC executable.
 * @param {string} [mediaFile] - Optional path to the media file to be played.
 */
export const launchVLC = async ({
  host,
  port,
  password,
  path: playerPath,
  mediaFile = '',
}: {
  host: string;
  port: number;
  password: string;
  path: string;
  mediaFile?: string; // Optional media file
}): Promise<void> => {
  try {
    if (!playerPath) {
      throw new Error('VLC executable path is missing.');
    }
    const resolvedPlayerPath = path.resolve(playerPath);

    if (!fs.existsSync(resolvedPlayerPath)) {
      throw new Error(`VLC executable not found at: ${resolvedPlayerPath}`);
    }

    let resolvedMediaFile = '';

    if (mediaFile) {
      resolvedMediaFile = path.resolve(mediaFile);
      if (!fs.existsSync(resolvedMediaFile)) {
        throw new Error(`Media file not found at: ${resolvedMediaFile}`);
      }
    }

    if (checkVLCRunning(port)) {
      throw new Error(`VLC is already running on port ${port}.`);
    }

    // Construct the VLC command
    const args = `--extraintf=http --http-host=${host} --http-port=${port} --http-password=${password} --no-video-title-show`;
    const fileArg = mediaFile ? `"${resolvedMediaFile}"` : ''; // Add file if provided
    const command = `"${resolvedPlayerPath}" ${args} ${fileArg}`;

    AppLogger.info('Starting VLC with command:', {
      context: 'VLCManager',
      transport: ['console'],
    });
    AppLogger.debug(command, { context: 'VLCManager' });

    await exec(command);
    AppLogger.info('VLC started successfully', { context: 'VLCManager' });
  } catch (error) {
    AppLogger.error(`Failed to start VLC: ${error.message}`, {
      context: 'VLCManager',
      transport: ['console'],
    });
    throw error;
  }
};

export const closeVLC = (port) => {
  try {
    console.log(`port ${port}`);

    // Command to get the VLC process ID
    exec('pgrep vlc', (error, stdout, stderr) => {
      AppLogger.info(`stdout${stdout}`, {
        context: 'VLCPlayerController',
      });
      if (error) {
        AppLogger.error(`Error finding VLC process: ${stderr}`, {
          context: 'VLCPlayerController',
        });
        return;
      }

      const vlcPid = stdout.trim(); // Get the process ID of VLC
      if (vlcPid) {
        // Kill the VLC process
        exec(`kill -9 ${vlcPid}`, (killError, killStdout, killStderr) => {
          if (killError) {
            AppLogger.error(`Error closing VLC: ${killStderr}`, {
              context: 'VLCPlayerController',
            });
            return;
          }

          AppLogger.info('VLC has been forcefully closed.', {
            context: 'VLCPlayerController',
          });
        });
      } else {
        AppLogger.warn('VLC process not found.', {
          context: 'VLCPlayerController',
        });
      }
    });
  } catch (error) {
    AppLogger.error('Error forcefully closing VLC', {
      context: 'VLCPlayerController',
    });
  }
};
