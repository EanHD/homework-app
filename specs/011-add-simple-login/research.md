# Research: Auth choices for Homework App

## Decision
Use Supabase Auth as the MVP authentication provider, enabling Email (magic link) and Social providers (Google, Apple) where available.

## Rationale
- Supabase Auth is managed and integrates with the existing Supabase backend used by this project.
- Magic links avoid password handling on the client and reduce friction for non-technical users.
- Social providers (Google, Apple) provide convenience and reduce friction further for users who prefer them.
- Minimal server-side code changes required: add `user_id` mapping to existing tables and minor permission checks.

## Alternatives Considered
- Roll-your-own email/password system: rejected due to security and maintenance burden.
- Third-party OAuth only: rejected for MVP due to users who may not have Google/Apple accounts.

## Implementation notes
- Frontend: use `@supabase/supabase-js` to sign-in and manage session state.
- Backend: use Supabase Postgres to store `user_id` on `push_subscriptions` and `scheduled_notifications`. Update Edge Functions to accept authenticated requests.
- Testing: add contract tests that assert endpoints require auth or accept `userId` in the payload when authenticated.
