import type { VideoPlayerController } from './VideoPlayerController';
import { VLCPlayerController } from './vlc/VLCPlayerController';

// Define a union of supported player types with specific options
export type PlayerType = 'vlc';

export interface VLCPlayerOptions {
  host: string;
  port: number;
  password: string;
  username: string;
}

export type PlayerOptions = {
  vlc: VLCPlayerOptions;
};

export class PlayerFactory {
  /**
   * Creates a new player instance based on the specified type and options.
   * @param playerType - The type of player to create (e.g., 'vlc').
   * @param options - Configuration options for the player.
   * @throws {Error} If the player type is unsupported.
   */
  static createPlayer<T extends PlayerType>(
    playerType: T,
    options: PlayerOptions[T],
  ): VideoPlayerController {
    switch (playerType) {
      case 'vlc':
        return new VLCPlayerController(
          options.host,
          options.port,
          options.password,
          undefined,
        );
      default:
        throw new Error(`Unsupported player type: ${playerType}`);
    }
  }
}
