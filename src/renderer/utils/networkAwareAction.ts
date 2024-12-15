import networkStore from '../core/stores/NetworkStore';

export const networkAwareAction = async (
  action: () => Promise<void>, // The action to perform when online
  fallback?: () => void, // Optional fallback to run immediately when offline
): Promise<void> => {
  if (networkStore.onlineStatus) {
    try {
      await action();
    } catch (error) {
      console.error('Error executing online action:', error);
      throw error;
    }
  } else {
    console.warn('Offline: Queuing action for retry when online.');
    networkStore.queueActionForRetry(action);
    if (fallback) {
      fallback();
    }
  }
};
