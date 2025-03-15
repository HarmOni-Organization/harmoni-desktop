import type { Logger } from 'shared/logger';

import { parseVLCResponse } from './utils';
import type VLCProtocol from './VLCProtocol';
import type { IPlayerState } from '../../types';

/**
 * Manages VLC's player state and handles communication with the VLC protocol.
 */
export class VLCStateManager {
  private playerState: IPlayerState = {
    isPlaying: false,
    currentTime: 0,
    repeat: false,
    loop: false,
    title: '',
    chapter: '',
    filename: '',
    duration: 0,
    filepath: '',
  };

  private logger: Logger;

  private vlcProtocol: VLCProtocol;

  private lastPositionUpdate: number | null = null;

  private statusRequests = new Map<
    string,
    { promise: Promise<void>; resolve: () => void }
  >();

  constructor(logger: Logger, vlcProtocol: VLCProtocol) {
    this.logger = logger;
    this.vlcProtocol = vlcProtocol;
  }

  /**
   * Processes VLC responses and updates the internal state.
   * @param {string} response - The raw response from VLC.
   */
  public handleVLCResponse(response: string) {
    this.logger.debug(`VLC >> ${response}`);
    const parsed = parseVLCResponse(response);
    this.logger.debug(`Parsed VLC Response: ${JSON.stringify(parsed)}`);
    if (!parsed) return;

    const { command, argument } = parsed;

    switch (command) {
      case 'filepath-change-notification':
        this.logger.info('Detected file change in VLC.');
        this.updateFileInfo();
        break;
      case 'filepath':
        this.playerState.filepath =
          argument === 'no-input' ? '' : argument.replace('file://', '');
        this.resolveStatusRequest('filepath');
        break;
      case 'duration':
        this.playerState.duration =
          argument === 'no-input' ? 0 : parseFloat(argument.replace(',', '.'));
        this.resolveStatusRequest('duration');
        break;
      case 'playstate':
        this.playerState.isPlaying = argument === 'playing';
        this.resolveStatusRequest('isPlaying');
        break;
      case 'position':
        this.playerState.currentTime = parseFloat(argument.replace(',', '.'));
        this.lastPositionUpdate = Date.now();
        this.resolveStatusRequest('currentTime');
        break;
      case 'filename':
        this.playerState.filename = argument;
        break;
      case 'vlc-version':
        this.logger.info(`VLC Version: ${argument}`);
        break;
      default:
        this.logger.debug(
          `Unhandled VLC Command: ${command}, Argument: ${argument}`,
        );
    }
  }

  /**
   * Estimates the current playback position based on the last known update.
   * @returns {number} Estimated current playback time in seconds.
   */
  public getEstimatedPosition(): number {
    if (!this.lastPositionUpdate) return this.playerState.currentTime || 0;
    const elapsedTime = (Date.now() - this.lastPositionUpdate) / 1000;

    if (elapsedTime > 1.5 && this.playerState.isPlaying) {
      this.logger.warn(
        `VLC response delay detected. Assuming currentTime: ${this.playerState.currentTime + elapsedTime}`,
      );
      return (this.playerState.currentTime || 0) + elapsedTime;
    }
    return this.playerState.currentTime || 0;
  }

  /**
   * Retrieves the current player state and updates relevant fields.
   * @returns {IPlayerState} The latest player state.
   */
  public getPlayerState(): IPlayerState {
    this.requestFileDetails();
    this.requestPlaybackStatus();
    return JSON.parse(JSON.stringify(this.playerState));
  }

  /**
   * Creates a status request promise and stores it for resolution.
   * @param {string} key - The status key to track.
   * @returns {Promise<void>} A promise that resolves when VLC responds.
   */
  private createStatusRequest(key: string): Promise<void> {
    let resolveFn!: () => void;
    const promise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });
    this.statusRequests.set(key, { promise, resolve: resolveFn });
    return promise;
  }

  /**
   * Handles VLC file change by updating file details.
   */
  private async updateFileInfo() {
    this.logger.info('Updating VLC file details...');

    // Reset status requests to prevent stale data
    this.createStatusRequest('duration');
    this.createStatusRequest('filename');
    this.createStatusRequest('filepath');

    // Request updated file details from VLC
    this.vlcProtocol.sendCommand('get-duration');
    this.vlcProtocol.sendCommand('get-filepath');
    this.vlcProtocol.sendCommand('get-filename');

    // Wait for VLC responses
    await Promise.all([
      this.statusRequests.get('duration')?.promise,
      this.statusRequests.get('filename')?.promise,
      this.statusRequests.get('filepath')?.promise,
    ]);

    // Log updated values
    this.logger.info(
      `Updated File Info - Filename: ${this.playerState.filename}, Duration: ${this.playerState.duration}, Filepath: ${this.playerState.filepath}`,
    );

    // Ensure playback state remains consistent
    this.vlcProtocol.sendCommand(
      this.playerState.isPlaying
        ? 'set-playstate: playing'
        : 'set-playstate: paused',
    );

    this.logger.info('VLC file update handled successfully.');
  }

  /**
   * Sends a request to VLC for file-related information.
   */
  public requestFileDetails() {
    ['get-duration', 'get-filepath', 'get-filename'].forEach((cmd) =>
      this.vlcProtocol.sendCommand(cmd),
    );
  }

  /**
   * Sends a status request to VLC and waits for responses.
   */
  public async requestPlaybackStatus() {
    this.createStatusRequest('currentTime');
    this.createStatusRequest('isPlaying');

    this.vlcProtocol.sendCommand('.');

    await Promise.all([
      this.statusRequests.get('currentTime')?.promise,
      this.statusRequests.get('isPlaying')?.promise,
    ]);
  }

  /**
   * Resolves a pending status request.
   * @param {string} key - The status key to resolve.
   */
  private resolveStatusRequest(key: string) {
    this.statusRequests.get(key)?.resolve();
    this.statusRequests.delete(key);
  }
}
