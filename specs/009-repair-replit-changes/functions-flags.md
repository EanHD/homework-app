# Supabase Functions: JWT Flags Enumeration (T009)

This documents each Edge Function and its JWT verification setting as defined in `deno.json` and inline `export const config` overrides.

Note: In this repo, inline `export const config = { verify_jwt: false }` in `index.ts` overrides `deno.json` settings at runtime.

- subscribe
  - Path: `supabase/functions/subscribe/`
  - deno.json: `{"deploy":{"verify_jwt": true}}`
  - index.ts: `export const config = { verify_jwt: false }`
  - Effective: `verify_jwt = false`

- schedule
  - Path: `supabase/functions/schedule/`
  - deno.json: `{"deploy":{"verify_jwt": true}}`
  - index.ts: `export const config = { verify_jwt: false }`
  - Effective: `verify_jwt = false`

- send-notifications
  - Path: `supabase/functions/send-notifications/`
  - deno.json: `{"deploy":{"verify_jwt": true}}`
  - index.ts: `export const config = { verify_jwt: false }`
  - Effective: `verify_jwt = false`

Additional context:
- CORS allowlist is defined in `supabase/functions/_shared/cors.ts` and includes localhost, Vite preview, GitHub Pages origin, and a Replit preview domain.
- If desired later, enabling JWT globally would require aligning `deno.json` and removing/adjusting the inline `config` overrides.
