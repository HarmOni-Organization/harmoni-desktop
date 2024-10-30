import Store from 'electron-store';

// Define interfaces for your store schema
interface UserPreferences {
  theme: number;
  language: string;
}

interface User {
  name: string;
  role: string;
}

// Define the overall schema structure for the store
interface StoreSchema {
  userPreferences: UserPreferences;
  user: User;
}

// Define a schema for validation and defaults
const schema: { [K in keyof StoreSchema]: object } = {
  userPreferences: {
    type: 'object',
    properties: {
      theme: { type: 'number', default: 0 },
      language: { type: 'string', default: 'en' },
    },
  },
  user: {
    type: 'object',
    properties: {
      name: { type: 'string', default: 'Guest' },
      role: { type: 'string', default: 'guest' },
    },
  },
};

// Singleton class to ensure only one instance of the store
class ElectronStoreSingleton {
  private static instance: Store<StoreSchema>;

  // Method to get the singleton instance of the store
  static getInstance(): Store<StoreSchema> {
    if (!ElectronStoreSingleton.instance) {
      ElectronStoreSingleton.instance = new Store<StoreSchema>({ schema });
    }
    return ElectronStoreSingleton.instance;
  }
}

// Get the singleton instance and export it for use in the application
const store = ElectronStoreSingleton.getInstance();
export default store;
