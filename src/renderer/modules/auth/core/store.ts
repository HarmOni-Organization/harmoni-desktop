import axios from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

import loadingStore from '@core/stores/LoadingStore';
import socketInstance from '@services/socketInstance';
import { networkAwareAction } from '@utils/networkAwareAction';

import type { AuthState, User } from './_models';
import * as authApi from './_requests';

class AuthStore {
  authState: AuthState = {
    currentUser: null,
    loggedIn: false,
    sessionActive: false,
    authError: null,
    loading: false,
    userNameCheckStatus: 'idle',
    emailCheckStatus: 'idle',
  };

  constructor() {
    makeAutoObservable(this);
    this.initialize();
  }

  /**
   * Initializes the AuthStore by ensuring dependent modules are ready
   * and attempting to restore the user session.
   */
  async initialize() {
    try {
      await loadingStore.waitForModule('NetworkStore');
      await this.restoreUserSession();
      loadingStore.markModuleLoaded('AuthStore');
    } catch (initError) {
      console.error('AuthStore initialization error:', initError);
    }
  }

  /**
   * Restores the user session from persistent storage.
   */
  async restoreUserSession() {
    const savedUserData = window.electron.store.get(
      'auth.currentUser',
    ) as User | null;
    if (savedUserData) {
      runInAction(() => {
        this.authState.currentUser = savedUserData;
        this.authState.loggedIn = true;
      });
      await networkAwareAction(
        async () => {
          await this.validateSession();
          if (this.authState.sessionActive) {
            AuthStore.connectToWebSocket(); // Automatically connect to WebSocket
            this.startTokenRefreshInterval(); // Start token refresh for valid sessions
          }
        },
        () =>
          runInAction(() => {
            this.authState.sessionActive = false;
          }),
      );
    }
  }

  /**
   * Logs in the user via API and persists session data.
   * @param credentials - User credentials: email or username and password.
   */
  async login(credentials: { emailOrUsername: string; password: string }) {
    runInAction(() => {
      this.authState.authError = null;
      this.authState.loading = true;
    });
    try {
      const loggedInUser = await authApi.loginUser(credentials);
      window.electron.store.set('auth.currentUser', loggedInUser);

      runInAction(() => {
        this.authState.currentUser = loggedInUser;
        this.authState.loggedIn = true;
        this.authState.sessionActive = true;
      });

      AuthStore.connectToWebSocket(); // Connect to WebSocket after successful login
      this.startTokenRefreshInterval(); // Start token refresh after login
    } catch (loginError) {
      runInAction(() => {
        this.authState.authError =
          AuthStore.extractErrorMessage(loginError) || 'Unable to login.';
      });
    } finally {
      runInAction(() => {
        this.authState.loading = false;
      });
    }
  }

  /**
   * Registers a new user and persists session data.
   * @param newUserDetails - Username, password, and optional email.
   */
  async register(newUserDetails: {
    username: string;
    password: string;
    email?: string;
  }) {
    runInAction(() => {
      this.authState.authError = null;
      this.authState.loading = true;
    });
    try {
      const registeredUser = await authApi.registerUser(newUserDetails);
      window.electron.store.set('auth.currentUser', registeredUser);

      runInAction(() => {
        this.authState.currentUser = registeredUser;
        this.authState.loggedIn = true;
        this.authState.sessionActive = true;
      });
    } catch (registerError) {
      runInAction(() => {
        this.authState.authError =
          AuthStore.extractErrorMessage(registerError) || 'Unable to register.';
      });
    } finally {
      runInAction(() => {
        this.authState.loading = false;
      });
    }
  }

  /**
   * Validates the session token with the server.
   */
  async validateSession() {
    try {
      const response = await authApi.verifyUserToken();
      if (response.user) {
        runInAction(() => {
          this.authState.sessionActive = true;
        });
      }
    } catch {
      runInAction(() => {
        this.logout();
      });
    }
  }

  /**
   * Refreshes the user's token.
   */
  async refreshSessionToken() {
    if (this.authState.currentUser) {
      try {
        const newToken = await authApi.refreshAccessToken();
        runInAction(() => {
          if (this.authState.currentUser) {
            console.log('Refreshing token', newToken);

            // Create a serializable copy of the user object
            const updatedUser = {
              ...this.authState.currentUser,
              token: newToken,
            };

            // Update the store state
            this.authState.currentUser.token = newToken;

            // Store only the serializable user data
            window.electron.store.set('auth.currentUser', updatedUser);
          }
        });
      } catch (error) {
        console.log('Refreshing token failed', error);

        runInAction(() => {
          this.logout();
        });
      }
    }
  }

  /**
   * Checks if the provided username is unique.
   * @param username - Username to check.
   */
  checkUsernameAvailability = async (username: string): Promise<boolean> => {
    runInAction(() => {
      this.authState.userNameCheckStatus = 'checking';
    });
    try {
      const isUnique = await authApi.isUsernameUnique(username);
      runInAction(() => {
        this.authState.userNameCheckStatus = isUnique ? 'available' : 'taken';
      });
      return isUnique;
    } catch {
      runInAction(() => {
        this.authState.userNameCheckStatus = 'error';
      });
      return false;
    }
  };

  /**
   * Checks if the provided email is unique.
   * @param email - Email to check.
   */
  checkEmailAvailability = async (email: string): Promise<boolean> => {
    runInAction(() => {
      this.authState.emailCheckStatus = 'checking';
    });
    try {
      const isUnique = await authApi.isEmailUnique(email);
      runInAction(() => {
        this.authState.emailCheckStatus = isUnique ? 'available' : 'taken';
      });
      return isUnique;
    } catch {
      runInAction(() => {
        this.authState.emailCheckStatus = 'error';
      });
      return false;
    }
  };

  /**
   * Connects the user to the WebSocket server.
   */
  private static connectToWebSocket() {
    try {
      const socket = socketInstance.getInstance();
      console.log('Connected to WebSocket server:', socket.id);
    } catch (error) {
      console.error('Failed to connect to WebSocket server:', error);
    }
  }

  /**
   * Logs out the user and clears the session data.
   */
  logout = () => {
    this.stopTokenRefreshInterval();
    window.electron.store.delete('auth.currentUser');
    this.resetAuthState();
    socketInstance.disconnect('default', true); // Disconnect from WebSocket on logout with proper parameters
  };

  /**
   * Resets the AuthStore state to defaults.
   */
  resetAuthState() {
    runInAction(() => {
      this.authState = {
        currentUser: null,
        loggedIn: false,
        sessionActive: false,
        authError: null,
        loading: false,
        userNameCheckStatus: 'idle',
        emailCheckStatus: 'idle',
      };
    });
  }

  /**
   * Starts a token refresh interval to ensure the token stays valid
   * during the user's session.
   */
  startTokenRefreshInterval() {
    // Refresh token every 15 minutes (900000 ms)
    const intervalId = setInterval(() => {
      if (this.authState.loggedIn && this.authState.sessionActive) {
        this.refreshSessionToken();
      } else {
        clearInterval(intervalId);
      }
    }, 900000); // Changed from 1000 ms (1 second) to 900000 ms (15 minutes)

    // Store the interval ID for cleanup
    window.electron.store.set('auth.tokenRefreshInterval', intervalId);
  }

  /**
   * Stops the token refresh interval when user logs out.
   */
  stopTokenRefreshInterval = () => {
    const intervalId = window.electron.store.get('auth.tokenRefreshInterval');
    if (intervalId) {
      clearInterval(intervalId);
      window.electron.store.delete('auth.tokenRefreshInterval');
      console.log(
        'Token refresh interval stopped by',
        this.authState.currentUser?.username || 'unknown user',
      );
    }
  };

  get isAuthenticated() {
    return this.authState.loggedIn && this.authState.sessionActive;
  }

  /**
   * Extracts an error message from an Axios error.
   * @param error - Axios error object.
   */
  static extractErrorMessage(error: unknown): string | null {
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      return (error.response.data as { message?: string }).message || null;
    }
    return null;
  }
}

// Register AuthStore in LoadingStore
loadingStore.addModule('AuthStore');

const authStore = new AuthStore();
export default authStore;
