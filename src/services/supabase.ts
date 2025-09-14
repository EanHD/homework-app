import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { getRuntimeConfig } from '../config';

// Types for our auth flow
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

let client: SupabaseClient | null = null;

export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (client) return client;
  const cfg = await getRuntimeConfig();
  
  // Try to get Supabase URL from config.json first, then fall back to env
  const url = (cfg as any).supabaseUrl || (import.meta as any)?.env?.VITE_SUPABASE_URL;
  const anon = (cfg as any).supabaseAnonKey || (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    throw new Error('Missing Supabase runtime config: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }
  client = createClient(url, anon);
  return client;
}

export async function signInWithOtp(email: string) {
  const s = await getSupabaseClient();
  return s.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: window.location.origin.includes('github.io') 
        ? `${window.location.origin}/homework-app/`
        : `${window.location.origin}/`
    }
  });
}

export async function signInWithOAuth(provider: 'google' | 'apple') {
  const s = await getSupabaseClient();
  return s.auth.signInWithOAuth({ 
    provider,
    options: {
      redirectTo: window.location.origin.includes('github.io') 
        ? `${window.location.origin}/homework-app/`
        : `${window.location.origin}/`
    }
  });
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
 * Enhanced Auth helpers for the application
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
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(provider: 'google' | 'apple'): Promise<AuthResponse> {
    try {
      const { data, error } = await signInWithOAuth(provider);

      if (error) {
        return { session: null, user: null, error: error.message }
      }

      // OAuth sign-in redirects, so session will be null initially
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
  static async onAuthStateChange(callback: (session: AuthSession | null, user: User | null) => void) {
    const s = await getSupabaseClient();
    const { data } = s.auth.onAuthStateChange((event, session) => {
      callback(session ? session as AuthSession : null, session?.user || null)
    })
    return { data }
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
