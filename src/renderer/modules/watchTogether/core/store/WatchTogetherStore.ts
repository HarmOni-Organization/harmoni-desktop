/* eslint-disable class-methods-use-this */
import { makeAutoObservable, reaction } from 'mobx';
import type { Socket } from 'socket.io-client';

import loadingStore from '@core/stores/LoadingStore';
import authStore from '@modules/auth/core/store';
import type {
  PlayerOptions,
  PlayerType,
  Room,
} from '@modules/watchTogether/types';
import SocketInstance from '@services/socketInstance';

import { setupIpcListeners } from './handlers/ipcHandlers';
import { handleRoomState, handleRoomUpdates } from './handlers/roomHandlers';
import { handleSyncState } from './handlers/syncHandlers';

const SYNC_CHECK_INTERVAL_MS = 1000 * 30;
export class WatchTogetherStore {
  currentRoom: Room | null = null;

  videoPlayer: {
    type?: string;
    path?: string;
    port?: string;
    password?: string;
    host?: string;
    username?: string;
  } = {
    host: 'localhost',
    password: 'admin',
  };

  isLoading = false;

  error: string | null = null;

  socket: Socket | null = null;

  syncInterval: NodeJS.Timeout | null = null;

  playerDetails: {
    playerType: PlayerType;
    options: PlayerOptions[PlayerType];
    path: string;
  } | null = null;

  currentSelectedFileName: string | null = null;

  isInitialized = false;

  constructor() {
    makeAutoObservable(this);

    if (authStore.authState.currentUser) {
      this.initialize();
    }
    reaction(
      () => authStore.authState.currentUser,
      (currentUser) => {
        if (currentUser) {
          this.initialize();
        } else {
          this.resetStore();
        }
      },
    );
  }

  private async initialize() {
    if (this.isInitialized) return;

    function generatePort(username) {
      const hash = [...username].reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0,
      );
      return (hash % 64512) + 1024; // Maps to range 1024–65535
    }

    try {
      await loadingStore.waitForModule('AuthStore');
      const currentUser = window.electron.store.get('auth.currentUser');

      if (currentUser) {
        this.videoPlayer.username = currentUser?.username;
        this.videoPlayer.port = `${generatePort(this.videoPlayer.username)}`;
        this.videoPlayer.type = 'vlc';

        this.setupSocketListeners();
        setupIpcListeners(this);
        this.initializeRoom();

        this.isInitialized = true; // Mark as initialized

        this.joinRoom({
          roomId: window.electron.store.get('currentRoom.roomId'),
        });

        this.startSyncCheck();
        console.log('WatchTogetherStore initialized');
      } else {
        console.log(
          'No user logged in, WatchTogetherStore initialization deferred',
        );
      }
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  }

  private resetStore() {
    console.log('Resetting WatchTogetherStore...');

    if (this.socket) {
      SocketInstance.disconnect('watchTogether');
      this.socket = null;
      console.log('Socket disconnected.');
    }

    window.electron.ipcRenderer.removeAllListeners('player-close');
    window.electron.ipcRenderer.removeAllListeners('player-details');
    window.electron.ipcRenderer.removeAllListeners('state-change');

    this.currentRoom = null;
    this.videoPlayer = { host: 'localhost', password: 'admin' };
    this.isInitialized = false;
    this.clearSyncCheck();
  }

  setVideoPlayerType(type: PlayerType) {
    this.videoPlayer.type = type;
  }

  setPlayerPath(path: string) {
    this.videoPlayer.path = path;
  }

  setSelectedMedia(path: string) {
    const roomId = this.currentRoom?.roomId;

    if (!roomId) {
      console.error('No room is currently joined.');
      return;
    }
    this.currentSelectedFileName = path.split('/').pop() || path;

    window.electron.ipcRenderer.invoke('load-media-file', path);
  }

  isPlayerRunning(): boolean {
    try {
      const status = window.electron.ipcRenderer.invoke('check-player-running');
      return !!status;
    } catch (error) {
      console.error('Error checking VLC status:', error);
      return false;
    }
  }

  private initializeRoom() {
    const roomId = window.electron.store.get('currentRoom.roomId');
    console.log('initializeRoom');

    if (roomId) {
      this.joinRoom({ roomId });
    }
  }

  private startSyncCheck() {
    this.clearSyncCheck();
    this.syncInterval = setInterval(() => {
      const roomId = window.electron.store.get('currentRoom.roomId');
      if (roomId) {
        this.socket?.emit('checkSync', { roomId });
      }
    }, SYNC_CHECK_INTERVAL_MS);
  }

  private clearSyncCheck() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private setupSocketListeners() {
    this.socket = SocketInstance.getInstance('watchTogether');

    this.socket?.on('roomState', (room) => handleRoomState(this, room));
    this.socket?.on('syncState', (syncState) =>
      handleSyncState(this, syncState),
    );
    this.socket?.on('roomUpdates', (roomUpdates) =>
      handleRoomUpdates(this, roomUpdates),
    );
    this.socket?.on('error', this.handleError);
  }

  private handleError = (data: { code: string; message: string }) => {
    console.error('Error:', data.message);
    this.error = data.message;
    this.isLoading = false;
  };

  async joinRoom({
    roomId,
    roomName,
    password,
  }: {
    roomId?: string;
    roomName?: string;
    password?: string;
  }) {
    if (!this.isInitialized) {
      console.warn('Store not initialized. Cannot join room.');
      return;
    }

    this.isLoading = true;
    this.error = null;
    try {
      this.socket?.emit('joinRoom', { roomId, roomName, password });
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async createRoom() {
    this.isLoading = true;
    this.error = null;
    try {
      this.socket?.emit('createRoom', {});
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      this.isLoading = false;
    }
  }

  leaveRoom() {
    if (this.currentRoom) {
      this.socket?.emit('leaveRoom', { roomId: this.currentRoom.roomId });
      this.currentRoom = null;
      window.electron.store.set('currentRoom', null);
      this.clearSyncCheck();
    }
  }

  syncState() {
    if (this.currentRoom) {
      this.socket?.emit('checkSync', { roomId: this.currentRoom.roomId });
    }
  }

  // Computed property to get the file name based on selectedUserId
  get fileName(): string | null {
    const userId = window.electron.store.get('auth.currentUser.userId');
    if (!this.currentRoom || !this.currentRoom.files) {
      return null;
    }

    const userFile = this.currentRoom.files.find(
      (file) => file.userId === userId,
    );
    return userFile ? userFile.name : null;
  }

  get status(): string {
    if (!this.fileName || !this.isPlayerRunning()) return 'Idle';
    return this.currentRoom?.syncState.isPlaying ? 'Playing' : 'Paused';
  }

  async play() {
    try {
      await window.electron.ipcRenderer.invoke('play');
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  }

  async pause() {
    try {
      await window.electron.ipcRenderer.invoke('pause');
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  }

  async seek(timeInSeconds: number) {
    try {
      await window.electron.ipcRenderer.invoke('seek', timeInSeconds);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }

  async displayMessage(message: string, duration = 5) {
    try {
      if (!this.isPlayerRunning()) {
        console.warn('Cannot display message: Player is not running');
        return;
      }
      await window.electron.ipcRenderer.invoke(
        'display-message',
        message,
        duration,
      );
    } catch (error) {
      console.error('Error displaying message:', error);
    }
  }

  async getStatus() {
    try {
      const status = await window.electron.ipcRenderer.invoke('get-status');

      return status;
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  /**
   * Observes changes to the specified property and invokes the callback.
   * @param propertyName - The property to observe.
   * @param callback - The callback function to invoke on change.
   */
  observeChanges<T extends keyof WatchTogetherStore>(
    propertyName: T,
    callback: (newValue: WatchTogetherStore[T]) => void,
  ) {
    reaction(
      () => this[propertyName],
      (newValue) => {
        callback(newValue);
      },
    );
  }
}

loadingStore.addModule('WatchTogetherStore');
const watchTogetherStore = new WatchTogetherStore();
export default watchTogetherStore;
