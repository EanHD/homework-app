/**
 * OAuth Authentication Service Implementation
 *
 * Comprehensive OAuth integration with session management,
 * user profile handling, and enhanced auth flows for v1 release
 */

import { AuthService as SupabaseAuthService, AuthResponse, AuthSession } from './supabase';
import { ApiService } from './supabase';
import type { 
  EnhancedUser, 
  OAuthProvider, 
  AuthResult,
  AuthState,
  AuthError,
  SignInCredentials,
  OAuthSignInOptions,
  EnhancedAuthSession
} from '../models/auth.enhanced';
import type { User } from '../types/user';

/**
 * Enhanced Authentication Service
 * Integrates OAuth providers with enhanced user management
 */
export class AuthenticationService {
  private static instance: AuthenticationService;
  private authState: AuthState;
  private listeners: Set<(state: AuthState) => void> = new Set();

  private constructor() {
    this.authState = {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,
      error: null,
      lastActivityAt: null,
    };
  }

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Initialize the authentication service
   */
  async initialize(): Promise<void> {
    this.updateState({ isLoading: true });

    try {
      // Check for existing session
      const { session, user, error } = await SupabaseAuthService.getSession();

      if (error) {
        throw new Error(error);
      }

      // Convert Supabase session to enhanced session
      const enhancedSession = session ? this.convertToEnhancedSession(session) : null;
      const enhancedUser = user ? await this.enhanceUser(user) : null;

      this.updateState({
        session: enhancedSession,
        user: enhancedUser,
        isAuthenticated: !!enhancedUser,
        isInitialized: true,
        isLoading: false,
        error: null,
        lastActivityAt: new Date().toISOString(),
      });

      // Set up auth state listener
      this.setupAuthListener();

    } catch (error) {
      const authError = this.createAuthError('oauth_error', error instanceof Error ? error.message : 'Failed to initialize auth');
      this.updateState({
        isInitialized: true,
        isLoading: false,
        error: authError,
      });
    }
  }

  /**
   * Sign in with email/password
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    this.updateState({ isLoading: true, error: null });

    try {
      // For now, we only support magic link sign-in
      if ('email' in credentials) {
        const result = await SupabaseAuthService.signInWithMagicLink(credentials.email);
        
        if (result.error) {
          throw new Error(result.error);
        }

        // Magic link sent successfully
        return {
          success: true,
          user: null,
          session: null,
          error: null
        };
      }

      throw new Error('Email is required for sign-in');

    } catch (error) {
      const authError = this.createAuthError('invalid_credentials', error instanceof Error ? error.message : 'Sign-in failed');
      this.updateState({ isLoading: false, error: authError });
      
      return {
        success: false,
        user: null,
        session: null,
        error: authError
      };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: OAuthProvider, options?: OAuthSignInOptions): Promise<AuthResult> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Check if provider is enabled
      if (!SupabaseAuthService.isOAuthProviderEnabled(provider)) {
        throw new Error(`OAuth provider '${provider}' is not configured`);
      }

      const result = await SupabaseAuthService.signInWithOAuth(provider);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // OAuth sign-in will redirect, so we don't update state here
      // The state will be updated when the user returns from OAuth callback
      return {
        success: true,
        user: null,
        session: null,
        error: null,
        redirectTo: 'oauth_provider'
      };

    } catch (error) {
      const authError = this.createAuthError('oauth_error', error instanceof Error ? error.message : 'OAuth sign-in failed');
      this.updateState({ isLoading: false, error: authError });
      
      return {
        success: false,
        user: null,
        session: null,
        error: authError
      };
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(): Promise<AuthResult> {
    this.updateState({ isLoading: true, error: null });

    try {
      const result = await SupabaseAuthService.handleOAuthCallback();
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.session || !result.user) {
        throw new Error('No session found in OAuth callback');
      }

      // Convert and enhance the session and user
      const enhancedSession = this.convertToEnhancedSession(result.session);
      const enhancedUser = await this.enhanceUser(result.user);

      this.updateState({
        session: enhancedSession,
        user: enhancedUser,
        isAuthenticated: true,
        isLoading: false,
        lastActivityAt: new Date().toISOString(),
      });

      return {
        success: true,
        user: enhancedUser,
        session: enhancedSession,
        error: null
      };

    } catch (error) {
      const authError = this.createAuthError('oauth_error', error instanceof Error ? error.message : 'OAuth callback failed');
      this.updateState({ isLoading: false, error: authError });
      
      return {
        success: false,
        user: null,
        session: null,
        error: authError
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    this.updateState({ isLoading: true });

    try {
      const result = await SupabaseAuthService.signOut();
      
      if (result.error) {
        throw new Error(result.error);
      }

      this.updateState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivityAt: null,
      });

    } catch (error) {
      const authError = this.createAuthError('network_error', error instanceof Error ? error.message : 'Sign-out failed');
      this.updateState({ isLoading: false, error: authError });
      throw error;
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthResult> {
    try {
      const { session, user, error } = await SupabaseAuthService.getSession();

      if (error) {
        throw new Error(error);
      }

      if (!session || !user) {
        // Session expired, sign out
        await this.signOut();
        return {
          success: false,
          user: null,
          session: null,
          error: this.createAuthError('session_expired', 'Session has expired')
        };
      }

      const enhancedSession = this.convertToEnhancedSession(session);
      const enhancedUser = await this.enhanceUser(user);

      this.updateState({
        session: enhancedSession,
        user: enhancedUser,
        lastActivityAt: new Date().toISOString(),
      });

      return {
        success: true,
        user: enhancedUser,
        session: enhancedSession,
        error: null
      };

    } catch (error) {
      const authError = this.createAuthError('session_expired', error instanceof Error ? error.message : 'Session refresh failed');
      this.updateState({ error: authError });
      
      return {
        success: false,
        user: null,
        session: null,
        error: authError
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<EnhancedUser>): Promise<EnhancedUser> {
    if (!this.authState.user) {
      throw new Error('No authenticated user');
    }

    try {
      // Update profile via API
      const { profile, error } = await ApiService.updateUserProfile({
        display_name: updates.display_name || updates.full_name
      });

      if (error) {
        throw new Error(error);
      }

      // Update local user state
      const updatedUser: EnhancedUser = {
        ...this.authState.user,
        ...updates
      };

      this.updateState({
        user: updatedUser,
        lastActivityAt: new Date().toISOString(),
      });

      return updatedUser;

    } catch (error) {
      const authError = this.createAuthError('network_error', error instanceof Error ? error.message : 'Profile update failed');
      this.updateState({ error: authError });
      throw error;
    }
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get available OAuth providers
   */
  getAvailableOAuthProviders(): OAuthProvider[] {
    return SupabaseAuthService.getAvailableOAuthProviders();
  }

  /**
   * Check if OAuth provider is enabled
   */
  isOAuthProviderEnabled(provider: OAuthProvider): boolean {
    return SupabaseAuthService.isOAuthProviderEnabled(provider);
  }

  // Private methods

  private updateState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  private async setupAuthListener(): Promise<void> {
    // Set up Supabase auth state listener
    SupabaseAuthService.onAuthStateChange(async (session, user) => {
      const enhancedSession = session ? this.convertToEnhancedSession(session) : null;
      const enhancedUser = user ? await this.enhanceUser(user) : null;

      this.updateState({
        session: enhancedSession,
        user: enhancedUser,
        isAuthenticated: !!enhancedUser,
        lastActivityAt: enhancedUser ? new Date().toISOString() : null,
      });
    });
  }

  private convertToEnhancedSession(session: AuthSession): EnhancedAuthSession {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      token_type: 'bearer',
      user: {
        ...session.user,
        account_status: 'active' as const
      },
      session_id: `session_${Date.now()}`,
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      ip_address: undefined, // Would be set by server
      user_agent: navigator.userAgent,
    };
  }

  private async enhanceUser(user: User): Promise<EnhancedUser> {
    // Get additional user profile data
    const { profile } = await ApiService.getUserProfile();

    return {
      id: user.id,
      email: user.email || '',
      display_name: profile?.display_name || user.display_name || user.email?.split('@')[0] || '',
      full_name: user.display_name || profile?.display_name || '',
      first_name: '',
      last_name: '',
      avatar_url: undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language || 'en',
      created_at: user.created_at || new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      account_status: 'active' as const,
      oauth_providers: [],
      primary_oauth_provider: undefined,
      theme_preference: 'auto' as const,
      email_notifications_enabled: true,
      push_notifications_enabled: false,
    };
  }

  private createAuthError(type: 'invalid_credentials' | 'oauth_error' | 'network_error' | 'session_expired', message: string): AuthError {
    return {
      code: type,
      message,
      type,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const authService = AuthenticationService.getInstance();

// Export convenience functions
export const signIn = (credentials: SignInCredentials) => authService.signIn(credentials);
export const signInWithOAuth = (provider: OAuthProvider, options?: OAuthSignInOptions) => authService.signInWithOAuth(provider, options);
export const signOut = () => authService.signOut();
export const refreshSession = () => authService.refreshSession();
export const updateProfile = (updates: Partial<EnhancedUser>) => authService.updateProfile(updates);
export const getAuthState = () => authService.getState();
export const subscribeToAuth = (listener: (state: AuthState) => void) => authService.subscribe(listener);
export const handleOAuthCallback = () => authService.handleOAuthCallback();
export const getAvailableOAuthProviders = () => authService.getAvailableOAuthProviders();
export const isOAuthProviderEnabled = (provider: OAuthProvider) => authService.isOAuthProviderEnabled(provider);

// Initialize auth service (call this in your app initialization)
export const initializeAuth = () => authService.initialize();