# Contract: Auth (Supabase-backed)

This document describes how the frontend integrates with Supabase Auth.

1) Frontend uses `@supabase/supabase-js` to:
   - signInWithOtp (magic link) via `supabase.auth.signInWithOtp({ email })`
   - signInWithOAuth via `supabase.auth.signInWithOAuth({ provider: 'google'|'apple' })`
   - manage session via `supabase.auth.getSession()` / `onAuthStateChange`

2) Backend verification:
   - Edge functions that accept user actions MUST verify JWT from Supabase and extract `user.id`.

Errors:
- 401 when JWT missing/invalid
- 403 when action forbidden
