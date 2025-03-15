export const SUPPORTED_VIDEO_FORMATS = [
  '.mp4',
  '.mkv',
  '.avi',
  '.webm',
  '.mov',
  '.wmv',
  '.flv',
  '.m4v',
  '.mpg',
  '.mpeg',
  '.3gp',
];

export const DEFAULT_LIBRARY_SETTINGS = {
  scanOnStartup: true,
  autoUpdateMetadata: true,
  preferredMetadataSource: 'anilist' as const,
  libraryFolders: [],
  excludedFolders: [],
  excludedFileTypes: [],
};

export const METADATA_SOURCES = [
  { id: 'anilist', name: 'AniList' },
  { id: 'mal', name: 'MyAnimeList' },
  { id: 'tmdb', name: 'TMDb' },
];

export const SORT_OPTIONS = [
  { id: 'title_asc', name: 'Title (A-Z)', field: 'title', order: 'asc' },
  { id: 'title_desc', name: 'Title (Z-A)', field: 'title', order: 'desc' },
  {
    id: 'date_added_desc',
    name: 'Recently Added',
    field: 'dateAdded',
    order: 'desc',
  },
  {
    id: 'date_added_asc',
    name: 'Oldest Added',
    field: 'dateAdded',
    order: 'asc',
  },
  {
    id: 'release_date_desc',
    name: 'Newest First',
    field: 'releaseDate',
    order: 'desc',
  },
  {
    id: 'release_date_asc',
    name: 'Oldest First',
    field: 'releaseDate',
    order: 'asc',
  },
  { id: 'rating_desc', name: 'Highest Rated', field: 'rating', order: 'desc' },
  { id: 'rating_asc', name: 'Lowest Rated', field: 'rating', order: 'asc' },
];

export const RESOLUTION_OPTIONS = [
  { id: '4k', name: '4K (2160p)' },
  { id: '1440p', name: '1440p' },
  { id: '1080p', name: '1080p' },
  { id: '720p', name: '720p' },
  { id: '480p', name: '480p' },
  { id: 'sd', name: 'SD (< 480p)' },
];

export const COMMON_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Thriller',
];

// IPC Channels
export const IPC_CHANNELS = {
  SCAN_LIBRARY: 'library:scan',
  SCAN_PROGRESS: 'library:scan-progress',
  SCAN_COMPLETE: 'library:scan-complete',
  SCAN_ERROR: 'library:scan-error',
  SELECT_FOLDER: 'library:select-folder',
  GET_LIBRARY: 'library:get',
  UPDATE_LIBRARY: 'library:update',
  GET_SETTINGS: 'library:get-settings',
  UPDATE_SETTINGS: 'library:update-settings',
  PLAY_MEDIA: 'library:play-media',
  UPDATE_WATCH_STATUS: 'library:update-watch-status',
  FETCH_METADATA: 'library:fetch-metadata',
};
