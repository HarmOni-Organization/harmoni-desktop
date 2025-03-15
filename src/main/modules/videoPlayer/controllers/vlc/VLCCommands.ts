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

  public recentCommands: Map<string, { source: string; timestamp: number }> =
    new Map();

  constructor(vlcProtocol: VLCProtocol, logger: Logger) {
    this.vlcProtocol = vlcProtocol;
    this.logger = logger;
    this.commandQueue = new AsyncLock();
  }

  /**
   * Logs executed commands for tracking purposes.
   * @param {string} action - The action being logged.
   * @param {'app' | 'vlc'} source - The source of the command.
   */
  private trackCommand(action: string, source: 'app' | 'vlc'): void {
    this.recentCommands.set(action, { source, timestamp: Date.now() });
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
          this.trackCommand(action, source);
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
