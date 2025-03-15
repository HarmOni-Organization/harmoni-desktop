import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_LIBRARY_SETTINGS, IPC_CHANNELS } from '../constants';
import type {
  LibrarySettings,
  MediaItem,
  MediaLibrary,
  ScanProgress,
} from '../types';

export const useLibraryManager = () => {
  const [library, setLibrary] = useState<MediaLibrary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<LibrarySettings>(
    DEFAULT_LIBRARY_SETTINGS,
  );
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    status: 'idle',
    progress: 0,
  });

  // Load library and settings on mount
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        setIsLoading(true);

        // Get library settings
        const savedSettings = await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.GET_SETTINGS,
        );

        if (savedSettings) {
          setSettings(savedSettings);
        }

        // Get library data
        const libraryData = await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.GET_LIBRARY,
        );

        if (libraryData) {
          setLibrary(libraryData);
        }
      } catch (error) {
        console.error('Failed to load library:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLibrary();

    // Set up event listeners for scan progress
    const scanProgressListener = window.electron.ipcRenderer.on(
      IPC_CHANNELS.SCAN_PROGRESS,
      (progress: any) => {
        setScanProgress(progress);
      },
    );

    const scanCompleteListener = window.electron.ipcRenderer.on(
      IPC_CHANNELS.SCAN_COMPLETE,
      (updatedLibrary: any) => {
        setLibrary(updatedLibrary);
        setScanProgress({
          status: 'complete',
          progress: 100,
        });
      },
    );

    const scanErrorListener = window.electron.ipcRenderer.on(
      IPC_CHANNELS.SCAN_ERROR,
      (error: any) => {
        setScanProgress({
          status: 'error',
          progress: 0,
          error: error.message || 'Unknown error',
        });
      },
    );

    // Clean up listeners
    return () => {
      scanProgressListener();
      scanCompleteListener();
      scanErrorListener();
    };
  }, []);

  // Scan library folders
  const scanLibrary = useCallback(async () => {
    try {
      setScanProgress({
        status: 'scanning',
        progress: 0,
      });

      await window.electron.ipcRenderer.invoke(IPC_CHANNELS.SCAN_LIBRARY);
    } catch (error) {
      console.error('Failed to scan library:', error);
      setScanProgress({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  // Select a folder to add to the library
  const selectFolder = useCallback(async () => {
    try {
      const selectedFolder = await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.SELECT_FOLDER,
      );

      if (selectedFolder) {
        const updatedSettings = {
          ...settings,
          libraryFolders: [...settings.libraryFolders, selectedFolder],
        };

        await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.UPDATE_SETTINGS,
          updatedSettings,
        );

        setSettings(updatedSettings);

        // Scan the newly added folder
        await scanLibrary();
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  }, [settings, scanLibrary]);

  // Update library settings
  const updateSettings = useCallback(
    async (newSettings: Partial<LibrarySettings>) => {
      try {
        const updatedSettings = {
          ...settings,
          ...newSettings,
        };

        await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.UPDATE_SETTINGS,
          updatedSettings,
        );

        setSettings(updatedSettings);
      } catch (error) {
        console.error('Failed to update settings:', error);
      }
    },
    [settings],
  );

  // Play a media file
  const playMedia = useCallback(async (mediaId: string) => {
    try {
      await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.PLAY_MEDIA,
        mediaId,
      );
    } catch (error) {
      console.error('Failed to play media:', error);
    }
  }, []);

  // Update watch status for a media file
  const updateWatchStatus = useCallback(
    async (mediaId: string, watched: boolean) => {
      try {
        await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.UPDATE_WATCH_STATUS,
          { mediaId, watched },
        );

        // Update local state
        if (library) {
          const updatedLibrary = { ...library };

          // Find and update the media item in the library
          const updateMediaInFolder = (folder: any) => {
            for (let i = 0; i < folder.files.length; i++) {
              if (folder.files[i].id === mediaId) {
                folder.files[i].watched = watched;
                return true;
              }
            }

            for (let i = 0; i < folder.subfolders.length; i++) {
              if (updateMediaInFolder(folder.subfolders[i])) {
                return true;
              }
            }

            return false;
          };

          updatedLibrary.folders.forEach((folder) => {
            updateMediaInFolder(folder);
          });

          // Update recently watched list if needed
          if (watched) {
            const mediaItem = findMediaItemById(library, mediaId);
            if (mediaItem) {
              updatedLibrary.recentlyWatched = [
                mediaItem,
                ...updatedLibrary.recentlyWatched.filter(
                  (item) => item.id !== mediaId,
                ),
              ].slice(0, 20); // Keep only the 20 most recent
            }
          }

          setLibrary(updatedLibrary);
        }
      } catch (error) {
        console.error('Failed to update watch status:', error);
      }
    },
    [library],
  );

  // Helper function to find a media item by ID
  const findMediaItemById = (
    library: MediaLibrary,
    mediaId: string,
  ): MediaItem | null => {
    const searchInFolder = (folder: any): MediaItem | null => {
      for (const file of folder.files) {
        if (file.id === mediaId) {
          return file;
        }
      }

      for (const subfolder of folder.subfolders) {
        const found = searchInFolder(subfolder);
        if (found) {
          return found;
        }
      }

      return null;
    };

    for (const folder of library.folders) {
      const found = searchInFolder(folder);
      if (found) {
        return found;
      }
    }

    return null;
  };

  return {
    library,
    isLoading,
    scanProgress,
    settings,
    scanLibrary,
    selectFolder,
    updateSettings,
    playMedia,
    updateWatchStatus,
  };
};
