import { BrowserWindow, dialog, ipcMain } from 'electron';

import { IPC_CHANNELS } from './constants';

// Get the library manager instance
const getLibraryManager = () => {
  // Import dynamically to avoid circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  return require('./index').libraryManager;
};

// Get library data
ipcMain.handle(IPC_CHANNELS.GET_LIBRARY, async () => {
  try {
    const libraryManager = getLibraryManager();
    return libraryManager.getLibrary();
  } catch (error) {
    console.error('Failed to get library:', error);
    throw error;
  }
});

// Get library settings
ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
  try {
    const libraryManager = getLibraryManager();
    return libraryManager.getSettings();
  } catch (error) {
    console.error('Failed to get library settings:', error);
    throw error;
  }
});

// Update library settings
ipcMain.handle(IPC_CHANNELS.UPDATE_SETTINGS, async (_, settings) => {
  try {
    const libraryManager = getLibraryManager();
    await libraryManager.updateSettings(settings);
    return true;
  } catch (error) {
    console.error('Failed to update library settings:', error);
    throw error;
  }
});

// Scan library
ipcMain.handle(IPC_CHANNELS.SCAN_LIBRARY, async () => {
  try {
    const libraryManager = getLibraryManager();

    // Set up progress callback
    libraryManager.setScanProgressCallback((progress) => {
      // Send progress updates to the renderer
      const mainWindow = BrowserWindow.getAllWindows()[0];

      if (progress.status === 'complete') {
        // Send the updated library when the scan is complete
        if (mainWindow) {
          mainWindow.webContents.send(
            IPC_CHANNELS.SCAN_COMPLETE,
            libraryManager.getLibrary(),
          );
        }
      } else if (progress.status === 'error') {
        // Send error to the renderer
        if (mainWindow) {
          mainWindow.webContents.send(IPC_CHANNELS.SCAN_ERROR, {
            message: progress.error || 'Unknown error',
          });
        }
      } else {
        // Send progress to the renderer
        mainWindow?.webContents.send(IPC_CHANNELS.SCAN_PROGRESS, progress);
      }
    });

    // Start the scan
    await libraryManager.scanLibrary();
    return true;
  } catch (error) {
    console.error('Failed to scan library:', error);
    throw error;
  }
});

// Select folder
ipcMain.handle(IPC_CHANNELS.SELECT_FOLDER, async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (canceled || !filePaths.length) {
      return null;
    }

    return filePaths[0];
  } catch (error) {
    console.error('Failed to select folder:', error);
    throw error;
  }
});

// Play media
ipcMain.handle(IPC_CHANNELS.PLAY_MEDIA, async (_, mediaId) => {
  try {
    const libraryManager = getLibraryManager();
    await libraryManager.playMedia(mediaId);
    return true;
  } catch (error) {
    console.error('Failed to play media:', error);
    throw error;
  }
});

// Update watch status
ipcMain.handle(
  IPC_CHANNELS.UPDATE_WATCH_STATUS,
  async (_, { mediaId, watched }) => {
    try {
      const libraryManager = getLibraryManager();
      await libraryManager.updateWatchStatus(mediaId, watched);
      return true;
    } catch (error) {
      console.error('Failed to update watch status:', error);
      throw error;
    }
  },
);
