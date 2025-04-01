/* eslint-disable simple-import-sort/imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Logger } from 'shared/logger';
import path from 'path';
import fs from 'fs';

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

    // Set a timeout for VLC to start up properly
    const connectionTimeout = setTimeout(() => {
      this.logger.warn(
        'VLC connection timeout. Interface may not be loaded properly.',
      );

      // Check if the script exists
      const homeDir = process.env.HOME || process.env.USERPROFILE;
      let luaIntfDir;

      if (process.platform === 'win32') {
        luaIntfDir = path.join(
          homeDir!,
          'AppData',
          'Roaming',
          'vlc',
          'lua',
          'intf',
        );
      } else if (process.platform === 'darwin') {
        luaIntfDir = path.join(
          homeDir!,
          'Library',
          'Application Support',
          'org.videolan.vlc',
          'lua',
          'intf',
        );
      } else {
        luaIntfDir = path.join(
          homeDir!,
          '.local',
          'share',
          'vlc',
          'lua',
          'intf',
        );
      }

      const luaDestPath = path.join(luaIntfDir, 'syncplay.lua');
      const scriptExists = fs.existsSync(luaDestPath);

      if (!scriptExists) {
        this.logger.error(
          `Syncplay Lua script not found at: ${luaDestPath}. Please restart the application.`,
        );
        this.shutdown();
      } else {
        // Try to connect anyway - script exists but might not be loaded correctly
        this.vlcProtocol.connect();
      }
    }, 5000); // 5 second timeout

    const handleVLCOutput = (data: Buffer) => {
      const output = data.toString();
      this.logger.info(`[VLC] ${output}`);

      if (
        output.includes('Hosting Syncplay interface on port') ||
        output.includes('syncplay interface initialized')
      ) {
        clearTimeout(connectionTimeout);
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
    this.vlcProcess.on('exit', () => {
      clearTimeout(connectionTimeout);
      this.shutdown();
    });
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
