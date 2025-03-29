export interface MediaFile {
  id: string;
  name: string;
  path: string;
  type: 'video' | 'audio' | 'image';
  format: string; // mp4, mkv, avi, mp3, etc.
  size: number; // in bytes
  lastModified: number; // timestamp
  duration?: number; // in seconds
  resolution?: string; // e.g., "1080p"
  watched: boolean;
  watchProgress?: number; // in seconds
  contentType?: 'movie' | 'tvshow' | 'anime' | 'music';
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
  director?: string;
  cast?: string[];
  season?: number;
  episode?: number;
  totalEpisodes?: number;
  duration?: number;
  anilistId?: number;
  malId?: number;
  tmdbId?: number;
  imdbId?: string;
  musicBrainzId?: string;
  tvmazeId?: number;
  artist?: string;
  album?: string;
  trailer?: string;
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

export interface Collection {
  id: string;
  name: string;
  contentType: 'movie' | 'tvshow' | 'anime' | 'music';
  directories: string[];
  autoScan: boolean;
  scanSchedule?: 'daily' | 'weekly' | 'monthly';
  metadataProvider?: 'tmdb' | 'anilist' | 'mal' | 'imdb' | 'musicbrainz' | 'tvmaze';
  createdAt: number;
  updatedAt: number;
}

export interface UserAnnotation {
  id: string;
  mediaId: string;
  timestamp: number; // Position in media where annotation is placed
  text: string;
  attachments?: {
    type: 'image' | 'gif' | 'link';
    url: string;
  }[];
  createdAt: number;
  updatedAt: number;
  visibility: 'private' | 'public' | 'friends' | 'custom';
  customGroupId?: string;
}

export interface Wishlist {
  id: string;
  title: string;
  mediaType: 'movie' | 'tvshow' | 'anime' | 'music';
  metadata?: Partial<MediaMetadata>;
  addedAt: number;
  priority: 'low' | 'medium' | 'high';
}
