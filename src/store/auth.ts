import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';
import type { AuthSession } from '../services/supabase';
import { 
  initializeAuth as serviceInitialize,
  signIn as serviceSignIn,
  signInWithOAuth as serviceSignInWithOAuth,
  signOut as serviceSignOut,
  refreshSession as serviceRefreshSession,
  handleOAuthCallback as serviceHandleOAuthCallback,
  getAuthState as serviceGetAuthState,
  subscribeToAuth as serviceSubscribe,
  getAvailableOAuthProviders,
  isOAuthProviderEnabled
} from '../services/auth';

// Minimal re-declared types from enhanced auth models to avoid premature coupling
// (Full enhanced models live in models/auth.enhanced.ts but are not required directly here.)
export type OAuthProvider = 'google' | 'apple';

export interface EnhancedAuthSession extends AuthSession {
  session_id?: string;
}

export interface AuthStoreState {
  user: User | null;
  session: EnhancedAuthSession | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  availableProviders: OAuthProvider[];
  lastActivityAt: string | null;
  hasRehydrated: boolean; // indicates persisted state loaded
}

export interface AuthStoreActions {
  initialize: () => Promise<void>;
  signInMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithProvider: (provider: OAuthProvider) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  handleOAuthCallback: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  getProviders: () => OAuthProvider[];
  isProviderEnabled: (p: OAuthProvider) => boolean;
}

type AuthStore = AuthStoreState & AuthStoreActions;

const initialState: AuthStoreState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
  availableProviders: [],
  lastActivityAt: null,
  hasRehydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      async initialize() {
        if (get().isInitialized) return;
        // If we have rehydrated persisted user, mark as provisional session while we validate
        const hasPersistedUser = !!get().user;
        set({ isLoading: true, isAuthenticated: hasPersistedUser && !!get().user });
        await serviceInitialize();
        const s = serviceGetAuthState();
        set({
          user: s.user as any,
          session: s.session as any,
          isAuthenticated: !!s.user,
          isInitialized: true,
          isLoading: false,
          error: s.error ? (typeof s.error === 'string' ? s.error : s.error.message) : null,
          availableProviders: getAvailableOAuthProviders() as OAuthProvider[],
          lastActivityAt: s.lastActivityAt || null,
          hasRehydrated: true,
        });
        // subscribe after initial pull
        serviceSubscribe((state) => {
          set({
            user: state.user as any,
            session: state.session as any,
            isAuthenticated: !!state.user,
            error: state.error ? (typeof state.error === 'string' ? state.error : state.error.message) : null,
            lastActivityAt: state.lastActivityAt || null,
          });
        });

        // Schedule a background refresh if last activity is stale (> 15 min)
        try {
          const lastRaw = get().lastActivityAt;
          const last = lastRaw ? new Date(lastRaw as string).getTime() : 0;
          if (Date.now() - last > 15 * 60 * 1000) {
            void get().refresh();
          }
        } catch {}
      },

      async signInMagicLink(email) {
        set({ isLoading: true, error: null });
        // SignInCredentials in enhanced model may require unused fields; cast to any to avoid tight coupling
        const res = await serviceSignIn({ email } as any);
        if (!res.success) {
          set({ isLoading: false, error: res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'Sign-in failed' });
          return { success: false, error: res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'Sign-in failed' };
        }
        // Magic link sent; stay unauthenticated until user clicks link
        set({ isLoading: false });
        return { success: true };
      },

      async signInWithProvider(provider) {
        set({ isLoading: true, error: null });
        try {
          const res = await serviceSignInWithOAuth(provider);
          if (!res.success) {
            set({ isLoading: false, error: res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'OAuth failed' });
            return { success: false, error: res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'OAuth failed' };
          }
          // Redirect will happen externally
          return { success: true, redirectTo: res.redirectTo };
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'OAuth sign-in error';
            set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },

      async handleOAuthCallback() {
        set({ isLoading: true, error: null });
        const res = await serviceHandleOAuthCallback();
        if (!res.success) {
          set({ isLoading: false, error: res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'OAuth callback failed' });
          return { success: false, error: res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'OAuth callback failed' };
        }
        const s = serviceGetAuthState();
        set({
          user: s.user as any,
          session: s.session as any,
          isAuthenticated: !!s.user,
          isLoading: false,
          error: null,
          lastActivityAt: s.lastActivityAt || null,
        });
        return { success: true };
      },

      async signOut() {
        set({ isLoading: true });
        try {
          await serviceSignOut();
        } finally {
          const s = serviceGetAuthState();
          set({
            user: s.user as any,
            session: s.session as any,
            isAuthenticated: !!s.user,
            isLoading: false,
            error: s.error ? (typeof s.error === 'string' ? s.error : s.error.message) : null,
            lastActivityAt: s.lastActivityAt || null,
          });
        }
      },

      async refresh() {
        try {
          await serviceRefreshSession();
        } finally {
          const s = serviceGetAuthState();
          set({
            user: s.user as any,
            session: s.session as any,
            isAuthenticated: !!s.user,
            error: s.error ? (typeof s.error === 'string' ? s.error : s.error.message) : null,
            lastActivityAt: s.lastActivityAt || null,
          });
        }
      },

      getProviders() {
        const providers = getAvailableOAuthProviders() as OAuthProvider[];
        // keep state in sync if changed
        if (providers.join(',') !== get().availableProviders.join(',')) {
          set({ availableProviders: providers });
        }
        return providers;
      },

      isProviderEnabled(p) {
        return isOAuthProviderEnabled(p);
      },
    }),
    {
      name: 'auth-store-v1',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        lastActivityAt: state.lastActivityAt,
        hasRehydrated: state.hasRehydrated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Mark as rehydrated so UI can optimistically show authenticated shell while validation runs
          state.hasRehydrated = true;
        }
      },
    }
  )
);

// Selector helpers
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthUser = () => useAuthStore((s) => s.user);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);
export const useAuthError = () => useAuthStore((s) => s.error);
export const useAuthProviders = () => useAuthStore((s) => s.availableProviders);
