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

  if (Math.abs(localTime - serverTime) > 1) {
    store.seek(serverTime);
  }
}
