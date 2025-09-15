# Authentication Contracts

## OAuth Provider Integration Contract

```typescript
interface OAuthProviderConfig {
  google: {
    enabled: boolean;
    clientId: string;
    redirectUrl: string;
    scopes: string[];
  };
  apple: {
    enabled: boolean;
    serviceId: string;
    redirectUrl: string;
    keyId: string;
  };
}

interface AuthenticationService {
  // OAuth sign-in methods
  signInWithGoogle(): Promise<AuthResult>;
  signInWithApple(): Promise<AuthResult>;
  
  // Existing magic link functionality (preserve)
  signInWithMagicLink(email: string): Promise<void>;
  
  // Common auth state
  getCurrentUser(): User | null;
  signOut(): Promise<void>;
}

interface AuthResult {
  user: User;
  session: Session;
  error?: AuthError;
}
```

## Auth State Management Contract

```typescript
interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
}
```

## Expected Behaviors

### OAuth Sign-In Flow
1. User clicks OAuth provider button
2. Redirect to provider authorization page
3. User grants permissions
4. Redirect back to app with auth code
5. Exchange code for tokens via Supabase
6. Update auth state and redirect to dashboard
7. Handle errors gracefully with user feedback

### Backward Compatibility
- Magic link authentication must continue working
- Existing user sessions preserved
- No breaking changes to auth state structure
- Fallback to magic link if OAuth unavailable