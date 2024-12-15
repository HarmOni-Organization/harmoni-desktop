import { makeAutoObservable } from 'mobx';

import loadingStore from './LoadingStore';

class NetworkStore {
  onlineStatus: boolean = false;

  connectionType: string | null = null;

  lastOnlineTime: Date | null = null;

  queuedActions: Array<() => Promise<void>> = []; // Actions queued for retry when offline

  estimatedDownloadSpeedMbps: number | null = null; // Estimated download speed in Mbps

  private connectivityCheckIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeNetworkStore();
  }

  /**
   * Initializes the NetworkStore.
   * Sets up event listeners for network changes and starts periodic connectivity checks.
   * Marks the module as loaded upon successful initialization.
   */
  async initializeNetworkStore() {
    try {
      this.setupEventListeners();
      this.startPeriodicConnectivityCheck();
      await this.performInitialConnectivityCheck();
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
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOfflineStatusChange);

    const connection = navigator.connection as NetworkInformation | undefined;
    if (connection) {
      this.updateConnectionDetails();
      if (typeof connection.addEventListener === 'function') {
        connection.addEventListener('change', this.updateConnectionDetails);
      }
    }
  }

  /**
   * Starts a periodic check for internet connectivity every minute.
   */
  startPeriodicConnectivityCheck() {
    this.connectivityCheckIntervalId = setInterval(
      this.checkInternetConnectivity,
      60000,
    );
  }

  /**
   * Performs the initial connectivity check to determine the current network status.
   */
  async performInitialConnectivityCheck() {
    await this.checkInternetConnectivity();
  }

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
   * Handles the "online" event by rechecking internet connectivity.
   */
  handleOnlineStatusChange = () => {
    this.checkInternetConnectivity();
  };

  /**
   * Handles the "offline" event by setting the online status to false.
   */
  handleOfflineStatusChange = () => {
    this.onlineStatus = false;
  };

  /**
   * Checks internet connectivity by making a request to a reliable external source.
   * Includes a timeout to prevent prolonged loading times when there is no connection.
   * Updates the `onlineStatus` based on the success or failure of the request.
   */
  checkInternetConnectivity = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Set timeout to 5 seconds

    try {
      await fetch('https://www.google.com', {
        mode: 'no-cors',
        signal: controller.signal,
      });
      this.onlineStatus = true;
      this.lastOnlineTime = new Date();
      this.retryQueuedActions();
    } catch {
      this.onlineStatus = false;
    } finally {
      clearTimeout(timeoutId);
    }
  };

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
   * Cleans up event listeners and intervals when the store is disposed of.
   */
  dispose() {
    window.removeEventListener('online', this.handleOnlineStatusChange);
    window.removeEventListener('offline', this.handleOfflineStatusChange);

    const connection = navigator.connection as NetworkInformation | undefined;
    if (connection?.removeEventListener) {
      connection.removeEventListener('change', this.updateConnectionDetails);
    }

    if (this.connectivityCheckIntervalId) {
      clearInterval(this.connectivityCheckIntervalId);
    }
  }
}

// Register NetworkStore in LoadingStore
loadingStore.addModule('NetworkStore'); // Register the store for loading tracking

const networkStore = new NetworkStore();
export default networkStore;
