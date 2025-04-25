import type { Logger } from 'shared/logger';

import type VLCProtocol from './VLCProtocol';
import { USER_ACTIONS } from '../../constants';
import AsyncLock from '../../utils/AsyncLock';

/**
 * Handles sending commands to VLC via the protocol.
 */
export class VLCCommandHandler {
  private vlcProtocol: VLCProtocol;

  private logger: Logger;

  public commandQueue: AsyncLock;

  // Stack of recent commands
  public commandStack: Array<{
    event: string;
    source: string;
    timestamp: number;
  }> = [];

  // Maximum size of the command stack
  private readonly maxStackSize = 20; // Increased from 10 to 20 for better tracking

  constructor(vlcProtocol: VLCProtocol, logger: Logger) {
    this.vlcProtocol = vlcProtocol;
    this.logger = logger;
    this.commandQueue = new AsyncLock();
  }

  /**
   * Checks if there are any pending app commands in the stack
   * @returns {boolean} True if there are app commands in the stack
   */
  public hasPendingAppCommands(): boolean {
    // Check if there are any app commands in the stack
    const appCommands = this.commandStack.filter((cmd) => cmd.source === 'app');
    return appCommands.length > 0;
  }

  /**
   * Pushes a command to the command stack
   * @param {string} action - The action being logged.
   * @param {'app' | 'vlc'} source - The source of the command.
   */
  private pushCommand(action: string, source: 'app' | 'vlc'): void {
    // Push to the stack (add to beginning)
    this.commandStack.unshift({
      event: action,
      source,
      timestamp: Date.now(),
    });

    this.logger.info(`Added command to stack: ${action} from ${source}`, {
      context: 'VLCCommandHandler',
    });

    // Trim the stack if it exceeds the maximum size
    if (this.commandStack.length > this.maxStackSize) {
      this.commandStack.pop();
    }
  }

  /**
   * Finds and removes a command from the stack
   * @param {string} event - The event to look for and remove
   * @returns The source of the command or undefined
   */
  public popCommandByEvent(event: string): string | undefined {
    // First try to find an exact match
    const index = this.commandStack.findIndex((cmd) => cmd.event === event);

    if (index !== -1) {
      const command = this.commandStack[index];
      // Remove the item from the stack
      this.commandStack.splice(index, 1);

      this.logger.info(
        `Popped command from stack: ${event}, source: ${command.source}`,
        {
          context: 'VLCCommandHandler',
        },
      );

      return command.source;
    }

    // If no exact match, check for any recent app commands (within last 3 seconds)
    // This helps on some platforms where the event detection is less reliable
    const now = Date.now();
    const recentAppCommands = this.commandStack.filter(
      (cmd) => cmd.source === 'app' && now - cmd.timestamp < 3000,
    );

    if (recentAppCommands.length > 0) {
      // Check for special cases like PLAY/PAUSE which are often mismatched
      if (
        (event === USER_ACTIONS.PLAY &&
          recentAppCommands.some((cmd) => cmd.event === USER_ACTIONS.PAUSE)) ||
        (event === USER_ACTIONS.PAUSE &&
          recentAppCommands.some((cmd) => cmd.event === USER_ACTIONS.PLAY))
      ) {
        const matchingCmd = recentAppCommands.find(
          (cmd) =>
            cmd.event === USER_ACTIONS.PLAY || cmd.event === USER_ACTIONS.PAUSE,
        );

        if (matchingCmd) {
          const cmdIndex = this.commandStack.findIndex(
            (c) => c === matchingCmd,
          );
          if (cmdIndex !== -1) {
            this.commandStack.splice(cmdIndex, 1);
          }

          this.logger.info(
            `Found related play/pause command in stack, using source: ${matchingCmd.source}`,
            { context: 'VLCCommandHandler' },
          );

          return matchingCmd.source;
        }
      }

      // Handle seek commands which can be slightly different times
      if (
        event === USER_ACTIONS.SEEK &&
        recentAppCommands.some((cmd) => cmd.event === USER_ACTIONS.SEEK)
      ) {
        const seekCmd = recentAppCommands.find(
          (cmd) => cmd.event === USER_ACTIONS.SEEK,
        );

        if (seekCmd) {
          const cmdIndex = this.commandStack.findIndex((c) => c === seekCmd);
          if (cmdIndex !== -1) {
            this.commandStack.splice(cmdIndex, 1);
          }

          this.logger.info(
            `Found recent seek command in stack, using source: ${seekCmd.source}`,
            { context: 'VLCCommandHandler' },
          );

          return seekCmd.source;
        }
      }
    }

    this.logger.info(`No matching command found for event: ${event}`, {
      context: 'VLCCommandHandler',
    });

    return undefined;
  }

  /**
   * Sends a command to VLC asynchronously.
   * @param {Object} params - Command details.
   * @param {string} params.command - The command string.
   * @param {string} [params.action] - Action name for tracking.
   * @param {'app' | 'vlc'} [params.source='app'] - Source of the command.
   */
  public async executeCommand({
    command,
    action,
    source = 'app',
  }: {
    command: string;
    action?: string;
    source?: 'app' | 'vlc';
  }): Promise<void> {
    await this.commandQueue.executeInQueue(async () => {
      try {
        if (action) {
          this.logger.info(
            `Executing command: ${command} from source: ${source}`,
            {
              context: 'VLCCommandHandler',
            },
          );
        }

        this.vlcProtocol.sendCommand(command);
        if (action) {
          this.pushCommand(action, source);
        }
      } catch (error) {
        this.logger.error(
          `Failed to execute VLC command: ${command} - ${(error as Error).message}`,
          {
            context: 'VLCCommandHandler',
          },
        );
      }
    });
  }

  /** Starts playback. */
  public play() {
    return this.executeCommand({
      command: 'set-playstate: playing',
      action: USER_ACTIONS.PLAY,
    });
  }

  /** Pauses playback. */
  public pause() {
    return this.executeCommand({
      command: 'set-playstate: paused',
      action: USER_ACTIONS.PAUSE,
    });
  }

  /**
   * Seeks to a specific time in the media.
   * @param {number} timeInSeconds - Target position in seconds.
   */
  public seek(timeInSeconds: number) {
    return this.executeCommand({
      command: `set-position: ${timeInSeconds}`,
      action: USER_ACTIONS.SEEK,
    });
  }
}
