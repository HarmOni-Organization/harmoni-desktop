export interface SyncState {
  time: number;
  isPlaying: boolean;
  lastUpdated: number; // Timestamp for sync validation
  syncErrorMargin: number;
}

export interface RoomInfo {
  name: string;
  description?: string;
  ownerId: string;
  isPrivate: boolean;
  status: string;
  createdAt: number;
  lastActivity: number;
  roomType: string;
}

export interface RoomMember {
  userId: string;
  username: string;
  clientId: string;
  active: boolean;
  role: string;
  typing: boolean;
  lastActivity: number;
}

export interface FileInfo {
  fileId: string;
  userId: string;
  name: string;
  fullTime: number;
  hash: string;
}

export interface ChatMessage {
  messageId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  systemMessage?: boolean;
  replyTo?: string;
  edited?: boolean;
  deleted?: boolean;
}

export interface Room {
  roomId: string;
  roomInfo: RoomInfo;
  syncState: SyncState;
  members: RoomMember[];
  files: FileInfo[];
  chat: ChatMessage[];
}

export interface RoomUpdate {
  roomId: string;
  roomUpdates: Partial<Room>;
  metadata: { action: string; userId: string };
}

export const SyncActions = {
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
};
export const USER_ACTIONS = {
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  SEEK: 'SEEK',
  VOLUME_UPDATE: 'VOLUME_UPDATE',
  ENTER_FULLSCREEN: 'ENTER_FULLSCREEN',
  EXIT_FULLSCREEN: 'EXIT_FULLSCREEN',
  SPEED_UPDATE: 'SPEED_UPDATE',
  AUDIO_DELAY_UPDATE: 'AUDIO_DELAY_UPDATE',
  SUBTITLE_DELAY_UPDATE: 'SUBTITLE_DELAY_UPDATE',
  FILE_UPDATE: 'FILE_UPDATE',
  ASPECT_RATIO_UPDATE: 'ASPECT_RATIO_UPDATE',
  TOGGLE_REPEAT: 'TOGGLE_REPEAT',
  TOGGLE_LOOP: 'TOGGLE_LOOP',
  VIDEO_EFFECT_UPDATE: 'VIDEO_EFFECT_UPDATE',
  AUDIO_FILTER_UPDATE: 'AUDIO_FILTER_UPDATE',
  TOGGLE_RANDOM: 'TOGGLE_RANDOM',
  API_VERSION_UPDATE: 'API_VERSION_UPDATE',
  PLAYLIST_UPDATE: 'PLAYLIST_UPDATE',
  TITLE_OR_CHAPTER_UPDATE: 'TITLE_OR_CHAPTER_UPDATE',
  NO_CHANGE: 'NO_CHANGE',
};

export type PlayerType = 'vlc';

export interface VLCPlayerOptions {
  host: string;
  port: number;
  password: string;
  username: string;
}

export type PlayerOptions = {
  vlc: VLCPlayerOptions;
};
