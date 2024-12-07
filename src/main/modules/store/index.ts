import Store from 'electron-store';

// Define interfaces for your store schema
interface UserPreferences {
  theme: number;
  language: string;
}

interface Auth {
  currentUser: {
    userId: string;
    username: string;
    email?: string;
    token: string;
  };
}

// Define the overall schema structure for the store
export interface StoreSchema {
  userPreferences: UserPreferences;
  auth: Auth;
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
  auth: {
    type: 'object',
    properties: {
      currentUser: {
        type: ['object', 'null'], // Allow null for unauthenticated state
        properties: {
          userId: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          token: { type: 'string' },
        },
        required: ['userId', 'username', 'token', 'email'], // Email is optional
      },
    },
    default: { user: null }, // Default to no authenticated user
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
