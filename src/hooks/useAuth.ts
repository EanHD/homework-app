import { useEffect, useCallback } from 'react';
import { 
  useAuthStore,
  useIsAuthenticated,
  useAuthUser,
  useAuthLoading,
  useAuthError,
  useAuthProviders,
  type OAuthProvider 
} from '../store/auth';

/**
 * Enhanced authentication hook with OAuth support
 * Provides lazy initialization and convenient action wrappers
 * Replaces previous useState-based implementation with Zustand store
 */
export interface UseAuthReturn {
  // State
  user: any | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  providers: OAuthProvider[];
  lastActivityAt: string | null;

  // Actions
  signInMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithProvider: (provider: OAuthProvider) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  handleOAuthCallback: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;

  // Convenience helpers
  hasGoogle: boolean;
  hasApple: boolean;
  hasAnyProvider: boolean;
  isProviderEnabled: (provider: OAuthProvider) => boolean;
  getProviders: () => OAuthProvider[];

  // Legacy compatibility
  loading: boolean; // alias for isLoading
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: string | null }>; // legacy compat
}

export function useAuth(): UseAuthReturn {
  const store = useAuthStore();
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const providers = useAuthProviders();

  // Lazy initialization - initialize auth on first use if not already done
  useEffect(() => {
    if (!store.isInitialized) {
      store.initialize();
    }
  }, [store.isInitialized, store.initialize]);

  // Network online recovery: attempt refresh when connection is restored
  useEffect(() => {
    const onOnline = () => {
      // Only refresh if we believe we're authenticated but might have stale session
      if (store.isInitialized && store.isAuthenticated) {
        store.refresh();
      } else if (store.isInitialized && !store.isAuthenticated) {
        // Try a lightweight initialize again in case storage had a session
        store.refresh();
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [store.isInitialized, store.isAuthenticated, store.refresh]);

  // Page visibility: when returning to tab after >10m, refresh session
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        const last = store.lastActivityAt ? new Date(store.lastActivityAt).getTime() : 0;
        if (Date.now() - last > 10 * 60 * 1000) {
          store.refresh();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [store.lastActivityAt, store.refresh]);

  // Wrapped actions with consistent return types
  const signInMagicLink = useCallback(async (email: string) => {
    return await store.signInMagicLink(email);
  }, [store.signInMagicLink]);

  const signInWithProvider = useCallback(async (provider: OAuthProvider) => {
    return await store.signInWithProvider(provider);
  }, [store.signInWithProvider]);

  const handleOAuthCallback = useCallback(async () => {
    return await store.handleOAuthCallback();
  }, [store.handleOAuthCallback]);

  const signOut = useCallback(async () => {
    await store.signOut();
  }, [store.signOut]);

  const refresh = useCallback(async () => {
    await store.refresh();
  }, [store.refresh]);

  // Legacy compatibility wrapper
  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    const result = await signInWithProvider(provider as OAuthProvider);
    return { error: result.success ? null : (result.error || 'OAuth sign-in failed') };
  }, [signInWithProvider]);

  // Convenience helpers
  const hasGoogle = providers.includes('google');
  const hasApple = providers.includes('apple');
  const hasAnyProvider = providers.length > 0;
  const isProviderEnabled = store.isProviderEnabled;
  const getProviders = store.getProviders;

  return {
    // State
    user,
    session: store.session,
    isAuthenticated,
    isLoading,
    isInitialized: store.isInitialized,
    error,
    providers,
    lastActivityAt: store.lastActivityAt,

    // Actions
    signInMagicLink,
    signInWithProvider,
    handleOAuthCallback,
    signOut,
    refresh,

    // Provider helpers
    hasGoogle,
    hasApple,
    hasAnyProvider,
    isProviderEnabled,
    getProviders,

    // Legacy compatibility
    loading: isLoading,
    signInWithOAuth,
  };
}