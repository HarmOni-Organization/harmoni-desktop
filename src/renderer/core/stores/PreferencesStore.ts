import { makeAutoObservable, reaction } from 'mobx';

import THEME_MAP from '../../utils/constant/themeMap';
import type { RootStore } from './RootStore';

class PreferencesStore {
  rootStore: RootStore;

  theme: number;

  language: string;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.theme =
      (window.electron.store.get('userPreferences.theme') as number) || 0;
    this.language =
      (window.electron.store.get('userPreferences.language') as string) || 'en';
    makeAutoObservable(this);

    // Sync changes back to Electron Store
    this.observeChanges('theme', (newTheme) =>
      window.electron.store.set('userPreferences.theme', newTheme),
    );
    this.observeChanges('language', (newLanguage) =>
      window.electron.store.set('userPreferences.language', newLanguage),
    );
  }

  // Define setTheme as an arrow function to bind the context correctly
  setTheme = (theme: number) => {
    this.theme = theme;
  };

  setLanguage(language: string) {
    this.language = language;
  }

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

  get currentTheme(): string {
    return THEME_MAP[this.theme];
  }
}

export default PreferencesStore;
