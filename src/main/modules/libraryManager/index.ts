import { app } from 'electron';
import { existsSync } from 'fs';
import path from 'path';

import * as fsPromises from 'fs/promises';
import { LibraryManager } from './LibraryManager';

// Create an instance of the LibraryManager
export const libraryManager = new LibraryManager();

// Initialize the library manager
async function initializeLibraryManager() {
  try {
    // Create the library data directory if it doesn't exist
    const libraryDataPath = path.join(app.getPath('userData'), 'library-data');

    if (!existsSync(libraryDataPath)) {
      await fsPromises.mkdir(libraryDataPath, { recursive: true });
    }

    // Initialize the library manager
    await libraryManager.initialize();
    console.log('Library manager initialized successfully');

    // Import IPC handlers after initialization to avoid circular dependencies
    require('./ipcHandlers');
  } catch (error) {
    console.error('Failed to initialize library manager:', error);
  }
}

// Initialize the library manager when the app is ready
app
  .whenReady()
  .then(initializeLibraryManager)
  .catch((error) => {
    console.error('Error initializing library manager:', error);
  });
