import { showToast } from '@components/Toaster';
import type { Command } from '@core/commands';
import { UICommandUtils } from '@utils/UICommandUtils';

import { WatchTogetherIDs, WatchTogetherMessages } from './constants';

const watchTogetherCommands: Record<string, Command> = {
  watch_together: {
    join: {
      category: 'WatchTogether',
      usage: '/watchtogether join -r <roomId>',
      description: 'Join an existing watch together session.',
      flags: [{ name: '-r', description: 'Room ID', requiresValue: true }],
      execute: async ({ r: roomId }) => {
        // Validate room ID
        if (!roomId || roomId.trim() === '') {
          showToast(WatchTogetherMessages.INVALID_ARGS, 'error');
          console.error('Join command failed: Room ID is required');
          return;
        }

        try {
          await UICommandUtils.executeSequentially(
            [
              // Step 1: Navigate to Watch Together section
              () =>
                UICommandUtils.hoverAndClick('watch-together-section', {
                  customErrorMessage: WatchTogetherMessages.CLICK_SECTION_ERROR,
                  elementType: 'div',
                }),

              // Step 2: Verify Join/Invite section is present
              () =>
                UICommandUtils.getElementById(
                  WatchTogetherIDs.JOIN_AND_INVITE_SECTION,
                  'div',
                  {
                    customErrorMessage:
                      WatchTogetherMessages.MISSING_JOIN_INVITE_SECTION,
                  },
                ),

              // Step 3: Enter the provided room ID
              () =>
                UICommandUtils.typeIntoInput(
                  WatchTogetherIDs.JOIN_ROOM_INPUT,
                  roomId,
                  {
                    elementType: 'div',
                    skipFocusAction: true,
                    customErrorMessage: WatchTogetherMessages.ROOM_INPUT_ERROR,
                  },
                ),

              // Step 4: Click the Join button
              () =>
                UICommandUtils.hoverAndClick(WatchTogetherIDs.JOIN_BUTTON, {
                  customErrorMessage: WatchTogetherMessages.JOIN_BUTTON_ERROR,
                }),
            ],
            {
              delayBetweenCommands: 100, // Small delay between steps for better UI feedback
              stopOnError: true,
              onError: (error) => {
                const errorMessage = `Failed to join Watch Together session: ${(error as Error).message}`;
                console.error(errorMessage);
                showToast(errorMessage, 'error');
              },
              onAllSuccess: () => {
                const successMessage = `${WatchTogetherMessages.JOIN_SUCCESS} Room: ${roomId}`;
                console.log(successMessage);
                showToast(successMessage, 'success');
              },
              blockUI: true,
            },
          );
        } catch (error) {
          const errorMessage = `An unexpected error occurred when joining session: ${(error as Error).message}`;
          console.error(errorMessage);
          showToast(errorMessage, 'error');
        }
      },
    },
    create: {
      category: 'WatchTogether',
      usage: '/watchtogether create',
      description: 'Create a new watch together session.',
      flags: [],
      execute: async () => {
        try {
          // Check if already in a session by looking for the leave button
          const alreadyInSession =
            document.getElementById(WatchTogetherIDs.LEAVE_BUTTON) !== null;
          if (alreadyInSession) {
            const errorMessage =
              'You are already in a Watch Together session. Please leave the current session before creating a new one.';
            console.error(errorMessage);
            showToast(errorMessage, 'error');
            return;
          }

          await UICommandUtils.executeSequentially(
            [
              // Step 1: Navigate to Watch Together section
              () =>
                UICommandUtils.hoverAndClick('watch-together-section', {
                  customErrorMessage: WatchTogetherMessages.CLICK_SECTION_ERROR,
                  elementType: 'div',
                }),

              // Step 2: Verify Join/Invite section is present
              () =>
                UICommandUtils.getElementById(
                  WatchTogetherIDs.JOIN_AND_INVITE_SECTION,
                  'div',
                  {
                    customErrorMessage:
                      WatchTogetherMessages.MISSING_JOIN_INVITE_SECTION,
                  },
                ),

              // Step 3: Click the Create Room button
              () => {
                console.log(
                  `Attempting to click create room button (${WatchTogetherIDs.CREATE_ROOM_BUTTON})`,
                );
                const createButton = document.getElementById(
                  WatchTogetherIDs.CREATE_ROOM_BUTTON,
                );

                // Log available buttons for debugging if needed
                if (!createButton) {
                  console.log(
                    'Available buttons:',
                    Array.from(document.querySelectorAll('button'))
                      .map(
                        (el) =>
                          `${el.id || 'unnamed-button'}: ${el.textContent?.trim()}`,
                      )
                      .join(', '),
                  );
                  throw new Error(
                    `Create room button with ID "${WatchTogetherIDs.CREATE_ROOM_BUTTON}" not found`,
                  );
                }

                // Directly click the button
                createButton.click();
                return createButton;
              },
            ],
            {
              delayBetweenCommands: 300, // Increase delay for better reliability
              stopOnError: true,
              onError: (error) => {
                const errorMessage = `Failed to create Watch Together session: ${(error as Error).message}`;
                console.error(errorMessage);
                showToast(errorMessage, 'error');
              },
              onAllSuccess: () => {
                console.log(WatchTogetherMessages.START_SUCCESS);
                showToast(WatchTogetherMessages.START_SUCCESS, 'success');
              },
              blockUI: true,
            },
          );
        } catch (error) {
          const errorMessage = `An unexpected error occurred when creating session: ${(error as Error).message}`;
          console.error(errorMessage);
          showToast(errorMessage, 'error');
        }
      },
    },
    start: {
      category: 'WatchTogether',
      usage: '/watchtogether start',
      description: 'Start a Watch Together session from the action section.',
      flags: [],
      execute: async () => {
        console.log('Starting a Watch Together session');

        try {
          await UICommandUtils.executeSequentially(
            [
              // Step 1: Navigate to Watch Together section
              () =>
                UICommandUtils.hoverAndClick('watch-together-section', {
                  customErrorMessage: WatchTogetherMessages.CLICK_SECTION_ERROR,
                  elementType: 'div',
                }),

              // Step 2: Verify Action section is present
              () => {
                const actionSection = document.getElementById(
                  WatchTogetherIDs.ACTION_SECTION,
                );
                if (!actionSection) {
                  throw new Error(
                    `Action section with ID "${WatchTogetherIDs.ACTION_SECTION}" not found. Current visible sections: ${Array.from(
                      document.querySelectorAll('div[id]'),
                    )
                      .map((el) => el.id)
                      .join(', ')}`,
                  );
                }
                return actionSection;
              },

              // Step 3: Click the Start button
              () => {
                console.log(
                  `Attempting to click start button (${WatchTogetherIDs.START_BUTTON})`,
                );
                const startButton = document.getElementById(
                  WatchTogetherIDs.START_BUTTON,
                );

                // Log available buttons for debugging if needed
                if (!startButton) {
                  console.log(
                    'Available buttons:',
                    Array.from(document.querySelectorAll('button'))
                      .map(
                        (el) =>
                          `${el.id || 'unnamed-button'}: ${el.textContent?.trim()}`,
                      )
                      .join(', '),
                  );
                  throw new Error(
                    `Start button with ID "${WatchTogetherIDs.START_BUTTON}" not found`,
                  );
                }

                // Ensure the button is visible and clickable
                if (window.getComputedStyle(startButton).display === 'none') {
                  throw new Error('Start button exists but is not visible');
                }

                // Directly click the button
                console.log('Clicking start button directly');
                startButton.click();
                return startButton;
              },
            ],
            {
              delayBetweenCommands: 300, // Increase delay for better reliability
              stopOnError: true,
              onError: (error) => {
                const errorMessage = `Failed to start Watch Together session: ${(error as Error).message}`;
                console.error(errorMessage);
                showToast(errorMessage, 'error');
              },
              onAllSuccess: () => {
                console.log(WatchTogetherMessages.START_SUCCESS);
                showToast(WatchTogetherMessages.START_SUCCESS, 'success');
              },
              blockUI: true,
            },
          );
        } catch (error) {
          const errorMessage = `An unexpected error occurred when starting session: ${(error as Error).message}`;
          console.error(errorMessage);
          showToast(errorMessage, 'error');
        }
      },
    },
    leave: {
      category: 'WatchTogether',
      usage: '/watchtogether leave',
      description: 'Leave the current watch together session.',
      flags: [],
      execute: async () => {
        console.log('Attempting to leave Watch Together session');

        try {
          // Check if currently in a session by looking for the joined room section
          const joinedRoomSection = document.getElementById(
            WatchTogetherIDs.JOINED_ROOM_SECTION,
          );
          const leaveButton = document.getElementById(
            WatchTogetherIDs.LEAVE_BUTTON,
          );

          // Log element existence for debugging
          console.log(`Room section exists: ${!!joinedRoomSection}`);
          console.log(`Leave button exists: ${!!leaveButton}`);

          if (leaveButton) {
            console.log(`Leave button ID: ${leaveButton.id}`);
            console.log(
              `Leave button visibility: ${window.getComputedStyle(leaveButton).display !== 'none'}`,
            );
          }

          if (!joinedRoomSection || !leaveButton) {
            const errorMessage =
              'You are not currently in a Watch Together session.';
            console.error(errorMessage);
            showToast(errorMessage, 'error');
            return;
          }

          // Direct click as fallback method
          const directClick = () => {
            console.log('Attempting direct click on leave button');
            try {
              if (leaveButton && typeof leaveButton.click === 'function') {
                leaveButton.click();
                return true;
              }
            } catch (clickError) {
              console.error(
                `Direct click error: ${(clickError as Error).message}`,
              );
            }
            return false;
          };

          await UICommandUtils.executeSequentially(
            [
              // Step 1: Navigate to Watch Together section
              () =>
                UICommandUtils.hoverAndClick('watch-together-section', {
                  customErrorMessage: WatchTogetherMessages.CLICK_SECTION_ERROR,
                  elementType: 'div',
                }),

              // Step 2: Verify we're in a joined room section with more detailed error
              () => {
                const sectionElement = document.getElementById(
                  WatchTogetherIDs.JOINED_ROOM_SECTION,
                );
                if (!sectionElement) {
                  throw new Error(
                    `Joined room section with ID "${WatchTogetherIDs.JOINED_ROOM_SECTION}" not found. Current visible sections: ${Array.from(
                      document.querySelectorAll('div[id]'),
                    )
                      .map((el) => el.id)
                      .join(', ')}`,
                  );
                }
                return sectionElement;
              },

              // Step 3: Try alternative approach to click the Leave button
              () => {
                const btn = document.getElementById(
                  WatchTogetherIDs.LEAVE_BUTTON,
                );
                if (!btn) {
                  throw new Error(
                    `Leave button with ID "${WatchTogetherIDs.LEAVE_BUTTON}" not found. Available buttons: ${Array.from(
                      document.querySelectorAll('button'),
                    )
                      .map((el) => el.id || 'unnamed-button')
                      .join(', ')}`,
                  );
                }

                // Ensure the button is visible and clickable
                if (window.getComputedStyle(btn).display === 'none') {
                  throw new Error('Leave button exists but is not visible');
                }

                console.log('Clicking leave button directly');
                btn.click();
                return btn;
              },
            ],
            {
              delayBetweenCommands: 300, // Increase delay for better reliability
              stopOnError: true,
              onError: (error) => {
                const errorMessage = `Failed to leave Watch Together session: ${(error as Error).message}`;
                console.error(errorMessage);

                // Try direct click as fallback
                if (directClick()) {
                  console.log(
                    'Successfully left session using fallback method',
                  );
                  showToast(WatchTogetherMessages.LEAVE_SUCCESS, 'success');
                } else {
                  showToast(errorMessage, 'error');
                }
              },
              onAllSuccess: () => {
                console.log(WatchTogetherMessages.LEAVE_SUCCESS);
                showToast(WatchTogetherMessages.LEAVE_SUCCESS, 'success');
              },
              blockUI: true,
            },
          );
        } catch (error) {
          const errorMessage = `An unexpected error occurred when leaving session: ${(error as Error).message}`;
          console.error(errorMessage);
          showToast(errorMessage, 'error');
        }
      },
    },
  },
};

export default watchTogetherCommands;
