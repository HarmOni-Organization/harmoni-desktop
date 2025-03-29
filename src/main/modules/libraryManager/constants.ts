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
