
# Tasks: Add simple login screen (011-add-simple-login)

**Feature dir (input)**: /home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login
**Prereqs**: plan.md (present), research.md, data-model.md, contracts/*, quickstart.md

Follow TDD: write tests first (they should fail), then implement. Use the repo conventions and keep edits focused to the files listed in each task.

Phase 3.1: Setup

- [x] T001 — Setup: Add frontend Supabase client dependency and docs
  - Description: Add `@supabase/supabase-js` to project `package.json` (dev note only; run `npm install` manually). Update `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/quickstart.md` with the exact `npm`/`pnpm` command and env var names to set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Files: `/home/eanhd/projects/homework-app/homework-app/package.json`, `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/quickstart.md`
  - Acceptance: Quickstart includes exact install command and env var names. (No code change required to `package.json` by the agent unless requested.)

Phase 3.2: Tests First (TDD) — Contract & integration tests (parallel where safe)

- [x] [P] T002 — Contract test: Auth endpoints (auth.contract.spec.ts)
  - Description: Create a contract test asserting expected behavior of auth-related flows per `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/contracts/auth.md` (e.g., `supabase.auth` usage, JWT presence). Tests should assert 401 on protected endpoints when no token provided.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/contracts/auth.contract.spec.ts`
  - Acceptance: Test compiles and fails (no implementation yet).

- [x] [P] T003 — Contract test: Subscribe endpoint (subscribe.contract.spec.ts)
  - Description: Create a contract test for `/subscribe` behavior per `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/contracts/subscribe.md`. Assert required fields and 401 when auth is required.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/contracts/subscribe.contract.spec.ts`
  - Acceptance: Test compiles and fails.

- [x] [P] T004 — Contract test: Schedule endpoint (schedule.contract.spec.ts)
  - Description: Create a contract test for `/schedule` behavior per `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/contracts/schedule.md` (create/update scheduled notifications). Assert required fields and 401 when auth is required.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/contracts/schedule.contract.spec.ts`
  - Acceptance: Test compiles and fails.

- [x] [P] T005 — Contract test: User-profile (user-profile.contract.spec.ts)
  - Description: Create a contract test for user profile endpoints (read/update) per `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/contracts/user-profile.md`.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/contracts/user-profile.contract.spec.ts`
  - Acceptance: Test compiles and fails.

Phase 3.3: Core Implementation (after tests fail)

- [x] T006 — DB Migration: create `users` table and add `user_id` FKs
  - Description: Implement SQL migration to create `users` table and add `user_id` columns to `push_subscriptions` and `scheduled_notifications`. Provide rollback SQL and make the migration idempotent using `IF NOT EXISTS` checks.
  - Files: `/home/eanhd/projects/homework-app/homework-app/supabase/migrations/20250912_add_users_and_user_id.sql`, `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/data-model.md`
  - Acceptance: SQL file exists with create/alter statements and rollback comments; quickstart updated with `psql` commands to apply the migration.

- [x] T007 — Create TypeScript types/models for entities [P]
  - Description: Add lightweight type definitions for `User`, `PushSubscription`, and `ScheduledNotification` to be used by frontend and tests.
  - Files: `/home/eanhd/projects/homework-app/homework-app/src/types/user.ts`, `/home/eanhd/projects/homework-app/homework-app/src/types/subscription.ts`, `/home/eanhd/projects/homework-app/homework-app/src/types/scheduledNotification.ts`
  - Acceptance: Types compile with project types; tests can import them.

- [x] T008 — Update Supabase Edge functions to validate auth
  - Description: Modify Edge Functions to verify Supabase JWT and extract `user.id`. Functions to edit: `/home/eanhd/projects/homework-app/homework-app/supabase/functions/subscribe/index.ts`, `/home/eanhd/projects/homework-app/homework-app/supabase/functions/schedule/index.ts`, and update `/home/eanhd/projects/homework-app/homework-app/supabase/functions/send-notifications/index.ts` to respect `user_id` when scheduling.
  - Files: those listed above
  - Acceptance: Functions check for JWT and return 401 when missing/invalid (tests from Phase 3.2 should fail until this is implemented, then pass).

- [x] T009 — Backend: accept/associate `user_id` in subscribe/schedule endpoints
  - Description: When authenticated, endpoints should persist `user_id` on `push_subscriptions` and `scheduled_notifications`. When no user, allow `null` for backward compatibility.
  - Files: same as T008 plus DB access layer in `/home/eanhd/projects/homework-app/homework-app/supabase/functions/*`
  - Acceptance: New rows include `user_id` for authenticated requests; contract tests updated to assert this.

Phase 3.4: Frontend Implementation

- [x] T010 — Add Supabase client & config (frontend)
  - Description: Create `/home/eanhd/projects/homework-app/homework-app/src/services/supabase.ts` that initializes Supabase client from `src/config.ts` runtime config. Export helpers: `signInWithOtp(email)`, `signInWithOAuth(provider)`, `getSession()`, `onAuthStateChange(cb)`.
  - Files: `/home/eanhd/projects/homework-app/homework-app/src/services/supabase.ts`, `/home/eanhd/projects/homework-app/homework-app/src/config.ts`
  - Acceptance: Module compiles and can be mocked in tests.

- [x] T011 — Implement Login UI & flows
  - Description: Add `/home/eanhd/projects/homework-app/homework-app/src/pages/Login.tsx` and auth components for magic-link and OAuth buttons. Wire `onAuthStateChange` to `src/store/app.ts` so the app knows the current user and can persist session.
  - Files: `/home/eanhd/projects/homework-app/homework-app/src/pages/Login.tsx`, `/home/eanhd/projects/homework-app/homework-app/src/components/Auth/*`, `/home/eanhd/projects/homework-app/homework-app/src/store/app.ts`
  - Acceptance: User can request a magic link and initiate OAuth flows; session is available in store after sign-in.

- [x] T012 — Associate subscriptions with user (frontend)
  - Description: Update subscription flow to include `user_id` when calling subscribe backend if user is authenticated. Provide a migration helper (SQL snippet) to map existing anonymous subscriptions to users when a deterministic matching is possible (endpoint + p256dh).
  - Files: `/home/eanhd/projects/homework-app/homework-app/src/services/subscriptions.ts`, `/home/eanhd/projects/homework-app/homework-app/supabase/migrations/20250912_migrate_subscriptions_to_users.sql`
  - Acceptance: New subscriptions created while authenticated include `user_id`. Migration script exists and is documented.

Phase 3.5: Tests, E2E, and Polish

- [x] T013 — Unit tests for Supabase client wrapper
  - Description: Add unit tests mocking Supabase client to verify `signInWithOtp`, `getSession`, and `onAuthStateChange` behaviors.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/unit/supabase.client.spec.ts`
  - Acceptance: Tests run locally and CI.

- [x] T014 — E2E: Login + subscribe + cross-device session test
  - Description: Add Playwright test `/home/eanhd/projects/homework-app/homework-app/tests/e2e/login-flow.spec.ts` that covers: login (magic link or OAuth), create subscription, reload page, confirm session persisted, and verify subscription associated with user via Edge function or DB check.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/e2e/login-flow.spec.ts`
  - Acceptance: Test fails initially (TDD) and passes after implementation.

- [x] [P] T015 — Docs: Update quickstart & README
  - Description: Update `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/quickstart.md` with provider setup, redirect URIs, env var examples, and include `psql` migration commands. Update top-level `README.md` if applicable.
  - Files: `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/quickstart.md`, `/home/eanhd/projects/homework-app/homework-app/README.md`
  - Acceptance: Developer can follow quickstart to enable providers and run migrations.

- [x] T016 — Runbook: Rollout & migration plan
  - Description: Create `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/runbook.md` with production migration steps, downtime guidance, rollback SQL, and environment variable update instructions (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
  - Files: `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/runbook.md`
  - Acceptance: Runbook reviewed and ready for ops.

Phase 3.2: Tests First (TDD) — Contract & integration tests (parallel where safe)

- [P] T002 — Contract test: Auth endpoints (auth.contract.spec.ts)
  - Description: Create a contract test asserting expected behavior of auth-related flows per `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/contracts/auth.md` (e.g., `supabase.auth` usage, JWT presence). Tests should assert 401 on protected endpoints when no token provided.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/contracts/auth.contract.spec.ts`
  - Acceptance: Test compiles and fails (no implementation yet).

- [P] T003 — Contract test: Subscribe endpoint (subscribe.contract.spec.ts)
  - Description: Create a contract test for `/subscribe` behavior per `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/contracts/subscribe.md`. Assert required fields and 401 when auth is required.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/contracts/subscribe.contract.spec.ts`
  - Acceptance: Test compiles and fails.

- [P] T004 — Contract test: Schedule endpoint (schedule.contract.spec.ts)
  - Description: Create a contract test for `/schedule` behavior per `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/contracts/schedule.md` (create/update scheduled notifications). Assert auth behavior and payload validation.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/contracts/schedule.contract.spec.ts`
  - Acceptance: Test compiles and fails.

- [P] T005 — Contract test: User-profile (user-profile.contract.spec.ts)
  - Description: Create a contract test for user profile endpoints (read/update) per `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/contracts/user-profile.md`.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/contracts/user-profile.contract.spec.ts`
  - Acceptance: Test compiles and fails.

Phase 3.3: Core Implementation (after tests fail)

- [ ] T006 — DB Migration: create `users` table and add `user_id` FKs
  - Description: Implement SQL migration to create `users` table and add `user_id` columns to `push_subscriptions` and `scheduled_notifications`. Provide rollback SQL and make the migration idempotent using `IF NOT EXISTS` checks.
  - Files: `/home/eanhd/projects/homework-app/homework-app/supabase/migrations/20250912_add_users_and_user_id.sql`, `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/data-model.md`
  - Acceptance: SQL file exists with create/alter statements and rollback comments; quickstart updated with `psql` commands to apply the migration.

- [ ] T007 — Create TypeScript types/models for entities [P]
  - Description: Add lightweight type definitions for `User`, `PushSubscription`, and `ScheduledNotification` to be used by frontend and tests.
  - Files: `/home/eanhd/projects/homework-app/homework-app/src/types/user.ts`, `/home/eanhd/projects/homework-app/homework-app/src/types/subscription.ts`, `/home/eanhd/projects/homework-app/homework-app/src/types/scheduledNotification.ts`
  - Acceptance: Types compile with project types; tests can import them.

- [ ] T008 — Update Supabase Edge functions to validate auth
  - Description: Modify Edge Functions to verify Supabase JWT and extract `user.id`. Functions to edit: `/home/eanhd/projects/homework-app/homework-app/supabase/functions/subscribe/index.ts`, `/home/eanhd/projects/homework-app/homework-app/supabase/functions/schedule/index.ts`, and update `/home/eanhd/projects/homework-app/homework-app/supabase/functions/send-notifications/index.ts` to respect `user_id` when scheduling.
  - Files: those listed above
  - Acceptance: Functions check for JWT and return 401 when missing/invalid (tests from Phase 3.2 should fail until this is implemented, then pass).

- [ ] T009 — Backend: accept/associate `user_id` in subscribe/schedule endpoints
  - Description: When authenticated, endpoints should persist `user_id` on `push_subscriptions` and `scheduled_notifications`. When no user, allow `null` for backward compatibility.
  - Files: same as T008 plus DB access layer in `/home/eanhd/projects/homework-app/homework-app/supabase/functions/*`
  - Acceptance: New rows include `user_id` for authenticated requests; contract tests updated to assert this.

Phase 3.4: Frontend Implementation

- [ ] T010 — Add Supabase client & config (frontend)
  - Description: Create `/home/eanhd/projects/homework-app/homework-app/src/services/supabase.ts` that initializes Supabase client from `src/config.ts` runtime config. Export helpers: `signInWithOtp(email)`, `signInWithOAuth(provider)`, `getSession()`, `onAuthStateChange(cb)`.
  - Files: `/home/eanhd/projects/homework-app/homework-app/src/services/supabase.ts`, `/home/eanhd/projects/homework-app/homework-app/src/config.ts`
  - Acceptance: Module compiles and can be mocked in tests.

- [ ] T011 — Implement Login UI & flows
  - Description: Add `/home/eanhd/projects/homework-app/homework-app/src/pages/Login.tsx` and auth components for magic-link and OAuth buttons. Wire `onAuthStateChange` to `src/store/app.ts` so the app knows the current user and can persist session.
  - Files: `/home/eanhd/projects/homework-app/homework-app/src/pages/Login.tsx`, `/home/eanhd/projects/homework-app/homework-app/src/components/Auth/*`, `/home/eanhd/projects/homework-app/homework-app/src/store/app.ts`
  - Acceptance: User can request a magic link and initiate OAuth flows; session is available in store after sign-in.

- [ ] T012 — Associate subscriptions with user (frontend)
  - Description: Update subscription flow to include `user_id` when calling subscribe backend if user is authenticated. Provide a migration helper (SQL snippet) to map existing anonymous subscriptions to users when a deterministic matching is possible (endpoint + p256dh).
  - Files: `/home/eanhd/projects/homework-app/homework-app/src/services/subscriptions.ts`, `/home/eanhd/projects/homework-app/homework-app/supabase/migrations/20250912_migrate_subscriptions_to_users.sql`
  - Acceptance: New subscriptions created while authenticated include `user_id`. Migration script exists and is documented.

Phase 3.5: Tests, E2E, and Polish

- [ ] T013 — Unit tests for Supabase client wrapper
  - Description: Add unit tests mocking Supabase client to verify `signInWithOtp`, `getSession`, and `onAuthStateChange` behaviors.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/unit/supabase.client.spec.ts`
  - Acceptance: Tests run locally and CI.

- [ ] T014 — E2E: Login + subscribe + cross-device session test
  - Description: Add Playwright test `/home/eanhd/projects/homework-app/homework-app/tests/e2e/login-flow.spec.ts` that covers: login (magic link or OAuth), create subscription, reload page, confirm session persisted, and verify subscription associated with user via Edge function or DB check.
  - Files: `/home/eanhd/projects/homework-app/homework-app/tests/e2e/login-flow.spec.ts`
  - Acceptance: Test fails initially (TDD) and passes after implementation.

- [P] T015 — Docs: Update quickstart & README
  - Description: Update `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/quickstart.md` with provider setup, redirect URIs, env var examples, and include `psql` migration commands. Update top-level `README.md` if applicable.
  - Files: `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/quickstart.md`, `/home/eanhd/projects/homework-app/homework-app/README.md`
  - Acceptance: Developer can follow quickstart to enable providers and run migrations.

- [ ] T016 — Runbook: Rollout & migration plan
  - Description: Create `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/runbook.md` with production migration steps, downtime guidance, rollback SQL, and environment variable update instructions (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
  - Files: `/home/eanhd/projects/homework-app/homework-app/specs/011-add-simple-login/runbook.md`
  - Acceptance: Runbook reviewed and ready for ops.

Dependency notes
- Setup (T001) should be done first so developers can run the app locally with Supabase client available.
- All contract tests (T002..T005) must exist and fail before any implementation tasks (T006..T012) — TDD requirement.
- TS types (T007) and DB migration (T006) should be implemented before wiring Edge functions (T008/T009).
- Frontend tasks (T010..T012) depend on Edge function and migration changes to exist.

Parallel execution guidance
- T002..T005 (contract tests) are [P] and can be written in parallel because they create separate test files.
- T007 (types) can be worked on in parallel with T006 (DB migration) as they touch different files.
- T015 (docs) can be done in parallel with implementation tasks once the migration SQL is drafted.

How an agent should execute a typical task (example)
1. Pick next `not-started` or `in-progress` task from this file.
2. Mark it `in-progress` in the agent todo tracker and commit small changes.
3. Run tests/linters locally (e.g., `npm test`) and iterate until acceptance passes.
4. Mark the task complete and move to the next.

---
Generated by `/tasks` using `/templates/tasks-template.md`. Each task lists absolute file paths and acceptance criteria so an LLM or developer can implement them directly.
