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
  }> = [];

  // Maximum size of the command stack
  private readonly maxStackSize = 10;

  constructor(vlcProtocol: VLCProtocol, logger: Logger) {
    this.vlcProtocol = vlcProtocol;
    this.logger = logger;
    this.commandQueue = new AsyncLock();
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
    const index = this.commandStack.findIndex((cmd) => cmd.event === event);

    if (index !== -1) {
      const command = this.commandStack[index];
      // Remove the item from the stack
      this.commandStack.splice(index, 1);
      return command.source;
    }

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
