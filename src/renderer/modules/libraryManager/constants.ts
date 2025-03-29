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

export const SUPPORTED_AUDIO_FORMATS = [
  '.mp3',
  '.flac',
  '.wav',
  '.aac',
  '.ogg',
  '.m4a',
  '.wma',
  '.opus',
];

export const SUPPORTED_IMAGE_FORMATS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.tiff',
];

export const CONTENT_TYPES = [
  { id: 'movie', name: 'Movies' },
  { id: 'tvshow', name: 'TV Shows' },
  { id: 'anime', name: 'Anime' },
  { id: 'music', name: 'Music' },
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
  { id: 'anilist', name: 'AniList', contentTypes: ['anime'] },
  { id: 'mal', name: 'MyAnimeList', contentTypes: ['anime'] },
  { id: 'tmdb', name: 'TMDb', contentTypes: ['movie', 'tvshow'] },
  { id: 'imdb', name: 'IMDb', contentTypes: ['movie', 'tvshow'] },
  { id: 'musicbrainz', name: 'MusicBrainz', contentTypes: ['music'] },
  { id: 'tvmaze', name: 'TVmaze', contentTypes: ['tvshow'] },
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
  CREATE_COLLECTION: 'collection:create',
  UPDATE_COLLECTION: 'collection:update',
  DELETE_COLLECTION: 'collection:delete',
  GET_COLLECTIONS: 'collection:get-all',
  GET_COLLECTION: 'collection:get',
  CREATE_ANNOTATION: 'annotation:create',
  UPDATE_ANNOTATION: 'annotation:update',
  DELETE_ANNOTATION: 'annotation:delete',
  GET_ANNOTATIONS: 'annotation:get-all',
  ADD_TO_WISHLIST: 'wishlist:add',
  REMOVE_FROM_WISHLIST: 'wishlist:remove',
  UPDATE_WISHLIST_ITEM: 'wishlist:update',
  GET_WISHLIST: 'wishlist:get',
  FETCH_SUBTITLES: 'subtitles:fetch',
  SET_DEFAULT_SUBTITLE: 'subtitles:set-default',
};

export const SCHEDULE_OPTIONS = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
];

export const MUSIC_GENRES = [
  'Rock',
  'Pop',
  'Hip Hop',
  'R&B',
  'Country',
  'Jazz',
  'Blues',
  'Electronic',
  'Classical',
  'Metal',
  'Folk',
  'Reggae',
];

export const MOVIE_TV_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'Western',
  'Animation',
  'Family',
];
