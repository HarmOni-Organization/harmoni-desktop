import Store from 'electron-store';

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

interface Room {
  roomId: string;
}

// Define the overall schema structure for the store
export interface StoreSchema {
  userPreferences: UserPreferences;
  auth: Auth;
  currentRoom: Room | null;
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
  currentRoom: {
    type: ['object', 'null'],
    properties: {
      roomId: { type: 'string' },
    },
    required: ['roomId'],
    default: null,
  },
  auth: {
    type: 'object',
    properties: {
      currentUser: {
        type: ['object', 'null'],
        properties: {
          userId: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          token: { type: 'string' },
        },
        required: ['userId', 'username', 'token', 'email'],
      },
    },
    default: { currentUser: null },
  },
};
// Singleton class to ensure only one instance of the store
class ElectronStoreSingleton {
  private static instances: Map<string, Store<StoreSchema>> = new Map();

  // Method to get or create a singleton instance for a specific store name
  static getInstance(storeName: string = 'default'): Store<StoreSchema> {
    console.log('storeName', storeName);

    if (!ElectronStoreSingleton.instances.has(storeName)) {
      const store = new Store<StoreSchema>({
        name: storeName,
        schema,
      });
      ElectronStoreSingleton.instances.set(storeName, store);
    }
    return ElectronStoreSingleton.instances.get(
      storeName,
    ) as Store<StoreSchema>;
  }
}

// Get the singleton instance and export it for use in the application
const store = ElectronStoreSingleton.getInstance(
  process.env.STORE_INSTANCE_NAME || 'default',
);
export default store;
