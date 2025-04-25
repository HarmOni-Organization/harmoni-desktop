export type ValidationStatus =
  | 'idle'
  | 'checking'
  | 'taken'
  | 'available'
  | 'error';

export interface BaseUser {
  id: string;
  username: string;
  email: string;
}

export interface User extends BaseUser {
  token: string;
  refreshToken: string;
}

export interface AuthState {
  currentUser: User | null;
  loggedIn: boolean;
  sessionActive: boolean;
  authError: string | null;
  loading: boolean;
  userNameCheckStatus: ValidationStatus;
  emailCheckStatus: ValidationStatus;
}

/**
 * Generic API response structure.
 */
export interface ApiResponse<T> {
  data: T; // Payload
  meta?: { timestamp: string }; // Optional metadata
  error?: { code: string; message: string }; // Optional error details
}

/**
 * Login API response structure.
 */
export interface LoginResponse {
  user: Omit<User, 'token'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * Register API response structure.
 */
export interface RegisterResponse {
  user: Omit<User, 'token'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * User token verification response structure.
 */
export interface VerifyTokenResponse {
  user: BaseUser & { createdAt: string };
}

/**
 * Refresh token API response structure.
 */
export interface RefreshTokenResponse {
  accessToken: string;
}
