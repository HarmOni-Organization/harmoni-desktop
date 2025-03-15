export interface MediaFile {
  id: string;
  name: string;
  path: string;
  type: 'video';
  format: string; // mp4, mkv, avi, etc.
  size: number; // in bytes
  lastModified: number; // timestamp
  duration?: number; // in seconds
  resolution?: string; // e.g., "1080p"
  watched: boolean;
  watchProgress?: number; // in seconds
}

export interface MediaMetadata {
  title: string;
  originalTitle?: string;
  synopsis?: string;
  coverImage?: string;
  bannerImage?: string;
  genres?: string[];
  rating?: number;
  releaseDate?: string;
  studio?: string;
  season?: number;
  episode?: number;
  totalEpisodes?: number;
  duration?: number;
  anilistId?: number;
  malId?: number;
  tmdbId?: number;
}

export interface MediaItem extends MediaFile {
  metadata?: MediaMetadata;
}

export interface MediaFolder {
  id: string;
  name: string;
  path: string;
  files: MediaItem[];
  subfolders: MediaFolder[];
}

export interface MediaLibrary {
  folders: MediaFolder[];
  recentlyWatched: MediaItem[];
  recentlyAdded: MediaItem[];
}

export interface LibrarySettings {
  scanOnStartup: boolean;
  autoUpdateMetadata: boolean;
  preferredMetadataSource: 'anilist' | 'mal' | 'tmdb';
  libraryFolders: string[];
  excludedFolders: string[];
  excludedFileTypes: string[];
}

export interface SearchQuery {
  query: string;
  filters?: {
    genre?: string[];
    year?: number | [number, number]; // single year or range
    resolution?: string[];
    watched?: boolean;
    rating?: [number, number]; // min-max rating
  };
  sort?: {
    field: 'title' | 'releaseDate' | 'dateAdded' | 'rating';
    order: 'asc' | 'desc';
  };
}

export interface ScanProgress {
  status: 'idle' | 'scanning' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  currentFile?: string;
  totalFiles?: number;
  processedFiles?: number;
  error?: string;
}
