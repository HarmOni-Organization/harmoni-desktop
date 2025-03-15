/* eslint-disable no-param-reassign */
import timerStore from '@core/stores/TimerStore';
import {
  type Room,
  type RoomUpdate,
  SyncActions,
} from '@modules/watchTogether/types';

import type { WatchTogetherStore } from '../WatchTogetherStore';

export function handleRoomState(store: WatchTogetherStore, room: Room) {
  store.currentRoom = room;
  console.log('handleRoomState', room);

  window.electron.store.set('currentRoom.roomId', room.roomId);
}

export function updateRoomState(
  store: WatchTogetherStore,
  roomUpdates: Partial<Room>,
) {
  store.currentRoom = {
    ...store.currentRoom,
    ...roomUpdates,
    syncState: { ...store.currentRoom?.syncState, ...roomUpdates.syncState },
    roomInfo: { ...store.currentRoom?.roomInfo, ...roomUpdates.roomInfo },
  };
  window.electron.store.set('currentRoom.roomId', store.currentRoom?.roomId);
}

export async function handleRoomUpdates(
  store: WatchTogetherStore,
  { roomUpdates, roomId, metadata }: RoomUpdate,
) {
  if (store.currentRoom?.roomId === roomId) {
    const userId = window.electron.store.get('auth.currentUser.userId');

    if (metadata.userId !== userId) {
      const { action } = metadata;
      const time: number | undefined = roomUpdates.syncState?.time;
      const isPlaying: boolean | undefined = roomUpdates.syncState?.isPlaying;
      const timerKey = `play-${metadata.roomId}`;

      switch (action) {
        case SyncActions.PLAY:
          store.play();
          break;

        case SyncActions.PAUSE:
          timerStore.startTimer(timerKey);
          // if (time !== undefined) store.seek('-0.5');
          await store.pause();

          timerStore.stopTimer(timerKey);
          break;
        case SyncActions.SEEK:
          if (time !== undefined) await store.seek(isPlaying ? time + 1 : time);

          break;
        default:
          console.warn('Unknown sync action:', action);
      }
    }

    updateRoomState(store, roomUpdates);
  }
}
