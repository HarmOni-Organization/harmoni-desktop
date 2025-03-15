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
        if (!roomId) {
          showToast(WatchTogetherMessages.INVALID_ARGS, 'error');
          return;
        }
        console.log(`Joining session: Room="${roomId}"`);

        try {
          await UICommandUtils.executeSequentially(
            [
              () =>
                UICommandUtils.hoverAndClick('watch-together-section', {
                  customErrorMessage: WatchTogetherMessages.CLICK_SECTION_ERROR,
                  elementType: 'div',
                }),
              () =>
                UICommandUtils.getElementById(
                  WatchTogetherIDs.JOIN_AND_INVITE_SECTION,
                  'div',
                  {
                    customErrorMessage:
                      WatchTogetherMessages.MISSING_JOIN_INVITE_SECTION,
                  },
                ),
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
              () =>
                UICommandUtils.hoverAndClick(WatchTogetherIDs.JOIN_BUTTON, {
                  customErrorMessage: WatchTogetherMessages.JOIN_BUTTON_ERROR,
                }),
            ],
            {
              delayBetweenCommands: 0,
              stopOnError: true,
              onError: (error) => {
                showToast(`Error: ${(error as Error).message}`, 'error');
              },
              onAllSuccess: () => {
                console.log(WatchTogetherMessages.JOIN_SUCCESS);
                showToast(WatchTogetherMessages.JOIN_SUCCESS, 'success');
              },
              blockUI: true,
            },
          );
        } catch (error) {
          console.error(`Failed to join session: ${(error as Error).message}`);
        }
      },
    },
    create: {
      category: 'WatchTogether',
      usage: '/watchtogether join -r <roomId>',
      description: 'Join an existing watch together session.',
      flags: [{ name: '-r', description: 'Room ID', requiresValue: true }],
      execute: async ({ r: roomId }) => {
        if (!roomId) {
          showToast(WatchTogetherMessages.INVALID_ARGS, 'error');
          return;
        }
        console.log(`Joining session: Room="${roomId}"`);

        try {
          await UICommandUtils.executeSequentially(
            [
              () =>
                UICommandUtils.hoverAndClick('watch-together-section', {
                  customErrorMessage: WatchTogetherMessages.CLICK_SECTION_ERROR,
                  elementType: 'div',
                }),
              () =>
                UICommandUtils.getElementById(
                  WatchTogetherIDs.JOIN_AND_INVITE_SECTION,
                  'div',
                  {
                    customErrorMessage:
                      WatchTogetherMessages.MISSING_JOIN_INVITE_SECTION,
                  },
                ),
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
              () =>
                UICommandUtils.hoverAndClick(WatchTogetherIDs.JOIN_BUTTON, {
                  customErrorMessage: WatchTogetherMessages.JOIN_BUTTON_ERROR,
                }),
            ],
            {
              delayBetweenCommands: 0,
              stopOnError: true,
              onError: (error) => {
                showToast(`Error: ${(error as Error).message}`, 'error');
              },
              onAllSuccess: () => {
                console.log(WatchTogetherMessages.JOIN_SUCCESS);
                showToast(WatchTogetherMessages.JOIN_SUCCESS, 'success');
              },
              blockUI: true,
            },
          );
        } catch (error) {
          console.error(`Failed to join session: ${(error as Error).message}`);
        }
      },
    },
  },
};

export default watchTogetherCommands;
