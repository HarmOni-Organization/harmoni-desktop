/* eslint-disable no-param-reassign */
import type { SyncState } from '@modules/watchTogether/types';

import type { WatchTogetherStore } from '../WatchTogetherStore';

async function calculateTimeOffset(cb = () => {}) {
  const clientTime = Date.now();
  await cb();
  const serverTime = Date.now();
  return Math.floor((serverTime - clientTime) / 1000);
}

export async function handleSyncState(
  store: WatchTogetherStore,
  syncState: SyncState,
) {
  if (store.currentRoom) {
    store.currentRoom.syncState = syncState;
  }
  let playerStatus;

  let diffTime = await calculateTimeOffset(async () => {
    playerStatus = await store.getStatus();
  });
  if (!playerStatus) return;
  if (!playerStatus.isPlaying) {
    diffTime = 0;
  }
  const localTime = playerStatus.currentTime + diffTime;
  const serverTime = syncState.time + diffTime;

  // Only show sync message if the time difference is significant (more than 3 seconds)
  const timeDiff = Math.abs(localTime - serverTime);
  if (timeDiff > 1) {
    store.seek(serverTime);

    // Show sync notification for significant changes
    if (timeDiff > 3) {
      store.displayMessage(`Syncing playback to match the room...`, 3);
    }
  }
}
