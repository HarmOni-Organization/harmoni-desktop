import harmOniApi from '../../../services/harmOniApi';
import type {
  LoginResponse,
  RefreshTokenResponse,
  RegisterResponse,
  User,
  VerifyTokenResponse,
} from './_models';

/**
 * Authenticates the user by calling the login endpoint.
 * @param credentials - The login request payload containing email/username and password.
 * @returns The logged-in user information including the access token.
 */
export const loginUser = async (credentials: {
  emailOrUsername: string;
  password: string;
}): Promise<User> => {
  const response = await harmOniApi.post<LoginResponse>(
    '/auth/login',
    credentials,
  );
  const { user, accessToken } = response.data;

  return { ...user, token: accessToken };
};

/**
 * Registers a new user by calling the registration endpoint.
 * @param registrationData - The registration request payload containing username, password, and optionally email.
 * @returns The newly created user information including the access token.
 */
export const registerUser = async (registrationData: {
  username: string;
  password: string;
  email?: string;
}): Promise<User> => {
  const response = await harmOniApi.post<RegisterResponse>(
    '/auth/register',
    registrationData,
  );
  const { user, accessToken } = response.data;

  return { ...user, token: accessToken };
};

/**
 * Verifies if the provided JWT token is valid.
 * @returns The user information if the token is valid.
 */
export const verifyUserToken = async (): Promise<VerifyTokenResponse> => {
  const response =
    await harmOniApi.get<VerifyTokenResponse>('/auth/verify-token');
  return response.data;
};

/**
 * Refreshes the access token using the provided refresh token.
 * @returns The newly issued access token.
 */
export const refreshAccessToken = async (): Promise<string> => {
  const response = await harmOniApi.get<RefreshTokenResponse>(
    '/auth/refresh-token',
  );
  return response.data.accessToken;
};

/**
 * Checks if the provided email is unique (not already registered).
 * @param email - The email address to check.
 * @returns True if the email is unique, otherwise false.
 */
export const isEmailUnique = async (email: string): Promise<boolean> => {
  const response = await harmOniApi.get(`/auth/check-email/${email}`);
  return response.data.isUnique;
};

/**
 * Checks if the provided username is unique (not already taken).
 * @param username - The username to check.
 * @returns True if the username is unique, otherwise false.
 */
export const isUsernameUnique = async (username: string): Promise<boolean> => {
  const response = await harmOniApi.get(`/auth/check-username/${username}`);
  return response.data.isUnique;
};
