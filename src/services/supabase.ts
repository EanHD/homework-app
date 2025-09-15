import { createClient, SupabaseClient, Session, User, Provider } from '@supabase/supabase-js';
import { getRuntimeConfig } from '../config';
import type { 
  EnhancedUser, 
  OAuthProvider, 
  EnhancedAuthSession,
  AuthResult,
  AuthConfig,
  AuthError
} from '../models/auth.enhanced';
import type { AppConfig } from '../models/config.enhanced';

// Session types for our service (simplified for Supabase integration)
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  user: User;
}

export interface AuthResponse {
  session: AuthSession | null;
  user: User | null;
  error: string | null;
}

// OAuth configuration for production
const OAUTH_CONFIG = {
  redirectTo: window.location.origin.includes('github.io') 
    ? `${window.location.origin}/homework-app/`
    : `${window.location.origin}/`,
  queryParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
  scopes: 'openid profile email'
} as const;

let client: SupabaseClient | null = null;

// Internal guard to avoid duplicate magic link consumption
let magicLinkConsumed = false;

export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (client) return client;
  
  const cfg = await getRuntimeConfig();
  
  // Try to get Supabase URL from config.json first, then fall back to env
  const url = (cfg as any).supabaseUrl || (import.meta as any)?.env?.VITE_SUPABASE_URL;
  const anon = (cfg as any).supabaseAnonKey || (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    throw new Error('Missing Supabase runtime config: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }
  
  // Create client with enhanced OAuth configuration
  client = createClient(url, anon, {
    auth: {
      // Enhanced auth configuration for OAuth
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'X-Client-Info': 'homework-app@1.0.0'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  
  return client;
}

/**
 * Detect and verify Supabase magic link style URLs that contain token_hash & type params.
 * Supabase JS client only auto-detects fragment URLs with access_token when detectSessionInUrl is true.
 * When using custom email templates (ConfirmationURL) the link often comes as
 *   https://app.example.com/?token_hash=...&type=magiclink&email=you%40mail.com
 * or sometimes inside the hash portion. We manually verify and then clean the URL.
 * Returns true if a verification attempt was made (success or failure), false otherwise.
 */
export async function consumeMagicLinkIfPresent(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (magicLinkConsumed) return false;
  try {
    const loc = window.location;
    const searchParams = new URLSearchParams(loc.search);
    // Some providers may place params after '#'
    if ((!searchParams.get('token_hash') || !searchParams.get('type')) && loc.hash.includes('token_hash')) {
      const hashPart = loc.hash.startsWith('#') ? loc.hash.slice(1) : loc.hash;
      // If hash contains '?' use portion after '?', else treat whole hash as query string
      const qs = hashPart.includes('?') ? hashPart.split('?')[1] : hashPart;
      const hashParams = new URLSearchParams(qs);
      // Merge missing values from hash
      if (!searchParams.get('token_hash') && hashParams.get('token_hash')) searchParams.set('token_hash', hashParams.get('token_hash')!);
      if (!searchParams.get('type') && hashParams.get('type')) searchParams.set('type', hashParams.get('type')!);
      if (!searchParams.get('email') && hashParams.get('email')) searchParams.set('email', hashParams.get('email')!);
    }
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') as any; // magiclink | signup | recovery | invite
    const email = searchParams.get('email');
    if (!tokenHash || !type || !email) return false;
    magicLinkConsumed = true;
    const s = await getSupabaseClient();
    // verifyOtp expects a type union; we cast conservatively
    await s.auth.verifyOtp({ type, token_hash: tokenHash, email });
    // Clean URL (remove sensitive params) preserving path/base
    try {
      const cleanUrl = OAUTH_CONFIG.redirectTo;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch {}
    return true;
  } catch (e) {
    // Do not block app if verification fails; just log in dev
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[auth] magic link verification failed', e);
    }
    return false;
  }
}

export async function signInWithOtp(email: string) {
  const s = await getSupabaseClient();
  return s.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: OAUTH_CONFIG.redirectTo
    }
  });
}

export async function signInWithOAuth(provider: OAuthProvider) {
  const s = await getSupabaseClient();
  
  // Enhanced OAuth configuration per provider
  let queryParams: Record<string, string> = { 
    access_type: 'offline',
    prompt: 'consent'
  };
  
  // Provider-specific configurations
  if (provider === 'apple') {
    queryParams.response_mode = 'form_post';
  }
  
  const providerConfig = {
    provider: provider as Provider,
    options: {
      redirectTo: OAUTH_CONFIG.redirectTo,
      scopes: OAUTH_CONFIG.scopes,
      queryParams
    }
  };
  
  return s.auth.signInWithOAuth(providerConfig);
}

export async function getSession() {
  const s = await getSupabaseClient();
  const r = await s.auth.getSession();
  return r;
}

export async function onAuthStateChange(cb: (event: string, session: any) => void) {
  const s = await getSupabaseClient();
  return s.auth.onAuthStateChange((event, session) => cb(event, session));
}

/**
 * Enhanced Auth Service for v1 production
 * Integrates with enhanced auth models and provides OAuth support
 */
export class AuthService {
  /**
   * Sign in with magic link
   */
  static async signInWithMagicLink(email: string): Promise<AuthResponse> {
    try {
      const { data, error } = await signInWithOtp(email);

      if (error) {
        return { session: null, user: null, error: error.message }
      }

      return { 
        session: data.session ? data.session as AuthSession : null, 
        user: data.user, 
        error: null 
      }
    } catch (error) {
      return { 
        session: null, 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Sign in with OAuth provider - Enhanced for v1
   */
  static async signInWithOAuth(provider: OAuthProvider): Promise<AuthResponse> {
    try {
      const { data, error } = await signInWithOAuth(provider);

      if (error) {
        return { session: null, user: null, error: error.message }
      }

      // OAuth sign-in redirects, so session will be null initially
      // The session will be available after redirect callback
      return { session: null, user: null, error: null }
    } catch (error) {
      return { 
        session: null, 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Handle OAuth callback after redirect
   */
  static async handleOAuthCallback(): Promise<AuthResponse> {
    try {
      const s = await getSupabaseClient();
      
      // Get the session from the URL hash or query parameters
      const { data: { session }, error } = await s.auth.getSession();
      
      if (error) {
        return { session: null, user: null, error: error.message };
      }

      if (!session) {
        return { session: null, user: null, error: 'No session found in OAuth callback' };
      }

      return { 
        session: session as AuthSession, 
        user: session.user, 
        error: null 
      };
    } catch (error) {
      return { 
        session: null, 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get available OAuth providers
   */
  static getAvailableOAuthProviders(): OAuthProvider[] {
    // In production, this could be configured via environment variables
    const providers: OAuthProvider[] = [];
    
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      providers.push('google');
    }
    
    if (import.meta.env.VITE_APPLE_CLIENT_ID) {
      providers.push('apple');
    }
    
    return providers;
  }

  /**
   * Check if OAuth provider is enabled
   */
  static isOAuthProviderEnabled(provider: OAuthProvider): boolean {
    const availableProviders = this.getAvailableOAuthProviders();
    return availableProviders.includes(provider);
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const s = await getSupabaseClient();
      const { error } = await s.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<AuthResponse> {
    try {
      const { data: { session }, error } = await getSession();
      
      if (error) {
        return { session: null, user: null, error: error.message }
      }

      return { 
        session: session ? session as AuthSession : null, 
        user: session?.user || null, 
        error: null 
      }
    } catch (error) {
      return { 
        session: null, 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const s = await getSupabaseClient();
      const { data: { user }, error } = await s.auth.getUser()
      
      if (error) {
        return { user: null, error: error.message }
      }

      return { user, error: null }
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (session: AuthSession | null, user: User | null) => void) {
    // Return a promise that resolves with the subscription data
    return getSupabaseClient().then(s => {
      const { data } = s.auth.onAuthStateChange((event, session) => {
        callback(session ? session as AuthSession : null, session?.user || null)
      })
      return { data }
    })
  }
}

/**
 * API helpers for authenticated requests
 */
export class ApiService {
  /**
   * Get authorization header for authenticated requests
   */
  private static async getAuthHeaders(): Promise<{ Authorization?: string }> {
    const { data: { session } } = await getSession()
    
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` }
    }
    
    return {}
  }

  /**
   * Subscribe to push notifications
   */
  static async subscribe(subscription: any, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = await this.getAuthHeaders()
      const cfg = await getRuntimeConfig();
      const functionsBase = (cfg as any).functionsBase || '';
      
      const body: any = { subscription }
      if (userId) {
        body.user_id = userId
      }

      const response = await fetch(`${functionsBase}/functions/v1/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Subscription failed' }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Schedule a notification
   */
  static async scheduleNotification(
    title: string, 
    body: string, 
    sendAt: Date, 
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = await this.getAuthHeaders()
      const cfg = await getRuntimeConfig();
      const functionsBase = (cfg as any).functionsBase || '';
      
      const requestBody: any = {
        title,
        body,
        send_at: sendAt.toISOString()
      }
      
      if (userId) {
        requestBody.user_id = userId
      }

      const response = await fetch(`${functionsBase}/functions/v1/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Scheduling failed' }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(): Promise<{ profile: any | null; error?: string }> {
    try {
      const headers = await this.getAuthHeaders()
      const cfg = await getRuntimeConfig();
      const functionsBase = (cfg as any).functionsBase || '';
      
      const response = await fetch(`${functionsBase}/functions/v1/user-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { profile: null, error: errorData.error || 'Failed to fetch profile' }
      }

      const profile = await response.json()
      return { profile, error: undefined }
    } catch (error) {
      return { 
        profile: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: { display_name?: string }): Promise<{ profile: any | null; error?: string }> {
    try {
      const headers = await this.getAuthHeaders()
      const cfg = await getRuntimeConfig();
      const functionsBase = (cfg as any).functionsBase || '';
      
      const response = await fetch(`${functionsBase}/functions/v1/user-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { profile: null, error: errorData.error || 'Failed to update profile' }
      }

      const profile = await response.json()
      return { profile, error: undefined }
    } catch (error) {
      return { 
        profile: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }
}
