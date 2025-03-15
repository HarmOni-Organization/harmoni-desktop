import type { IPlayerState } from '../types';

export interface VideoPlayerController {
  start(onReady?: (...arg: unknown[]) => void): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(timeInSeconds: number): Promise<void>;
  getStatus(): Promise<IPlayerState>;
  quit(): Promise<void>;
  observeStatusChange(
    onChange: (event: unknown) => void,
    onStop: () => void,
    interval?: number,
  ): Promise<void>;
  autoDetectPlayerPath(): Promise<string>;
  loadMedia(filePath: string): Promise<void>;
  checkPlayerRunning(): Promise<boolean>;
}
