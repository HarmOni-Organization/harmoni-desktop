import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'electron-store-get'
  | 'electron-store-set'
  | 'electron-store-delete';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  store: {
    get(key: string) {
      try {
        return ipcRenderer.sendSync('electron-store-get', key);
      } catch (error) {
        console.error(`Error getting key "${key}" from store:`, error);
        return null;
      }
    },
    set(property: string, val: unknown) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    delete(key: string) {
      try {
        return ipcRenderer.sendSync('electron-store-delete', key);
      } catch (error) {
        console.error(`Error deleting key "${key}" from store:`, error);
        return false;
      }
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
