import axios from 'axios';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import appConfig from '@config/appConfig';

class SocketInstance {
  private static instances: Record<string, Socket | null> = {};

  private static socketUrls: Record<string, string> = {
    default: appConfig.baseURL,
    watchTogether: `${appConfig.baseURL}/watch-together`,
  };

  /**
   * Gets or initializes the singleton WebSocket instance for a specific endpoint.
   * @param endpointKey - The key of the endpoint (e.g., 'watchTogether').
   */
  public static getInstance(
    endpointKey: keyof typeof SocketInstance.socketUrls = 'default',
  ): Socket {
    if (!SocketInstance.instances[endpointKey]) {
      const socketUrl = SocketInstance.socketUrls[endpointKey];
      if (!socketUrl) {
        throw new Error(`Endpoint '${endpointKey}' is not defined.`);
      }

      SocketInstance.instances[endpointKey] = io(socketUrl, {
        extraHeaders: { Authorization: `Bearer ${SocketInstance.getToken()}` },
        // reconnection: true,
        // reconnectionAttempts: 5,
        // reconnectionDelay: 1000,
      });

      // Setup event listeners for the specific instance
      SocketInstance.setupListeners(endpointKey);
    }

    return SocketInstance.instances[endpointKey]!;
  }

  /**
   * Retrieves the current token from persistent storage.
   * @returns The current auth token or null if not available.
   */
  private static getToken(): string | null {
    try {
      return window.electron.store.get('auth.currentUser.token') || null;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  /**
   * Sets up WebSocket event listeners for a specific instance.
   * @param endpointKey - The key of the endpoint.
   */
  private static setupListeners(
    endpointKey: keyof typeof SocketInstance.socketUrls,
  ) {
    const socket = SocketInstance.getInstance(endpointKey);

    socket.on('connect', () => {
      console.info(`WebSocket connected to '${endpointKey}':`, socket.id);
    });

    socket.on('disconnect', (reason: string) => {
      console.warn(`WebSocket disconnected from '${endpointKey}': ${reason}`);

      if (reason === 'io server disconnect') {
        console.warn('Server forced disconnection. Attempting reconnection...');
        socket.connect(); // Try reconnecting immediately
      }
    });

    socket.on('connect_error', async (error) => {
      console.error(`WebSocket connection error on '${endpointKey}':`, error);

      if (error.message.includes('Unauthorized')) {
        await SocketInstance.refreshToken();
        socket.io.opts.extraHeaders = {
          Authorization: `Bearer ${SocketInstance.getToken()}`,
        };
        socket.connect(); // Reconnect with the new token
      }
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.info(
        `WebSocket reconnect attempt ${attempt} for '${endpointKey}'`,
      );
    });

    socket.on('error', (error: Error) => {
      console.error(`WebSocket error on '${endpointKey}':`, error);
    });
  }

  /**
   * Refreshes the token via the HarmOni API and updates storage.
   */
  private static async refreshToken() {
    try {
      const currentToken = SocketInstance.getToken();
      if (currentToken) {
        const response = await axios.get(
          `${appConfig.baseURL}/auth/refresh-token`,
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          },
        );

        const newToken = response.data?.accessToken;
        if (newToken) {
          window.electron.store.set('auth.currentUser.token', newToken);
          console.info('Token refreshed successfully.');
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      window.electron.store.set('auth.currentUser', null);
    }
  }

  /**
   * Disconnects the WebSocket instance for a specific endpoint.
   * @param endpointKey - The key of the endpoint.
   */
  public static disconnect(
    endpointKey: keyof typeof SocketInstance.socketUrls,
    isLogout = false,
  ) {
    const socket = SocketInstance.instances[endpointKey];

    if (socket) {
      console.info(`Disconnecting WebSocket from '${endpointKey}'`);

      if (isLogout) {
        socket.io.opts.reconnection = false; // Prevent auto-reconnection
        socket.removeAllListeners();
        socket.disconnect();
        SocketInstance.instances[endpointKey] = null;
        console.info(
          `WebSocket fully removed from '${endpointKey}' due to logout.`,
        );
      } else {
        console.info(
          `Network issue detected. Keeping WebSocket for auto-reconnection.`,
        );
      }
    }
  }

  /**
   * Emits an event to a specific WebSocket server.
   * @param endpointKey - The key of the endpoint.
   * @param event - Event name.
   * @param data - Data payload for the event.
   */
  public static emit(
    endpointKey: keyof typeof SocketInstance.socketUrls,
    event: string,
    data?: unknown,
  ) {
    SocketInstance.getInstance(endpointKey).emit(event, data);
  }

  /**
   * Adds a listener for a specific WebSocket event on a specific endpoint.
   * @param endpointKey - The key of the endpoint.
   * @param event - Event name.
   * @param callback - Callback function for the event.
   */
  public static on(
    endpointKey: keyof typeof SocketInstance.socketUrls,
    event: string,
    callback: (...args: unknown[]) => void,
  ) {
    SocketInstance.getInstance(endpointKey).on(event, callback);
  }

  /**
   * Removes a listener for a specific WebSocket event on a specific endpoint.
   * @param endpointKey - The key of the endpoint.
   * @param event - Event name.
   * @param callback - Optional callback function to remove.
   */
  public static off(
    endpointKey: keyof typeof SocketInstance.socketUrls,
    event: string,
    callback?: (...args: unknown[]) => void,
  ) {
    SocketInstance.getInstance(endpointKey).off(event, callback);
  }
}

export default SocketInstance;
