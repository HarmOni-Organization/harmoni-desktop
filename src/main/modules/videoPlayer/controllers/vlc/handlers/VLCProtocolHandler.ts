import { AppLogger } from 'shared/logger';

import type { IPlayerState, UserAction } from '../../../types';
import { identifyUserActions } from '../../../utils/StatusComparison';
import type { VLCPlayerController } from '../VLCPlayerController';

/**
 * Monitors the VLC player state and detects user actions.
 *
 * @param {VLCPlayerController} controller - VLC controller instance.
 * @param {() => Promise<IPlayerState>} getStatus - Function to fetch the current player state.
 * @param {(event: UserAction[], source: string) => void} onStateChange - Callback for detected user actions.
 * @param {() => void} onStop - Callback for stopping monitoring.
 * @param {number} [pollingInterval=2000] - Time interval (ms) between status checks.
 */
export const monitorPlayerStatus = async (
  controller: VLCPlayerController,
  getStatus: () => Promise<IPlayerState>,
  onStateChange: (event: UserAction[], source: string) => void,
  onStop: () => void,
  pollingInterval = 2000,
) => {
  let lastKnownState = await getStatus();

  const checkStatus = async (): Promise<void> => {
    try {
      if (controller.isReady) {
        const currentState = await getStatus();
        if (!currentState) {
          onStop();
          return;
        }

        const detectedActions = identifyUserActions(
          lastKnownState,
          currentState,
          pollingInterval,
        );
        if (detectedActions.length > 0) {
          AppLogger.info(
            `Detected changes: ${JSON.stringify(detectedActions)}`,
            {
              context: 'VLCPlayerController',
            },
          );

          let actionSource = 'vlc';
          for (const action of detectedActions) {
            const recentCommand = controller.commandHandler.recentCommands.get(
              action.event,
            );
            if (
              recentCommand &&
              Date.now() - recentCommand.timestamp < pollingInterval
            ) {
              actionSource = recentCommand.source;
              break;
            }
          }

          onStateChange?.(detectedActions, actionSource);
        }

        lastKnownState = currentState;
      }
      setTimeout(checkStatus, pollingInterval);
    } catch (error) {
      console.error('Error fetching player status:', error);
      onStop();
    }
  };

  checkStatus();
};
