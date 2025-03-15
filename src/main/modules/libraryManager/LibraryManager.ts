import { app } from 'electron';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import * as fsPromises from 'fs/promises';
import { DEFAULT_LIBRARY_SETTINGS, SUPPORTED_VIDEO_FORMATS } from './constants';
import type {
  LibrarySettings,
  MediaFolder,
  MediaItem,
  MediaLibrary,
  ScanProgress,
} from './types';
import { extractMetadataFromFilename } from './utils/metadataExtractor';
import { fetchMetadata } from './utils/metadataFetcher';
import store from '../../app/store';

export class LibraryManager {
  private library: MediaLibrary;

  private settings: LibrarySettings;

  private scanProgress: ScanProgress;

  private libraryDataPath: string;

  private onScanProgressCallback: ((progress: ScanProgress) => void) | null =
    null;

  constructor() {
    this.library = {
      folders: [],
      recentlyWatched: [],
      recentlyAdded: [],
    };

    this.settings = DEFAULT_LIBRARY_SETTINGS;

    this.scanProgress = {
      status: 'idle',
      progress: 0,
    };

    this.libraryDataPath = path.join(app.getPath('userData'), 'library-data');
  }

  /**
   * Initialize the library manager
   */
  public async initialize(): Promise<void> {
    try {
      // Load settings
      await this.loadSettings();

      // Load library data
      await this.loadLibrary();

      // Scan library if enabled
      if (
        this.settings.scanOnStartup &&
        this.settings.libraryFolders.length > 0
      ) {
        await this.scanLibrary();
      }
    } catch (error) {
      console.error('Failed to initialize library manager:', error);
      throw error;
    }
  }

  /**
   * Load library settings from store
   */
  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = store.get('librarySettings');

      if (savedSettings) {
        this.settings = {
          ...DEFAULT_LIBRARY_SETTINGS,
          ...savedSettings,
        };
      } else {
        // Save default settings
        store.set('librarySettings', this.settings);
      }
    } catch (error) {
      console.error('Failed to load library settings:', error);
      throw error;
    }
  }

  /**
   * Save library settings to store
   */
  private async saveSettings(): Promise<void> {
    try {
      store.set('librarySettings', this.settings);
    } catch (error) {
      console.error('Failed to save library settings:', error);
      throw error;
    }
  }

  /**
   * Load library data from disk
   */
  private async loadLibrary(): Promise<void> {
    try {
      const libraryFilePath = path.join(this.libraryDataPath, 'library.json');

      if (existsSync(libraryFilePath)) {
        const data = await fsPromises.readFile(libraryFilePath, 'utf-8');
        this.library = JSON.parse(data);
      } else {
        // Create empty library
        await this.saveLibrary();
      }
    } catch (error) {
      console.error('Failed to load library data:', error);
      throw error;
    }
  }

  /**
   * Save library data to disk
   */
  private async saveLibrary(): Promise<void> {
    try {
      const libraryFilePath = path.join(this.libraryDataPath, 'library.json');
      await fsPromises.writeFile(
        libraryFilePath,
        JSON.stringify(this.library, null, 2),
        'utf-8',
      );
    } catch (error) {
      console.error('Failed to save library data:', error);
      throw error;
    }
  }

  /**
   * Get library data
   */
  public getLibrary(): MediaLibrary {
    return this.library;
  }

  /**
   * Get library settings
   */
  public getSettings(): LibrarySettings {
    return this.settings;
  }

  /**
   * Update library settings
   */
  public async updateSettings(newSettings: LibrarySettings): Promise<void> {
    try {
      this.settings = {
        ...this.settings,
        ...newSettings,
      };

      await this.saveSettings();
    } catch (error) {
      console.error('Failed to update library settings:', error);
      throw error;
    }
  }

  /**
   * Set scan progress callback
   */
  public setScanProgressCallback(
    callback: (progress: ScanProgress) => void,
  ): void {
    this.onScanProgressCallback = callback;
  }

  /**
   * Update scan progress
   */
  private updateScanProgress(progress: Partial<ScanProgress>): void {
    this.scanProgress = {
      ...this.scanProgress,
      ...progress,
    };

    if (this.onScanProgressCallback) {
      this.onScanProgressCallback(this.scanProgress);
    }
  }

  /**
   * Scan library folders
   */
  public async scanLibrary(): Promise<void> {
    try {
      if (
        this.scanProgress.status === 'scanning' ||
        this.scanProgress.status === 'processing'
      ) {
        throw new Error('Library scan already in progress');
      }

      if (this.settings.libraryFolders.length === 0) {
        throw new Error('No library folders configured');
      }

      // Reset scan progress
      this.updateScanProgress({
        status: 'scanning',
        progress: 0,
        currentFile: undefined,
        totalFiles: undefined,
        processedFiles: undefined,
      });

      // Create new library structure
      const newLibrary: MediaLibrary = {
        folders: [],
        recentlyWatched: this.library.recentlyWatched,
        recentlyAdded: [],
      };

      // Scan each folder
      for (const folderPath of this.settings.libraryFolders) {
        if (!existsSync(folderPath)) {
          console.warn(`Library folder does not exist: ${folderPath}`);
          // Skip this folder
        } else {
          const folderName = path.basename(folderPath);
          const folder: MediaFolder = {
            id: uuidv4(),
            name: folderName,
            path: folderPath,
            files: [],
            subfolders: [],
          };

          // Scan folder
          await this.scanFolder(folderPath, folder);

          newLibrary.folders.push(folder);
        }
      }

      // Update scan progress
      this.updateScanProgress({
        status: 'processing',
        progress: 50,
        currentFile: 'Processing basic metadata...',
      });

      // Process basic metadata (only from filenames, no API calls)
      await this.processBasicMetadata(newLibrary);

      /*
      // Commented out online metadata fetching
      // Process metadata
      await this.processMetadata(newLibrary);
      */

      // Update recently added
      newLibrary.recentlyAdded = this.getRecentlyAddedMedia(newLibrary);

      // Update library
      this.library = newLibrary;

      // Save library
      await this.saveLibrary();

      // Update scan progress
      this.updateScanProgress({
        status: 'complete',
        progress: 100,
        currentFile: undefined,
      });
    } catch (error) {
      console.error('Failed to scan library:', error);

      this.updateScanProgress({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Scan a folder recursively
   */
  private async scanFolder(
    folderPath: string,
    parentFolder: MediaFolder,
  ): Promise<void> {
    try {
      const entries = await fsPromises.readdir(folderPath, {
        withFileTypes: true,
      });

      // Update scan progress
      this.updateScanProgress({
        currentFile: folderPath,
      });

      // Check if this folder is a season folder (e.g., "Season 1", "S01", etc.)
      const folderName = path.basename(folderPath);
      const seasonFolderPattern = /^(?:Season|S)\s*(\d{1,2})$/i;
      const seasonFolderMatch = folderName.match(seasonFolderPattern);
      const seasonNumber = seasonFolderMatch
        ? parseInt(seasonFolderMatch[1], 10)
        : null;

      // Get parent show name if this is a season folder
      const parentShowName = seasonNumber
        ? path.basename(path.dirname(folderPath))
        : null;

      for (const entry of entries) {
        const entryPath = path.join(folderPath, entry.name);

        // Skip excluded folders
        if (
          entry.isDirectory() &&
          this.settings.excludedFolders.includes(entryPath)
        ) {
          // Skip this folder
          continue;
        } else if (entry.isDirectory()) {
          // Create subfolder
          const subfolder: MediaFolder = {
            id: uuidv4(),
            name: entry.name,
            path: entryPath,
            files: [],
            subfolders: [],
          };

          // Scan subfolder
          await this.scanFolder(entryPath, subfolder);

          // Add subfolder if it has files
          if (subfolder.files.length > 0 || subfolder.subfolders.length > 0) {
            parentFolder.subfolders.push(subfolder);
          }
        } else if (entry.isFile()) {
          // Check if file is a supported video format
          const fileExt = path.extname(entry.name).toLowerCase();

          if (
            SUPPORTED_VIDEO_FORMATS.includes(fileExt) &&
            !this.settings.excludedFileTypes.includes(fileExt)
          ) {
            // Get file stats
            const stats = await fsPromises.stat(entryPath);

            // Create media item
            const mediaItem: MediaItem = {
              id: uuidv4(),
              name: entry.name,
              path: entryPath,
              type: 'video',
              format: fileExt.substring(1), // Remove the dot
              size: stats.size,
              lastModified: stats.mtimeMs,
              watched: false,
              // Check if this file was in the previous library
              ...this.findExistingMediaItem(entryPath),
            };

            // Extract metadata from filename
            let extractedMetadata = extractMetadataFromFilename(entry.name);

            // If this is a season folder, enhance the metadata with season info
            if (
              seasonNumber &&
              (!extractedMetadata || !extractedMetadata.season)
            ) {
              extractedMetadata = {
                ...(extractedMetadata || {}),
                season: seasonNumber,
                title:
                  parentShowName ||
                  extractedMetadata?.title ||
                  path.basename(entry.name, fileExt),
              };
            }

            if (extractedMetadata) {
              mediaItem.metadata = extractedMetadata;
            }

            // Add media item to folder
            parentFolder.files.push(mediaItem);

            // Update scan progress
            this.updateScanProgress({
              currentFile: entry.name,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to scan folder: ${folderPath}`, error);
      throw error;
    }
  }

  /**
   * Find existing media item in the current library
   */
  private findExistingMediaItem(filePath: string): Partial<MediaItem> {
    const result: Partial<MediaItem> = {};

    const searchInFolder = (folder: MediaFolder): boolean => {
      // Check files in this folder
      for (const file of folder.files) {
        if (file.path === filePath) {
          // Copy watched status and metadata
          result.watched = file.watched;
          result.watchProgress = file.watchProgress;
          result.metadata = file.metadata;
          return true;
        }
      }

      // Check subfolders
      for (const subfolder of folder.subfolders) {
        if (searchInFolder(subfolder)) {
          return true;
        }
      }

      return false;
    };

    // Search in all folders
    for (const folder of this.library.folders) {
      if (searchInFolder(folder)) {
        break;
      }
    }

    return result;
  }

  /**
   * Process metadata for media items
   */
  private async processMetadata(library: MediaLibrary): Promise<void> {
    // Process all files in all folders
    const processFolder = async (folder: MediaFolder): Promise<void> => {
      // Process files in this folder
      for (const file of folder.files) {
        // Skip files that already have metadata
        if (file.metadata?.coverImage) {
          continue;
        } else {
          try {
            // Update scan progress
            this.updateScanProgress({
              currentFile: file.name,
            });

            // First, try to extract basic metadata from the filename
            const basicMetadata = extractMetadataFromFilename(file.name);

            // Set basic metadata as a fallback
            if (basicMetadata && !file.metadata) {
              file.metadata = basicMetadata;
            }

            // Try to fetch more detailed metadata from online sources
            try {
              const metadata = await fetchMetadata(
                file.name,
                this.settings.preferredMetadataSource,
              );

              if (metadata) {
                // Merge with existing metadata, keeping any existing values
                file.metadata = {
                  ...basicMetadata,
                  ...metadata,
                };
              }
            } catch (metadataError) {
              console.error(
                `Error fetching metadata for ${file.name}:`,
                metadataError,
              );
              // We already have basic metadata as fallback, so just continue
            }
          } catch (error) {
            console.error(
              `Failed to process metadata for ${file.name}:`,
              error,
            );
          }
        }
      }

      // Process subfolders
      for (const subfolder of folder.subfolders) {
        await processFolder(subfolder);
      }
    };

    // Process all folders
    for (const folder of library.folders) {
      await processFolder(folder);
    }
  }

  /**
   * Process basic metadata for media items (from filenames only, no API calls)
   */
  private async processBasicMetadata(library: MediaLibrary): Promise<void> {
    // Count total files for progress tracking
    let totalFiles = 0;
    let processedFiles = 0;

    const countFiles = (folder: MediaFolder): void => {
      totalFiles += folder.files.length;
      folder.subfolders.forEach(countFiles);
    };

    // Count files in all folders
    library.folders.forEach(countFiles);

    // Update scan progress with total files
    this.updateScanProgress({
      totalFiles,
      processedFiles: 0,
    });

    // Process all files in all folders
    const processFolder = async (folder: MediaFolder): Promise<void> => {
      // Process files in this folder
      for (const file of folder.files) {
        try {
          // Update scan progress
          processedFiles++;
          this.updateScanProgress({
            currentFile: file.name,
            processedFiles,
            progress: Math.floor((processedFiles / totalFiles) * 50) + 50, // 50-100% range
          });

          // Skip files that already have metadata
          if (file.metadata) {
            continue;
          }

          // Extract basic metadata from the filename
          const basicMetadata = extractMetadataFromFilename(file.name);

          // Set basic metadata
          if (basicMetadata) {
            file.metadata = basicMetadata;
          } else {
            // If no metadata could be extracted, at least set the title to the filename without extension
            const fileNameWithoutExt = path.basename(
              file.name,
              path.extname(file.name),
            );
            file.metadata = {
              title: fileNameWithoutExt,
            };
          }
        } catch (error) {
          console.error(
            `Failed to process basic metadata for ${file.name}:`,
            error,
          );
        }
      }

      // Process subfolders
      for (const subfolder of folder.subfolders) {
        await processFolder(subfolder);
      }
    };

    // Process all folders
    for (const folder of library.folders) {
      await processFolder(folder);
    }
  }

  /**
   * Get recently added media items
   */
  private getRecentlyAddedMedia(library: MediaLibrary): MediaItem[] {
    const allMedia: MediaItem[] = [];

    const collectMediaItems = (folder: MediaFolder): void => {
      // Add all files from this folder
      allMedia.push(...folder.files);

      // Process subfolders
      folder.subfolders.forEach(collectMediaItems);
    };

    // Collect all media items
    library.folders.forEach(collectMediaItems);

    // Sort by last modified date (newest first)
    return allMedia
      .sort((a, b) => b.lastModified - a.lastModified)
      .slice(0, 20); // Keep only the 20 most recent
  }

  /**
   * Play a media file
   */
  public async playMedia(mediaId: string): Promise<void> {
    try {
      const mediaItem = this.findMediaItemById(mediaId);

      if (!mediaItem) {
        throw new Error(`Media item not found: ${mediaId}`);
      }

      // TODO: Implement media playback using the video player module
      console.log(`Playing media: ${mediaItem.path}`);

      // Update recently watched
      await this.updateRecentlyWatched(mediaItem);
    } catch (error) {
      console.error('Failed to play media:', error);
      throw error;
    }
  }

  /**
   * Update recently watched list
   */
  private async updateRecentlyWatched(mediaItem: MediaItem): Promise<void> {
    try {
      // Remove item if it's already in the list
      this.library.recentlyWatched = this.library.recentlyWatched.filter(
        (item) => item.id !== mediaItem.id,
      );

      // Add item to the beginning of the list
      this.library.recentlyWatched.unshift(mediaItem);

      // Keep only the 20 most recent
      if (this.library.recentlyWatched.length > 20) {
        this.library.recentlyWatched = this.library.recentlyWatched.slice(
          0,
          20,
        );
      }

      // Save library
      await this.saveLibrary();
    } catch (error) {
      console.error('Failed to update recently watched:', error);
      throw error;
    }
  }

  /**
   * Update watch status for a media item
   */
  public async updateWatchStatus(
    mediaId: string,
    watched: boolean,
  ): Promise<void> {
    try {
      const mediaItem = this.findMediaItemById(mediaId);

      if (!mediaItem) {
        throw new Error(`Media item not found: ${mediaId}`);
      }

      // Update watch status
      mediaItem.watched = watched;

      // Update recently watched if marked as watched
      if (watched) {
        await this.updateRecentlyWatched(mediaItem);
      }

      // Save library
      await this.saveLibrary();
    } catch (error) {
      console.error('Failed to update watch status:', error);
      throw error;
    }
  }

  /**
   * Find a media item by ID
   */
  private findMediaItemById(mediaId: string): MediaItem | null {
    const searchInFolder = (folder: MediaFolder): MediaItem | null => {
      // Check files in this folder
      for (const file of folder.files) {
        if (file.id === mediaId) {
          return file;
        }
      }

      // Check subfolders
      for (const subfolder of folder.subfolders) {
        const found = searchInFolder(subfolder);
        if (found) {
          return found;
        }
      }

      return null;
    };

    // Search in all folders
    for (const folder of this.library.folders) {
      const found = searchInFolder(folder);
      if (found) {
        return found;
      }
    }

    return null;
  }
}
