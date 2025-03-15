import { EventEmitter } from 'events';
import * as net from 'net';

/**
 * Handles communication with VLC over a TCP socket.
 */
class VLCProtocol extends EventEmitter {
  private vlcSocket: net.Socket = new net.Socket();

  private readonly responseDelimiter = '\n';

  private isConnected = false;

  private hasRequestedVLCVersion = false;

  constructor(public vlcPort: number) {
    super();
    this.setupSocketListeners();
  }

  /**
   * Sets up socket event listeners for VLC communication.
   */
  private setupSocketListeners() {
    this.vlcSocket.on('data', (data: Buffer) => {
      data
        .toString()
        .split(this.responseDelimiter)
        .forEach((line) => this.emit('lineReceived', line.trim()));
    });

    this.vlcSocket.on('connect', () => {
      this.isConnected = true;
      this.emit('connected');
    });

    this.vlcSocket.on('close', () => {
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.vlcSocket.on('error', (err: Error) => this.emit('error', err));
  }

  /**
   * Establishes a connection to VLC.
   */
  public connect() {
    console.log('VLC Port:', this.vlcPort);
    this.vlcSocket.connect(this.vlcPort, 'localhost');
  }

  /**
   * Closes the VLC connection.
   */
  public disconnect() {
    this.vlcSocket.end();
  }

  /**
   * Sends a command to VLC over the socket.
   * @param {string} command - The command to send.
   */
  public sendCommand(command: string) {
    if (!this.isConnected) return;

    if (!this.hasRequestedVLCVersion) {
      this.hasRequestedVLCVersion = true;
      this.sendCommand('get-vlc-version');
    }

    try {
      const formattedCommand = `${command}${this.responseDelimiter}`;
      this.vlcSocket.write(formattedCommand);
      this.emit('debug', `player >> ${command}`);
    } catch (err) {
      this.emit('error', err);
    }
  }
}

export default VLCProtocol;
