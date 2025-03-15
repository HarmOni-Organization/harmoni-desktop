import { makeAutoObservable } from 'mobx';

import SocketInstance from '@services/socketInstance';

import loadingStore from './LoadingStore';

class NetworkStore {
  onlineStatus: boolean = false;

  connectionType: string | null = null;

  lastOnlineTime: Date | null = null;

  queuedActions: Array<() => Promise<void>> = []; // Actions queued for retry when offline

  estimatedDownloadSpeedMbps: number | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeNetworkStore();
  }

  /**
   * Initializes the NetworkStore.
   * Sets up WebSocket-based event listeners and updates online status.
   * Marks the module as loaded upon successful initialization.
   */
  async initializeNetworkStore() {
    try {
      this.setupWebSocketListeners();
      this.updateOnlineStatus(SocketInstance.getInstance().connected); // Initial status
      this.setupEventListeners();
      loadingStore.markModuleLoaded('NetworkStore');
    } catch (error) {
      console.error('Error initializing NetworkStore:', error);
      loadingStore.markModuleLoaded('NetworkStore');
    }
  }

  /**
   * Sets up event listeners for online and offline status changes.
   */
  setupEventListeners() {
    const connection = navigator.connection as NetworkInformation | undefined;
    if (connection) {
      this.updateConnectionDetails();
      if (typeof connection.addEventListener === 'function') {
        connection.addEventListener('change', this.updateConnectionDetails);
      }
    }
  }

  /**
   * Sets up WebSocket event listeners for online/offline status updates.
   */
  private setupWebSocketListeners() {
    const socket = SocketInstance.getInstance();

    socket.on('connect', this.handleSocketConnect);
    socket.on('disconnect', this.handleSocketDisconnect);
  }

  /**
   * Handles the WebSocket "connect" event.
   * Updates the `onlineStatus` to true and records the current time.
   */
  private handleSocketConnect = () => {
    this.updateOnlineStatus(true);
  };

  /**
   * Handles the WebSocket "disconnect" event.
   * Updates the `onlineStatus` to false.
   */
  private handleSocketDisconnect = () => {
    this.updateOnlineStatus(false);
  };

  /**
   * Updates network connection details, including type and estimated speed.
   * Uses the Network Information API if available.
   */
  updateConnectionDetails = () => {
    const connection = navigator.connection as NetworkInformation | undefined;
    this.connectionType = connection?.type || 'unknown';
    this.estimatedDownloadSpeedMbps = connection?.downlink || null;
  };

  /**
   * Updates the online status and records the last online time if applicable.
   * @param status - The current online status (true = online, false = offline).
   */
  private updateOnlineStatus(status: boolean) {
    this.onlineStatus = status;
    if (status) {
      this.lastOnlineTime = new Date();
      this.retryQueuedActions();
    }
  }

  /**
   * Queues an action for retry when the network is back online.
   * Executes the action immediately if the network is currently online.
   * @param action - The action to be queued or executed.
   */
  queueActionForRetry(action: () => Promise<void>) {
    if (!this.onlineStatus) {
      this.queuedActions.push(action);
    } else {
      action().catch((err) =>
        console.error('Error executing immediate action:', err),
      );
    }
  }

  /**
   * Retries queued actions when the network is back online.
   */
  async retryQueuedActions() {
    if (this.onlineStatus) {
      console.log('Retrying queued actions...');
      while (this.queuedActions.length > 0) {
        const action = this.queuedActions.shift();
        if (action) {
          try {
            action();
          } catch (err) {
            console.error('Error retrying action:', err);
          }
        }
      }
    }
  }

  /**
   * Cleans up WebSocket event listeners when the store is disposed of.
   */
  dispose() {
    const socket = SocketInstance.getInstance();

    socket.off('connect', this.handleSocketConnect);
    socket.off('disconnect', this.handleSocketDisconnect);
    const connection = navigator.connection as NetworkInformation | undefined;
    if (connection?.removeEventListener) {
      connection.removeEventListener('change', this.updateConnectionDetails);
    }
  }
}

// Register NetworkStore in LoadingStore
loadingStore.addModule('NetworkStore'); // Register the store for loading tracking

const networkStore = new NetworkStore();
export default networkStore;
