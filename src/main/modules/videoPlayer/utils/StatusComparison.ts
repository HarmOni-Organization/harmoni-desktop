import { USER_ACTIONS } from '../constants';
import type { IPlayerState, UserAction } from '../types';

/**
 * Detects user actions by comparing the old and new player states.
 *
 * @param {Object} oldState - The previous state of the player.
 * @param {Object} newState - The updated state of the player.
 * @param {number} interval - The time interval between state checks (in ms).
 * @returns {Array} List of detected user actions.
 */
export function identifyUserActions(
  oldState: IPlayerState,
  newState: IPlayerState,
  interval: number,
) {
  const actions: UserAction[] = [];

  if (!oldState || !newState) return [];

  // Ensure a minimum interval to prevent false positives from very quick state checks
  const normalizedInterval = Math.max(interval, 100);

  if (oldState.isPlaying !== newState.isPlaying) {
    actions.push({
      event: newState.isPlaying ? USER_ACTIONS.PLAY : USER_ACTIONS.PAUSE,
      value: {
        isPlaying: newState.isPlaying,
        currentTime: newState.currentTime,
      },
    });
  }

  const timeDifference = Math.abs(oldState.currentTime - newState.currentTime);
  // Calculate expected time advance based on actual time passed and playback state
  const expectedTimeAdvance =
    (normalizedInterval / 1000) * (newState.isPlaying ? 1 : 0);

  // Use a dynamic threshold that scales with the interval
  const seekThreshold = Math.max(0.5, expectedTimeAdvance * 1.5);

  if (timeDifference > expectedTimeAdvance + seekThreshold) {
    actions.push({
      event: USER_ACTIONS.SEEK,
      value: { currentTime: newState.currentTime },
    });
  }

  if (oldState.filename !== newState.filename) {
    actions.push({
      event: USER_ACTIONS.FILE_UPDATE,
      value: {
        filename: newState.filename === 'no-input' ? null : newState.filename,
      },
    });
  }

  if (oldState.loop !== newState.loop) {
    actions.push({
      event: USER_ACTIONS.TOGGLE_LOOP,
      value: { loop: newState.loop },
    });
  }

  if (oldState.repeat !== newState.repeat) {
    actions.push({
      event: USER_ACTIONS.TOGGLE_REPEAT,
      value: { repeat: newState.repeat },
    });
  }

  if (
    oldState.title !== newState.title ||
    oldState.chapter !== newState.chapter
  ) {
    actions.push({
      event: USER_ACTIONS.TITLE_OR_CHAPTER_UPDATE,
      value: { title: newState.title, chapter: newState.chapter },
    });
  }

  return actions.length > 0 ? actions : [];
}
