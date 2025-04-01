import { execSync } from 'child_process';
import { app } from 'electron';
import * as fs from 'fs';
import path from 'path';
import type { Logger } from 'shared/logger';

import { initializeLogger } from './handlers/LoggerHandler';
import { monitorPlayerStatus } from './handlers/VLCProtocolHandler';
import { getRandomPort, getValidVLCPath } from './utils';
import { VLCCommandHandler } from './VLCCommands';
import {
  VLC_EXECUTABLE_PATHS,
  VLC_LUA_SCRIPT_PATH,
  VLC_PORT_RANGE,
} from './VLCConfig';
import { VLCProcessManager } from './VLCProcessManager';
import VLCProtocol from './VLCProtocol';
import { VLCStateManager } from './VLCStateManager';
import type { IPlayerState, UserAction } from '../../types';
import type { VideoPlayerController } from '../VideoPlayerController';

/**
 * Controls the VLC player instance, managing state, commands, and connection.
 */
export class VLCPlayerController implements VideoPlayerController {
  private logger: Logger;

  private vlcPort: number;

  private vlcProtocol: VLCProtocol;

  private mediaFilePath?: string = '';

  public isReady = false;

  public commandHandler: VLCCommandHandler;

  private processManager: VLCProcessManager;

  private stateManager: VLCStateManager;

  constructor(
    private vlcHost: string,
    private vlcPortInput: number,
    private password: string,
    private username?: string,
  ) {
    this.logger = initializeLogger('VLCPlayerController');

    const vlcExecutable = getValidVLCPath(VLC_EXECUTABLE_PATHS);
    if (!vlcExecutable) throw new Error('No valid VLC executable found.');

    // Determine the correct VLC Lua interface directory
    const getVlcLuaIntfPath = (): string => {
      const homeDir = process.env.HOME || process.env.USERPROFILE; // Cross-platform

      if (process.platform === 'win32') {
        return path.join(homeDir!, 'AppData', 'Roaming', 'vlc', 'lua', 'intf');
      }
      if (process.platform === 'darwin') {
        return path.join(
          homeDir!,
          'Library',
          'Application Support',
          'org.videolan.vlc',
          'lua',
          'intf',
        );
      }
      return path.join(homeDir!, '.local', 'share', 'vlc', 'lua', 'intf');
    };

    const VLC_LUA_INTF_DIR = getVlcLuaIntfPath();
    const VLC_LUA_DEST_PATH = path.join(VLC_LUA_INTF_DIR, 'syncplay.lua');

    // Ensure the destination directory exists
    if (!fs.existsSync(VLC_LUA_INTF_DIR)) {
      try {
        fs.mkdirSync(VLC_LUA_INTF_DIR, { recursive: true });
        this.logger.info(
          `Created VLC lua interface directory: ${VLC_LUA_INTF_DIR}`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to create VLC lua directory: ${(err as Error).message}`,
        );
        throw new Error(
          `Failed to create VLC lua directory: ${(err as Error).message}`,
        );
      }
    }

    // Copy the Lua script if it's missing
    if (!fs.existsSync(VLC_LUA_DEST_PATH)) {
      try {
        if (!fs.existsSync(VLC_LUA_SCRIPT_PATH)) {
          // In packaged app, try alternative locations
          const resourcePath = app.isPackaged
            ? path.join(process.resourcesPath, 'syncplay.lua')
            : VLC_LUA_SCRIPT_PATH;

          if (fs.existsSync(resourcePath)) {
            fs.copyFileSync(resourcePath, VLC_LUA_DEST_PATH);
            this.logger.info(
              `Copied syncplay.lua from resources to VLC interface directory: ${VLC_LUA_DEST_PATH}`,
            );
          } else {
            throw new Error(
              `Lua script not found at: ${VLC_LUA_SCRIPT_PATH} or ${resourcePath}`,
            );
          }
        } else {
          fs.copyFileSync(VLC_LUA_SCRIPT_PATH, VLC_LUA_DEST_PATH);
          this.logger.info(
            `Copied syncplay.lua to VLC interface directory: ${VLC_LUA_DEST_PATH}`,
          );
        }
      } catch (err) {
        this.logger.error(
          `Failed to copy Lua script: ${(err as Error).message}`,
        );
        throw new Error(`Failed to copy Lua script: ${(err as Error).message}`);
      }
    } else {
      this.logger.info(`Lua script already exists at: ${VLC_LUA_DEST_PATH}`);
    }

    this.vlcPort = getRandomPort(VLC_PORT_RANGE.MIN, VLC_PORT_RANGE.MAX);
    this.vlcProtocol = new VLCProtocol(this.vlcPort);

    this.setupProtocolListeners();

    this.processManager = new VLCProcessManager(
      this.vlcProtocol,
      this.logger,
      this.vlcPort,
    );
    this.commandHandler = new VLCCommandHandler(this.vlcProtocol, this.logger);
    this.stateManager = new VLCStateManager(this.logger, this.vlcProtocol);

    global.mainWindow.on('close', () => this.processManager.shutdown());
  }

  /**
   * Sets up event listeners for the VLC protocol.
   */
  private setupProtocolListeners() {
    this.vlcProtocol.on('lineReceived', (line) =>
      this.stateManager.handleVLCResponse(line),
    );
    this.vlcProtocol.on('connected', () => {
      this.processManager.isShuttingDown = false;
      this.isReady = true;
      setTimeout(() => {
        this.displayMessage('Connected to VLC.', 10);
      }, 500);
      this.logger.info('Connected to VLC.');
    });
    this.vlcProtocol.on('disconnected', () => this.handleDisconnection());
    this.vlcProtocol.on('error', (err) =>
      this.logger.error(`VLC Protocol Error: ${err.message}`),
    );
  }

  public play() {
    return this.commandHandler.play();
  }

  public pause() {
    return this.commandHandler.pause();
  }

  public seek(timeInSeconds: number) {
    return this.commandHandler.seek(timeInSeconds);
  }

  /**
   * Displays a message on VLC's OSD.
   * @param {string} message - The message to display.
   * @param {number} [duration=5] - Display duration in seconds.
   */
  public displayMessage(message: string, duration = 5) {
    this.commandHandler.executeCommand({
      command: `display-osd: top-left, ${duration}, ${message}`,
    });
  }

  public async start(onReady?: (...args: unknown[]) => void): Promise<void> {
    await this.commandHandler.commandQueue.executeInQueue(async () => {
      this.logger.info(
        `Starting VLC with mediaFilePath: ${this.mediaFilePath}`,
      );
      await this.processManager.startVLC(onReady);
      if (this.mediaFilePath) {
        this.logger.info(`Loading media file: ${this.mediaFilePath}`);
        setTimeout(() => {
          this.vlcProtocol.sendCommand(`load-file: ${this.mediaFilePath}`);
        }, 1000);
      }
    });
  }

  public async stop(): Promise<void> {
    this.processManager.shutdown();
  }

  public async quit(): Promise<void> {
    this.processManager.shutdown();
  }

  public async autoDetectPlayerPath(): Promise<string> {
    console.log('VLC Port:', this.vlcPort);
    return getValidVLCPath(VLC_EXECUTABLE_PATHS) || '';
  }

  public async getStatus(): Promise<IPlayerState> {
    return this.stateManager.getPlayerState();
  }

  public async observeStatusChange(
    onChange: (event: UserAction[], source: string) => void,
    onStop: () => void,
    pollingInterval = 2000,
  ): Promise<void> {
    monitorPlayerStatus(
      this,
      () => this.getStatus(),
      onChange,
      onStop,
      pollingInterval,
    );
  }

  public async loadMedia(filePath: string): Promise<void> {
    this.mediaFilePath = filePath;
    // Future implementation: this.start();
    this.vlcProtocol.sendCommand(`load-file: ${filePath}`);
  }

  public async checkPlayerRunning(): Promise<boolean> {
    return this.processManager.vlcProcess !== null;
  }

  /**
   * Requests file-related information from VLC.
   */
  public requestFileDetails() {
    ['get-duration', 'get-filepath', 'get-filename'].forEach((cmd) =>
      this.vlcProtocol.sendCommand(cmd),
    );
  }

  /**
   * Sends a status check command to VLC.
   */
  public detectChanges() {
    this.vlcProtocol.sendCommand('.');
  }

  /**
   * Handles unexpected VLC disconnections and attempts to reconnect.
   */
  private handleDisconnection() {
    if (this.isReady) {
      if (this.processManager.isShuttingDown) {
        this.logger.info(
          'VLC process was intentionally terminated. No reconnection.',
        );
        this.isReady = false;
        return;
      }

      this.logger.warn(
        'Disconnected from VLC. Attempting reconnect in 5 seconds...',
      );
      if (this.processManager?.vlcProcess) {
        this.logger.info('VLC process closed.');
        this.processManager.vlcProcess = null;
      }
      this.isReady = false;

      setTimeout(() => {
        this.logger.info('Attempting to reconnect to VLC...');
        this.vlcProtocol.connect();
      }, 5000);
    }
  }

  /**
   * Validates if the provided path is a valid VLC player.
   * @param {string} filePath - The file path to validate
   * @returns {Promise<boolean>} Whether the path points to a valid VLC player
   */
  public async validatePlayerPath(filePath: string): Promise<boolean> {
    try {
      this.logger.info(`Validating VLC player path: ${filePath}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        this.logger.error(`File does not exist: ${filePath}`);
        return false;
      }

      // Check file name - if it contains "vlc" it's likely a VLC player
      if (filePath.toLowerCase().includes('vlc')) {
        return true;
      }

      // Try to execute with --version flag to check if it's VLC
      try {
        const result = execSync(`"${filePath}" --version`, {
          timeout: 2000,
        }).toString();
        if (result.toLowerCase().includes('vlc')) {
          this.logger.info('Successfully validated as VLC player');
          return true;
        }
      } catch (execError) {
        this.logger.error(
          `Error validating VLC: ${(execError as Error).message}`,
        );
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error validating player path: ${(error as Error).message}`,
      );
      return false;
    }
  }
}
