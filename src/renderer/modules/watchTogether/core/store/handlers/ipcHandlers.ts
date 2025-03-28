/* eslint-disable no-param-reassign */

import { SyncActions, USER_ACTIONS } from '@modules/watchTogether/types';

import type { WatchTogetherStore } from '../WatchTogetherStore';

export function setupIpcListeners(store: WatchTogetherStore) {
  window.electron.ipcRenderer.removeAllListeners('player-close');
  window.electron.ipcRenderer.removeAllListeners('player-details');
  window.electron.ipcRenderer.removeAllListeners('state-change');

  window.electron.ipcRenderer.on('player-close', () => {
    store.socket?.emit('updateFileInfo', {
      roomId: store.currentRoom?.roomId,
      fileInfo: {
        fileId: '',
        name: '',
        fullTime: 0,
        hash: '',
      },
    });
  });

  window.electron.ipcRenderer.on('player-details', (...args: unknown[]) => {
    const [playerDetails] = args as [{ path: string }];

    store.videoPlayer.path = playerDetails?.path || '';
  });

  window.electron.ipcRenderer.on('state-change', (...args: unknown[]) => {
    const [changes, source] = args as [
      {
        event: string;
        isPlaying: boolean;
        value: { currentTime: number; filename: string };
      }[],
      string,
    ];
    if (source === 'app') {
      return;
    }

    changes?.forEach?.((change) => {
      if (!store.currentRoom) return;

      const {
        event,
        isPlaying,
        value: { currentTime, filename },
      } = change;
      const { roomId } = store.currentRoom;
      const { syncState } = store.currentRoom;

      if (event === USER_ACTIONS.SEEK) {
        store.socket?.emit('updateSyncState', {
          roomId,
          action: SyncActions.SEEK,
          value: currentTime,
        });
        store.displayMessage(
          `You Jumped to ${changes[0].value.currentTime?.toFixed(2)}`,
          3,
        );
      } else if (event === USER_ACTIONS.PLAY) {
        store.socket?.emit('updateSyncState', {
          roomId,
          action: SyncActions.PLAY,
        });
        store.displayMessage(`You Played the video`, 3);
      } else if (
        event === USER_ACTIONS.PAUSE &&
        syncState?.isPlaying !== isPlaying
      ) {
        store.socket?.emit('updateSyncState', {
          roomId,
          action: SyncActions.PAUSE,
        });
        store.displayMessage(`You Paused the video`, 3);
      } else if (event === USER_ACTIONS.FILE_UPDATE) {
        store.displayMessage(`File updated`, 3);
        store.socket?.emit('updateFileInfo', {
          roomId,
          fileInfo: {
            fileId: filename,
            name: filename,
            fullTime: 3600,
            hash: filename,
          },
        });
        if (filename) {
          if (syncState?.isPlaying) {
            store.play();
          } else {
            store.pause();
          }

          if (syncState?.time) {
            store.seek(syncState?.time || 0);
          }
        }
      }
    });
  });
}
