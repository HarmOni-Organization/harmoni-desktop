import { makeAutoObservable } from 'mobx';

import PreferencesStore from './PreferencesStore';

export class RootStore {
  preferencesStore: PreferencesStore;

  constructor() {
    this.preferencesStore = new PreferencesStore(this);

    makeAutoObservable(this);
  }
}

const rootStore = new RootStore();

export default rootStore;
