import { makeAutoObservable } from 'mobx';

class LoadingStore {
  modulesLoaded: Record<string, boolean> = {}; // Tracks each module's load status

  allModulesLoaded: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Adds a module to the loading tracker.
   * @param moduleName - Name of the module.
   */
  addModule(moduleName: string) {
    if (!(moduleName in this.modulesLoaded)) {
      this.modulesLoaded[moduleName] = false;
    }
  }

  /**
   * Marks a module as loaded.
   * @param moduleName - Name of the module.
   */
  markModuleLoaded(moduleName: string) {
    this.modulesLoaded[moduleName] = true;

    // Check if all modules are loaded
    this.allModulesLoaded = Object.values(this.modulesLoaded).every(
      (isLoaded) => isLoaded,
    );
  }

  /**
   * Waits until the specified module is marked as loaded.
   * @param moduleName - The name of the module to wait for.
   */
  async waitForModule(moduleName: string) {
    while (!this.modulesLoaded[moduleName]) {
      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 100)); // Poll every 100ms
    }
  }
}

const loadingStore = new LoadingStore();
export default loadingStore;
