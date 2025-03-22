import { makeAutoObservable, reaction } from 'mobx';

import THEME_MAP from '@utils/constant/themeMap';

import loadingStore from './LoadingStore';

class PreferencesStore {
  theme: number;

  language: string;

  constructor() {
    this.theme =
      (window.electron.store.get('userPreferences.theme') as number) || 0;
    this.language =
      (window.electron.store.get('userPreferences.language') as string) || 'en';
    makeAutoObservable(this);

    this.init();

    // Sync changes back to Electron Store
    this.observeChanges('theme', (newTheme) =>
      window.electron.store.set('userPreferences.theme', newTheme),
    );
    this.observeChanges('language', (newLanguage) =>
      window.electron.store.set('userPreferences.language', newLanguage),
    );
  }

  /**
   * Initializes the PreferencesStore.
   * Marks the module as loaded in the LoadingStore once complete.
   */
  init() {
    try {
      setTimeout(() => {
        console.log(`Initializing PreferencesStore with theme: ${this.theme}`);
        loadingStore.markModuleLoaded('PreferencesStore');
      }, 500);
    } catch (error) {
      console.error('PreferencesStore initialization failed:', error);
      loadingStore.markModuleLoaded('PreferencesStore');
    }
  }

  /**
   * Sets the theme preference.
   * @param theme - The new theme value.
   */
  setTheme = (theme: number) => {
    this.theme = theme;
  };

  /**
   * Sets the language preference.
   * @param language - The new language value.
   */
  setLanguage(language: string) {
    this.language = language;
  }

  /**
   * Observes changes to the specified property and invokes the callback.
   * @param propertyName - The property to observe.
   * @param callback - The callback function to invoke on change.
   */
  observeChanges<T extends keyof PreferencesStore>(
    propertyName: T,
    callback: (newValue: PreferencesStore[T]) => void,
  ) {
    reaction(
      () => this[propertyName],
      (newValue) => {
        callback(newValue);
      },
    );
  }

  /**
   * Gets the current theme as a string from the THEME_MAP.
   */
  get currentTheme(): string {
    return THEME_MAP[this.theme];
  }
}

// Register PreferencesStore in LoadingStore
loadingStore.addModule('PreferencesStore'); // Register the module for tracking

const preferencesStore = new PreferencesStore();
export default preferencesStore;
