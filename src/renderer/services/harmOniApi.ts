import type { InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import { showToast } from '../components/Toaster';
import appConfig from '../config/appConfig';

/**
 * Handles API errors by checking if the error is an AxiosError and throws
 * a descriptive error message based on the response status.
 * @param error - The error object to process.
 * @throws Throws a formatted error message or rethrows the original error.
 */
export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message;

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    switch (statusCode) {
      case 401:
        throw new Error('Unauthorized access. Please log in again.');
      case 403:
        throw new Error(
          'Access denied. You do not have permission to perform this action.',
        );
      case 404:
        throw new Error('Requested resource not found.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error('An unexpected error occurred.');
    }
  }
  throw error;
};

/**
 * Create an Axios instance for HarmOni API with pre-configured settings.
 */
const harmOniApiClient = axios.create({
  baseURL: appConfig.baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor to add Authorization token to each request if available.
 */
harmOniApiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig<unknown>) => {
    try {
      const currentAuthToken = window.electron.store.get(
        'auth.currentUser.token',
      );
      if (
        currentAuthToken &&
        requestConfig.headers &&
        'set' in requestConfig.headers
      ) {
        requestConfig.headers.set(
          'Authorization',
          `Bearer ${currentAuthToken}`,
        );
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor to handle API response errors and show user-friendly messages.
 */
harmOniApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.config) {
      const statusCode = error.response?.status;

      if (statusCode === 401) {
        try {
          const token = window.electron.store.get('auth.currentUser.token');
          if (token) {
            const refreshResponse = await axios.get(
              `${appConfig.baseURL}/auth/refresh-token`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            const newAuthToken = refreshResponse.data?.accessToken;
            if (newAuthToken) {
              window.electron.store.set('auth.currentUser.token', newAuthToken);

              // Retry the original request with the new token
              if (error?.config?.headers && 'set' in error.config.headers) {
                error?.config?.headers.set(
                  'Authorization',
                  `Bearer ${newAuthToken}`,
                );
              }

              return harmOniApiClient.request(error.config);
            }
          }
        } catch (refreshError) {
          window.electron.store.set('auth.currentUser', null);

          // Refresh failed, so user needs to log in again
          showToast('Session expired. Please log in again.', 'error');
        }
      }

      const errorMessage = error.response?.data?.message;

      if (errorMessage) {
        showToast(errorMessage, 'error');
      } else {
        switch (statusCode) {
          case 403:
            showToast(
              'Access denied. You do not have permission to perform this action.',
              'error',
            );
            break;
          case 404:
            showToast('Requested resource not found.', 'error');
            break;
          case 500:
            showToast('Server error. Please try again later.', 'error');
            break;
          default:
            showToast('An unexpected error occurred.', 'error');
        }
      }
    } else {
      showToast('Network error.', 'error');
    }
    return Promise.reject(error);
  },
);

export default harmOniApiClient;
