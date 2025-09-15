/**
 * Enhanced Authentication Model
 *
 * Provides comprehensive type definitions for OAuth integration,
 * enhanced user models, and session management for v1 release
 */

import type { User as BaseUser } from '../types/user';

// OAuth Provider Types
export type OAuthProvider = 'google' | 'apple' | 'github' | 'discord';

export interface OAuthProviderConfig {
  provider: OAuthProvider;
  clientId: string;
  enabled: boolean;
  scopes?: string[];
  redirectUrl?: string;
  additionalParams?: Record<string, string>;
}

export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  token_type: string;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  verified_email?: boolean;
}

// Enhanced User Model
export interface EnhancedUser extends BaseUser {
  // OAuth provider information
  oauth_providers?: OAuthProvider[];
  primary_oauth_provider?: OAuthProvider;

  // Profile enhancements
  avatar_url?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  locale?: string;
  timezone?: string;

  // Account status
  email_verified?: boolean;
  account_status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';

  // Preferences
  theme_preference?: 'light' | 'dark' | 'auto';
  email_notifications_enabled?: boolean;
  push_notifications_enabled?: boolean;

  // Timestamps
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;

  // Metadata
  metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

// Enhanced Session Model
export interface EnhancedAuthSession {
  user: EnhancedUser;
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  token_type: 'bearer';

  // OAuth-specific session data
  provider_token?: OAuthToken;
  provider_refresh_token?: string;

  // Session metadata
  session_id: string;
  created_at: string;
  last_activity_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Authentication State
export interface AuthState {
  user: EnhancedUser | null;
  session: EnhancedAuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: AuthError | null;
  lastActivityAt: string | null;
}

// Authentication Actions
export interface AuthActions {
  signIn: (credentials: SignInCredentials) => Promise<AuthResult>;
  signInWithOAuth: (provider: OAuthProvider, options?: OAuthSignInOptions) => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<AuthResult>;
  updateProfile: (updates: Partial<EnhancedUser>) => Promise<EnhancedUser>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

// Sign-in Credentials
export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface OAuthSignInOptions {
  redirectTo?: string;
  scopes?: string[];
  queryParams?: Record<string, string>;
  skipBrowserRedirect?: boolean;
}

// Authentication Result
export interface AuthResult {
  user: EnhancedUser | null;
  session: EnhancedAuthSession | null;
  error: AuthError | null;
  success: boolean;
  redirectTo?: string;
}

// Authentication Errors
export type AuthErrorType =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'email_already_registered'
  | 'oauth_error'
  | 'network_error'
  | 'session_expired'
  | 'invalid_token'
  | 'user_not_found'
  | 'too_many_requests'
  | 'account_disabled'
  | 'unknown_error';

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: Record<string, any>;
  code?: string;
  statusCode?: number;
  timestamp: string;
}

// OAuth-specific errors
export interface OAuthError extends AuthError {
  type: 'oauth_error';
  provider: OAuthProvider;
  oauthError?: {
    error: string;
    error_description?: string;
    state?: string;
  };
}

// Authentication Events
export type AuthEventType =
  | 'signed_in'
  | 'signed_out'
  | 'token_refreshed'
  | 'user_updated'
  | 'password_reset'
  | 'email_confirmed'
  | 'oauth_signin_started'
  | 'oauth_signin_completed'
  | 'session_expired'
  | 'auth_error';

export interface AuthEvent {
  type: AuthEventType;
  user?: EnhancedUser;
  session?: EnhancedAuthSession;
  error?: AuthError;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Authentication Configuration
export interface AuthConfig {
  // OAuth providers
  providers: Record<OAuthProvider, OAuthProviderConfig>;

  // Session management
  session: {
    autoRefresh: boolean;
    refreshThreshold: number; // minutes before expiry
    persistSession: boolean;
    storageKey: string;
  };

  // Password policy
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };

  // Email settings
  email: {
    confirmEmailOnSignup: boolean;
    enableMagicLink: boolean;
    enablePasswordReset: boolean;
  };

  // Security
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    enableMFA: boolean;
    enableDeviceTracking: boolean;
  };
}

// Authentication Hooks
export interface UseAuthReturn {
  user: EnhancedUser | null;
  session: EnhancedAuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  signIn: AuthActions['signIn'];
  signInWithOAuth: AuthActions['signInWithOAuth'];
  signInWithMagicLink: AuthActions['signInWithMagicLink'];
  signOut: AuthActions['signOut'];
  updateProfile: AuthActions['updateProfile'];
  refreshSession: AuthActions['refreshSession'];
}

// Authentication Service Interface
export interface AuthenticationService {
  // Core authentication methods
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signInWithOAuth(provider: OAuthProvider, options?: OAuthSignInOptions): Promise<AuthResult>;
  signInWithMagicLink(email: string): Promise<void>;
  signOut(): Promise<void>;
  refreshSession(): Promise<AuthResult>;

  // User management
  getCurrentUser(): EnhancedUser | null;
  updateProfile(updates: Partial<EnhancedUser>): Promise<EnhancedUser>;
  updatePassword(newPassword: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  confirmEmail(token: string): Promise<void>;
  resendConfirmation(email: string): Promise<void>;

  // Session management
  getSession(): EnhancedAuthSession | null;
  setSession(session: EnhancedAuthSession | null): void;
  clearSession(): void;
  isSessionValid(): boolean;

  // Event handling
  onAuthStateChange(callback: (event: AuthEvent) => void): () => void;
  onAuthError(callback: (error: AuthError) => void): () => void;

  // OAuth utilities
  getOAuthUrl(provider: OAuthProvider, options?: OAuthSignInOptions): string;
  handleOAuthCallback(url: string): Promise<AuthResult>;
  getEnabledProviders(): OAuthProvider[];

  // Utility methods
  initialize(): Promise<void>;
  cleanup(): void;
}

// Type guards
export const isOAuthProvider = (value: string): value is OAuthProvider => {
  return ['google', 'apple', 'github', 'discord'].includes(value);
};

export const isAuthError = (error: any): error is AuthError => {
  return error && typeof error.type === 'string' && typeof error.message === 'string';
};

export const isOAuthError = (error: any): error is OAuthError => {
  return isAuthError(error) && error.type === 'oauth_error' && 'provider' in error;
};

export const isEnhancedUser = (user: any): user is EnhancedUser => {
  return user && typeof user.id === 'string' && 'oauth_providers' in user;
};

// Default configurations
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  providers: {
    google: {
      provider: 'google',
      clientId: '',
      enabled: false,
      scopes: ['openid', 'email', 'profile'],
    },
    apple: {
      provider: 'apple',
      clientId: '',
      enabled: false,
      scopes: ['name', 'email'],
    },
    github: {
      provider: 'github',
      clientId: '',
      enabled: false,
      scopes: ['user:email'],
    },
    discord: {
      provider: 'discord',
      clientId: '',
      enabled: false,
      scopes: ['identify', 'email'],
    },
  },
  session: {
    autoRefresh: true,
    refreshThreshold: 5,
    persistSession: true,
    storageKey: 'homework_app_auth',
  },
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
  },
  email: {
    confirmEmailOnSignup: true,
    enableMagicLink: true,
    enablePasswordReset: true,
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableMFA: false,
    enableDeviceTracking: false,
  },
};

// Utility functions
export const createAuthError = (
  type: AuthErrorType,
  message: string,
  details?: Record<string, any>
): AuthError => ({
  type,
  message,
  details,
  timestamp: new Date().toISOString(),
});

export const createOAuthError = (
  provider: OAuthProvider,
  message: string,
  oauthError?: OAuthError['oauthError']
): OAuthError => ({
  type: 'oauth_error',
  message,
  provider,
  oauthError,
  timestamp: new Date().toISOString(),
});

export const isSessionExpired = (session: EnhancedAuthSession): boolean => {
  return Date.now() >= session.expires_at * 1000;
};

export const getSessionTimeRemaining = (session: EnhancedAuthSession): number => {
  return Math.max(0, session.expires_at * 1000 - Date.now());
};