// Represents the state of a room, including sync and room information
export interface RoomState {
  roomInfo: {
    roomId?: string;
    roomName: string;
    ownerId: string;
    isArchived: boolean;
    createdAt: string;
    passwordProtected?: boolean;
    roomPassword?: string;
  };
  syncInfo: {
    time: number;
    isPlaying: boolean;
    syncErrorMargin: number;
  };
}

export interface FileInfo {
  fileHash: string;
  fileSize: number;
  videoId: string;
  title: string;
  duration: number;
}

export interface UserInfo {
  userId: string;
  username: string;
  isHost: boolean;
  isTyping: boolean;
  isOnline?: boolean;
  fileInfo: FileInfo;
}

export interface JoinRoomPayload {
  roomId?: string;
  username: string;
  roomPassword?: string;
}

export interface SyncUpdatePayload {
  roomId: string;
  time: number;
  isPlaying: boolean;
}

export interface UserTypingPayload {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

export interface UpdateFileInfoPayload {
  roomId: string;
  fileInfo: FileInfo;
}

export interface ChatMessagePayload {
  message: string;
  userId?: string;
  username?: string;
}

export interface BroadcastRoomStatePayload {
  roomId: string;
  roomState: RoomState;
  users: UserInfo[];
}
