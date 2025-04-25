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
  let lastCheckTime = Date.now();
  let consecutiveVlcSources = 0;

  const checkStatus = async (): Promise<void> => {
    try {
      if (controller.isReady) {
        const currentTime = Date.now();
        const timeSinceLastCheck = currentTime - lastCheckTime;
        lastCheckTime = currentTime;

        const currentState = await getStatus();
        if (!currentState) {
          onStop();
          return;
        }

        // Use the actual elapsed time for more accurate detection
        const detectedActions = identifyUserActions(
          lastKnownState,
          currentState,
          timeSinceLastCheck,
        );

        if (detectedActions.length > 0) {
          AppLogger.info(
            `Detected changes: ${JSON.stringify(detectedActions)}`,
            {
              context: 'VLCPlayerController',
            },
          );

          let actionSource = 'vlc';
          let foundCommand = false;

          // Log the current command stack for debugging
          AppLogger.info(
            `Current command stack: ${JSON.stringify(controller.commandHandler.commandStack)}`,
            { context: 'VLCPlayerController' },
          );

          for (const action of detectedActions) {
            // Log each detected action
            AppLogger.info(`Processing action: ${action.event}`, {
              context: 'VLCPlayerController',
            });

            // Pop the command from the stack if it exists
            const commandSource = controller.commandHandler.popCommandByEvent(
              action.event,
            );

            if (commandSource) {
              actionSource = commandSource;
              foundCommand = true;
              consecutiveVlcSources = 0; // Reset the counter when we find an app command
              AppLogger.info(
                `Found matching command source: ${commandSource}`,
                { context: 'VLCPlayerController' },
              );
              break;
            }
          }

          // Additional fallback strategies for command detection
          if (!foundCommand) {
            // Check for any recent commands in the last 5 seconds regardless of exact event match
            const now = Date.now();
            const recentAppCommands = controller.commandHandler.commandStack
              .filter(
                (cmd) => cmd.source === 'app' && now - cmd.timestamp < 5000,
              )
              .slice(0, 5);

            if (recentAppCommands.length > 0) {
              // If we have recent app commands, consider the most recent one as the source
              const latestAppCommand = recentAppCommands[0];
              AppLogger.info(
                `Using recent app command as fallback: ${JSON.stringify(latestAppCommand)}`,
                { context: 'VLCPlayerController' },
              );
              actionSource = 'app';
              foundCommand = true;
              consecutiveVlcSources = 0;

              // Remove this command from the stack to avoid reusing it
              const cmdIndex = controller.commandHandler.commandStack.findIndex(
                (c) => c === latestAppCommand,
              );
              if (cmdIndex !== -1) {
                controller.commandHandler.commandStack.splice(cmdIndex, 1);
              }
            }
          }

          // If we still can't find a command source, check if this is a repeating pattern
          if (!foundCommand) {
            // Count consecutive vlc-sourced actions to detect patterns
            consecutiveVlcSources += 1;

            // If we've seen more than 3 consecutive vlc sources and have pending app commands,
            // it's likely that command tracking is off - forcibly use "app" as the source
            if (
              consecutiveVlcSources > 3 &&
              controller.commandHandler.hasPendingAppCommands()
            ) {
              AppLogger.info(
                `Multiple consecutive VLC events detected. Forcing "app" source after ${consecutiveVlcSources} events.`,
                { context: 'VLCPlayerController' },
              );
              actionSource = 'app';
              consecutiveVlcSources = 0;
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
