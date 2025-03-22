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

  window.electron.store.set('currentRoom.roomId', room.roomId);
}

export function updateRoomState(
  store: WatchTogetherStore,
  roomUpdates: Partial<Room>,
) {
  // Handle the non-nullish assertion by providing defaults for required room properties
  if (store.currentRoom) {
    // Only update properties that exist in the update
    if (roomUpdates.syncState) {
      store.currentRoom.syncState = {
        ...store.currentRoom.syncState,
        ...roomUpdates.syncState,
      };
    }

    if (roomUpdates.roomInfo) {
      store.currentRoom.roomInfo = {
        ...store.currentRoom.roomInfo,
        ...roomUpdates.roomInfo,
      };
    }

    if (roomUpdates.members) {
      store.currentRoom.members = roomUpdates.members;
    }

    if (roomUpdates.files) {
      store.currentRoom.files = roomUpdates.files;
    }

    if (roomUpdates.chat) {
      store.currentRoom.chat = roomUpdates.chat;
    }
  }

  window.electron.store.set('currentRoom.roomId', store.currentRoom?.roomId);
}

export async function handleRoomUpdates(
  store: WatchTogetherStore,
  { roomUpdates, roomId, metadata, ...rest }: RoomUpdate,
) {
  if (store.currentRoom?.roomId === roomId) {
    const userId = window.electron.store.get('auth.currentUser.userId');

    // Only process events from other users
    if (metadata.userId !== userId) {
      const { action } = metadata;
      const time: number | undefined = roomUpdates.syncState?.time;
      const isPlaying: boolean | undefined = roomUpdates.syncState?.isPlaying;
      const timerKey = `play-${roomId}`;

      // Fall back to finding the user in room members
      const initiatingUser = store.currentRoom.members.find(
        (member) => member.userId === metadata.userId,
      );
      const username = initiatingUser?.username || 'Another user';

      switch (action) {
        case SyncActions.PLAY:
          store.play();
          store.displayMessage(`video played by ${username}`, 3);
          break;

        case SyncActions.PAUSE:
          timerStore.startTimer(timerKey);
          await store.pause();
          store.displayMessage(`video paused by ${username}`, 3);
          timerStore.stopTimer(timerKey);
          break;
        case SyncActions.SEEK:
          if (time !== undefined)
            await store.seek(isPlaying ? time + 0.1 : time);
          store.displayMessage(
            `video jumped to ${time?.toFixed(2)} by ${username}`,
            3,
          );
          break;
        default:
          console.warn('Unknown sync action:', action);
      }
    }

    updateRoomState(store, roomUpdates);
  }
}
