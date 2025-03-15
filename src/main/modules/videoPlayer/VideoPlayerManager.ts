import type { PlayerOptions, PlayerType } from './controllers/PlayerFactory';
import { PlayerFactory } from './controllers/PlayerFactory';
import type { VideoPlayerController } from './controllers/VideoPlayerController';
import type { IPlayerState } from './types';

export class VideoPlayerManager {
  private currentPlayer: VideoPlayerController | null = null;

  /**
   * Ensures a player is selected before executing any operations.
   * @throws {Error} If no player is selected.
   * @returns {VideoPlayerController} The selected player.
   */
  private ensurePlayerSelected(): VideoPlayerController {
    if (!this.currentPlayer) {
      throw new Error('No player selected');
    }
    return this.currentPlayer;
  }

  /**
   * Sets the current video player to the specified type with the provided options.
   * @param playerType - The type of player to set (e.g., 'vlc').
   * @param options - Configuration options for the player, specific to its type.
   * @throws {Error} If the player type is unsupported.
   */
  setPlayer<T extends PlayerType>(
    playerType: T,
    options: PlayerOptions[T],
  ): void {
    this.currentPlayer = PlayerFactory.createPlayer(playerType, options);
  }

  async start(...arg): Promise<void> {
    const player = this.ensurePlayerSelected();
    await player.start(...arg);
  }

  async play(): Promise<void> {
    const player = this.ensurePlayerSelected();
    await player.play();
  }

  async pause(): Promise<void> {
    const player = this.ensurePlayerSelected();
    await player.pause();
  }

  async stop(): Promise<void> {
    const player = this.ensurePlayerSelected();
    await player.stop();
  }

  async seek(timeInSeconds: number): Promise<void> {
    const player = this.ensurePlayerSelected();
    await player.seek(timeInSeconds);
  }

  async loadMedia(filePath: string): Promise<void> {
    const player = this.ensurePlayerSelected();
    await player.loadMedia(filePath);
  }

  async checkPlayerRunning(): Promise<boolean> {
    const player = this.ensurePlayerSelected();
    return player.checkPlayerRunning();
  }

  async getStatus(): Promise<IPlayerState> {
    const player = this.ensurePlayerSelected();
    return player.getStatus();
  }

  async observeStatusChange(onChange, onStop, interval) {
    const player = this.ensurePlayerSelected();
    return player.observeStatusChange(onChange, onStop, interval);
  }

  async autoDetectPlayerPath(): Promise<string> {
    const player = this.ensurePlayerSelected();
    return player.autoDetectPlayerPath();
  }
}
