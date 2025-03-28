import { dialog, ipcMain } from 'electron';
import os from 'os';
import path from 'path';
import { AppLogger } from 'shared/logger';

import type { PlayerOptions, PlayerType } from './controllers/PlayerFactory';
import { VideoPlayerManager } from './VideoPlayerManager';

const videoPlayerManager = new VideoPlayerManager();

/**
 * Sets the video player type and options.
 */
ipcMain.handle(
  'set-player',
  async (
    event,
    playerType: PlayerType,
    options: PlayerOptions[typeof playerType],
  ) => {
    try {
      AppLogger.info(`Setting player: ${playerType}`, { context: 'IPC' });
      videoPlayerManager.setPlayer(playerType, options);

      const changes = { playerType, path: '', options };
      try {
        changes.path = await videoPlayerManager.autoDetectPlayerPath();
        AppLogger.info(`Detected VLC path: ${changes.path}`, {
          context: 'IPC',
        });
      } catch (error) {
        AppLogger.warn(
          `Auto-detect VLC path failed: ${(error as Error).message}`,
          { context: 'IPC' },
        );
      }

      event.sender.send('player-details', changes);
      return { success: true };
    } catch (error) {
      AppLogger.error(`Error setting player: ${(error as Error).message}`, {
        context: 'IPC',
      });
      return { success: false, error: (error as Error).message };
    }
  },
);

/**
 * Starts the video player.
 */
ipcMain.handle('start', async (event) => {
  try {
    AppLogger.info('Starting player...', { context: 'IPC' });
    await videoPlayerManager.start((...arg) => {
      event.sender.send('player-is-ready', ...arg);
    });
    AppLogger.info('Player started successfully', { context: 'IPC' });

    await videoPlayerManager.observeStatusChange(
      (changes, source) => {
        AppLogger.debug(`State change detected: ${JSON.stringify(changes)}`, {
          context: 'PlayerObserver',
        });
        event.sender.send('state-change', changes, source);
      },
      () => {
        event.sender.send('player-close');
      },
      10,
    );

    return { success: true };
  } catch (error) {
    AppLogger.error(`Error starting player: ${(error as Error).message}`, {
      context: 'IPC',
    });
    return { success: false, error: (error as Error).message };
  }
});

/**
 * Retrieves the current player status.
 */
ipcMain.handle('get-status', async () => {
  try {
    AppLogger.info('Retrieving player status...', { context: 'IPC' });
    return await videoPlayerManager.getStatus();
  } catch (error) {
    AppLogger.error(`Error getting status: ${(error as Error).message}`, {
      context: 'IPC',
    });
    return { success: false, error: (error as Error).message };
  }
});

/**
 * Sends a play command to the player.
 */
ipcMain.handle('play', async () => {
  try {
    AppLogger.info('Sending play command...', { context: 'IPC' });
    await videoPlayerManager.play();
    return { success: true };
  } catch (error) {
    AppLogger.error(`Error playing: ${(error as Error).message}`, {
      context: 'IPC',
    });
    return { success: false, error: (error as Error).message };
  }
});

/**
 * Sends a pause command to the player.
 */
ipcMain.handle('pause', async () => {
  try {
    AppLogger.info('Sending pause command...', { context: 'IPC' });
    await videoPlayerManager.pause();
    return { success: true };
  } catch (error) {
    AppLogger.error(`Error pausing: ${(error as Error).message}`, {
      context: 'IPC',
    });
    return { success: false, error: (error as Error).message };
  }
});

/**
 * Sends a stop command to the player.
 */
ipcMain.handle('stop', async () => {
  try {
    AppLogger.info('Sending stop command...', { context: 'IPC' });
    await videoPlayerManager.stop();
    return { success: true };
  } catch (error) {
    AppLogger.error(`Error stopping: ${(error as Error).message}`, {
      context: 'IPC',
    });
    return { success: false, error: (error as Error).message };
  }
});

/**
 * Sends a seek command to the player.
 */
ipcMain.handle('seek', async (event, timeInSeconds: number) => {
  try {
    AppLogger.info(`Seeking to ${timeInSeconds} seconds...`, {
      context: 'IPC',
    });
    await videoPlayerManager.seek(timeInSeconds);
    return { success: true };
  } catch (error) {
    AppLogger.error(`Error seeking: ${(error as Error).message}`, {
      context: 'IPC',
    });
    return { success: false, error: (error as Error).message };
  }
});

/**
 * Opens a file picker to select a media player executable.
 */
ipcMain.handle('select-player', async (_, initialPath?: string) => {
  try {
    const platform = os.platform();
    const extensions: string[] = [];
    switch (platform) {
      case 'win32':
        extensions.push('exe');
        break;
      case 'darwin':
        extensions.push('bin');
        break;
      default:
    }

    // Get default directory from initialPath if available
    let defaultPath: string | undefined;
    if (initialPath && initialPath.trim() !== '') {
      try {
        // Use the directory of the initialPath
        defaultPath = path.dirname(initialPath);
        AppLogger.info(`Using initial directory: ${defaultPath}`, {
          context: 'IPC',
        });
      } catch (error) {
        AppLogger.warn(
          `Could not use initialPath: ${(error as Error).message}`,
          { context: 'IPC' },
        );
      }
    }

    const result = await dialog.showOpenDialog(global.mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Executables', extensions }],
      defaultPath,
    });

    if (result.canceled) {
      AppLogger.info('User canceled media player selection.', {
        context: 'IPC',
      });
      return null;
    }

    AppLogger.info(`Selected player path: ${result.filePaths[0]}`, {
      context: 'IPC',
    });
    return result.filePaths[0];
  } catch (error) {
    AppLogger.error(
      `Error selecting media player: ${(error as Error).message}`,
      { context: 'IPC' },
    );
    return null;
  }
});

/**
 * Opens a file picker to select a media file.
 */
ipcMain.handle('select-media', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'Media Files',
          extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv'],
        },
      ],
    });

    if (result.canceled) {
      AppLogger.info('User canceled media file selection.', { context: 'IPC' });
      return null;
    }

    AppLogger.info(`Selected media file: ${result.filePaths[0]}`, {
      context: 'IPC',
    });
    return result.filePaths[0];
  } catch (error) {
    AppLogger.error(`Error selecting media file: ${(error as Error).message}`, {
      context: 'IPC',
    });
    return null;
  }
});

/**
 * Checks if the player is running.
 */
ipcMain.handle('check-player-running', async () => {
  try {
    const isRunning = await videoPlayerManager.checkPlayerRunning();
    AppLogger.info(`Checked player running status: ${isRunning}`, {
      context: 'IPC',
    });
    return isRunning;
  } catch (error) {
    AppLogger.error(
      `Error checking player status: ${(error as Error).message}`,
      { context: 'IPC' },
    );
    return false;
  }
});

/**
 * Loads a media file into the player.
 */
ipcMain.handle('load-media-file', async (event, filePath: string) => {
  try {
    AppLogger.info(`Loading media file: ${filePath}`, { context: 'IPC' });
    return await videoPlayerManager.loadMedia(filePath);
  } catch (error) {
    AppLogger.error(`Error loading media file: ${(error as Error).message}`, {
      context: 'IPC',
    });
    return { success: false, error: (error as Error).message };
  }
});

/**
 * Displays a message on the VLC player's on-screen display.
 */
ipcMain.handle(
  'display-message',
  async (event, message: string, duration = 5) => {
    try {
      AppLogger.info(`Displaying message on VLC: ${message}`, {
        context: 'IPC',
      });
      await videoPlayerManager.displayMessage(message, duration);
      return { success: true };
    } catch (error) {
      AppLogger.error(`Error displaying message: ${(error as Error).message}`, {
        context: 'IPC',
      });
      return { success: false, error: (error as Error).message };
    }
  },
);

/**
 * Validates if the provided path is a valid video player.
 * Currently supports VLC player validation.
 */
ipcMain.handle('validate-player-path', async (_, filePath: string) => {
  try {
    AppLogger.info(`Validating player path: ${filePath}`, {
      context: 'IPC',
    });

    // Use the VideoPlayerManager to validate the player path
    return await videoPlayerManager.validatePlayerPath(filePath);
  } catch (error) {
    AppLogger.error(
      `Error validating player path: ${(error as Error).message}`,
      { context: 'IPC' },
    );
    return false;
  }
});
