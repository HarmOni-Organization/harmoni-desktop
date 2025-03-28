/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Logger } from 'shared/logger';

import { launchVLC } from './handlers/VLCProcessHandler';
import type VLCProtocol from './VLCProtocol';

/**
 * Manages the lifecycle of a VLC process.
 */
export class VLCProcessManager {
  private vlcProtocol: VLCProtocol;

  private logger: Logger;

  private vlcPort: number;

  private mediaFilePath?: string;

  public isShuttingDown = false;

  public vlcProcess: any;

  constructor(
    vlcProtocol: VLCProtocol,
    logger: Logger,
    vlcPort: number,
    mediaFilePath?: string,
  ) {
    this.vlcProtocol = vlcProtocol;
    this.logger = logger;
    this.vlcPort = vlcPort;
    this.mediaFilePath = mediaFilePath;
  }

  /**
   * Launches the VLC process and waits for it to be ready.
   * @param {(...args: unknown[]) => void} [onReady] - Callback triggered when VLC is ready.
   */
  public startVLC(onReady?: (...args: unknown[]) => void) {
    this.vlcProcess = launchVLC(this.vlcPort, this.mediaFilePath);
    this.logger.info(`Starting VLC...`);

    const handleVLCOutput = (data: Buffer) => {
      const output = data.toString();
      this.logger.info(`[VLC] ${output}`);

      if (output.includes('Hosting Syncplay interface on port')) {
        this.vlcProcess.stdout.removeListener('data', handleVLCOutput);
        this.logger.info('VLC is ready, establishing connection...');

        this.vlcProtocol.on('connected', (...args) => {
          onReady?.(...args);
        });

        this.vlcProtocol.connect();
      }
    };

    this.vlcProcess.stdout.on('data', handleVLCOutput);
    this.vlcProcess.stderr.on('data', handleVLCOutput);
    this.vlcProcess.on('exit', () => this.shutdown());
  }

  /**
   * Terminates the VLC process and disconnects the protocol.
   */
  public shutdown() {
    if (this.vlcProcess) {
      this.logger.info('Shutting down VLC process...');
      this.vlcProcess.kill();
      this.vlcProcess = null;
    }
    this.isShuttingDown = true;
    this.vlcProtocol.disconnect();
    this.logger.info('VLC connection closed.');
  }
}
