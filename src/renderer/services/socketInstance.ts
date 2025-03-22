import axios from 'axios';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import appConfig from '@config/appConfig';

class SocketInstance {
  private static instances: Record<string, Socket | null> = {};

  private static retryCount = 0;

  private static socketUrls: Record<string, string> = {
    default: appConfig.baseURL,
    watchTogether: `${appConfig.baseURL}/watch-together`,
  };

  /**
   * Registers a new endpoint with the given key and URL
   * @param endpointKey - The unique identifier for the endpoint
   * @param url - The WebSocket URL for the endpoint
   * @returns true if registration was successful, false if the key already exists
   */
  public static registerEndpoint(endpointKey: string, url: string): boolean {
    if (this.socketUrls[endpointKey]) {
      console.warn(
        `Endpoint '${endpointKey}' already exists. Use a unique key.`,
      );
      return false;
    }

    this.socketUrls[endpointKey] = url;
    return true;
  }

  /**
   * Gets or initializes the singleton WebSocket instance for a specific endpoint.
   * @param endpointKey - The key of the endpoint or a new endpoint key
   * @param requireAuth - Whether authentication is required for this connection
   * @param url - Optional URL for a new endpoint (if not already registered)
   */
  public static getInstance(
    endpointKey: string = 'default',
    requireAuth = false,
    url?: string,
  ): Socket {
    // Register a new endpoint if URL is provided and endpoint doesn't exist
    if (url && !this.socketUrls[endpointKey]) {
      this.registerEndpoint(endpointKey, url);
    }

    const token = SocketInstance.getToken();

    if (requireAuth && !token) {
      throw new Error('No token found. Cannot connect to socket.');
    }

    if (!SocketInstance.instances[endpointKey]) {
      const socketUrl = SocketInstance.socketUrls[endpointKey];
      if (!socketUrl) {
        throw new Error(`Endpoint '${endpointKey}' is not defined.`);
      }

      // Add connection name for better visibility in network monitor
      SocketInstance.instances[endpointKey] = io(socketUrl, {
        extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
        // Add a custom query parameter to identify this connection in network tools
        query: { connectionId: endpointKey },
        forceNew: true, // Force a new connection to be established
        // reconnection: true,
        // reconnectionAttempts: 5,
        // reconnectionDelay: 1000,
      });

      // Setup event listeners for the specific instance
      SocketInstance.setupListeners(endpointKey, requireAuth);
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
   * @param requireAuth - Whether this instance requires authentication.
   */
  private static setupListeners(endpointKey: string, requireAuth = false) {
    const socket = SocketInstance.getInstance(endpointKey, requireAuth);

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
        if (SocketInstance.retryCount < 3) {
          SocketInstance.retryCount += 1;

          const newToken = await SocketInstance.refreshToken();

          if (newToken) {
            socket.io.opts.extraHeaders = {
              Authorization: `Bearer ${newToken}`,
            };
            socket.connect(); // Reconnect with the new token
          } else {
            console.error('Failed to refresh token. Disconnecting...');
            SocketInstance.disconnect(endpointKey, true);
          }
        } else {
          console.error('Failed to refresh token. Disconnecting...');
          SocketInstance.retryCount = 0;
          SocketInstance.disconnect(endpointKey, true);
        }
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
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      window.electron.store.set('auth.currentUser', null);
      return null;
    }
  }

  /**
   * Disconnects the WebSocket instance for a specific endpoint.
   * @param endpointKey - The key of the endpoint.
   */
  public static disconnect(endpointKey: string, isLogout = false) {
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
  public static emit(endpointKey: string, event: string, data?: unknown) {
    SocketInstance.getInstance(endpointKey).emit(event, data);
  }

  /**
   * Adds a listener for a specific WebSocket event on a specific endpoint.
   * @param endpointKey - The key of the endpoint.
   * @param event - Event name.
   * @param callback - Callback function for the event.
   */
  public static on(
    endpointKey: string,
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
    endpointKey: string,
    event: string,
    callback?: (...args: unknown[]) => void,
  ) {
    SocketInstance.getInstance(endpointKey).off(event, callback);
  }
}

export default SocketInstance;
