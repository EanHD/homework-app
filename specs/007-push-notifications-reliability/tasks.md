# Tasks: Push Notifications — Reliability v2

**Input**: Design docs in `specs/007-push-notifications-reliability/` (plan, research, data-model, contracts)
**Prerequisites**: On branch `007-push-notifications-reliability`

## Phase 3.1: Setup & Contracts (TDD first)
- [x] T001 [P] Add contract tests for `POST /subscribe` in `tests/contract/push_subscribe.spec.ts`
- [x] T002 [P] Add contract tests for `POST /schedule` in `tests/contract/push_schedule.spec.ts`
- [x] T003 [P] Add contract tests for `POST /send-notifications` in `tests/contract/push_send.spec.ts`

## Phase 3.2: Database
- [ ] T004 Create unique index enforcing one subscription per user and cleanup duplicates
  - File: `specs/007-push-notifications-reliability/data-model.md` (reflect changes) and run in Supabase SQL
  - SQL:
    - `drop index if exists idx_push_subscriptions_user_id;`
    - `create unique index if not exists uniq_push_subscriptions_user on public.push_subscriptions(user_id);`
    - Cleanup duplicates (keep most recent):
      ```sql
      delete from push_subscriptions a
      using push_subscriptions b
      where a.user_id=b.user_id and a.created_at<b.created_at;
      ```
- [ ] T005 Add nullable URL column for scheduled notifications deep-links
  - File: `specs/007-push-notifications-reliability/data-model.md` (add field) and run in Supabase SQL
  - SQL: `alter table scheduled_notifications add column if not exists url text;`

## Phase 3.3: Edge Functions (Backend)
- [x] T006 Update `functions/subscribe/index.ts` to enforce single active subscription by user
  - Delete prior rows by `user_id` before insert
  - Insert new row; keep CORS and `OPTIONS` handler
  - Log whether replacing vs. creating
- [x] T007 Update `functions/schedule/index.ts` to support idempotent upsert and cancel
  - Accept body `{ userId, assignmentId, title, body, url, sendAt }` (ISO UTC)
  - If `sendAt` is null or `cancel` is true: mark matching unsent rows with `sent_at = now()` instead of delete
  - On schedule: insert row with url; ensure dedupe via unique index `(user_id, assignment_id, send_at)` (already in data model)
  - Respect header `Prefer: resolution=merge-duplicates` (treat duplicates as success)
  - Return echoed payload `{ ok, action, payload }`
  - Keep CORS + `OPTIONS`
- [x] T008 Update `functions/send-notifications/index.ts`
  - Query: `sent_at is null AND send_at <= now()`
  - Send to active subscription(s) for `user_id` (should be 1 due to index)
  - Delete subs on 404/410
  - If ≥1 success, set `sent_at = now()` for the row
  - Response JSON keys: `{ processed, successes, pruned }`
  - Add console logs for counts

## Phase 3.4: Frontend Helpers
- [x] T009 [P] Add `enablePush(userId)` helper to `src/utils/push.ts`
  - Register SW via `navigator.serviceWorker.register('/homework-app/sw.js', { scope: '/homework-app/' })`
  - Check `reg.pushManager.getSubscription()`; reuse if exists
  - If no sub: subscribe with `vapidPublic` (from `getRuntimeConfig()`), then `POST` to `/subscribe`
  - Return `{ reused: boolean, endpoint?: string }`; console.log reused vs. new
- [x] T010 [P] Add scheduling helpers to `src/services/pushApi.ts`
  - `export async function scheduleReminder(args: { userId, assignmentId, title, body, url, sendAt })`
  - `export async function cancelReminder(args: { userId, assignmentId })` → call `/schedule` with `sendAt: null`
  - Set header `Prefer: resolution=merge-duplicates`

## Phase 3.5: Settings UI
- [x] T011 Update `src/pages/Settings.tsx`
  - Replace inline enable logic to call `enablePush(getOrCreateUserId())` and show toast based on result
  - On test button: `scheduleReminder({ userId, assignmentId: 'test-notification', title: 'Test notification', body: 'This is a test', url: '/homework-app/#/main', sendAt: new Date(Date.now()+60000).toISOString() })`
  - Show success/error toasts; log scheduled payload
  - Ensure toggling notifications does not create duplicate subscriptions (reuse path)

## Phase 3.6: Service Worker
- [x] T012 Verify and refine `public/sw.js`
  - On `push`: parse `{title, body, url}` and call `showNotification(title, { body, data: { url }, icon, badge })`
  - On `notificationclick`: focus existing client or `clients.openWindow(url)` (default to `/homework-app/#/main`)
  - Done when behavior matches spec (no app-level `new Notification`) 
- [x] T013 Remove page-level Notification fallback
  - File: `src/store/notifications.ts` → remove `new Notification(...)` fallback; require SW `showNotification`
  - Update any tests relying on fallback

## Phase 3.7: Cron Job (Supabase)
- [ ] T014 Add/verify cron schedule for send-notifications (run in Supabase SQL)
  - Create or replace job:
    ```sql
    select cron.schedule(
      'send_notifications_job','* * * * *',
      $$ select net.http_post(
           url:='https://<ref>.functions.supabase.co/send-notifications',
           timeout_milliseconds:=5000
         ) $$);
    ```
  - Manual trigger: `select cron.run_job('send_notifications_job');`
  - Verify: `select * from cron.job;`

## Phase 3.8: Diagnostics & Docs
- [x] T015 [P] Add console diagnostics
  - `functions/subscribe/index.ts`: log replace/create
  - `functions/schedule/index.ts`: log action (insert/cancel/merge)
  - `functions/send-notifications/index.ts`: log processed/success/pruned
  - `src/utils/push.ts`: log reused/new subscription
- [x] T016 [P] Add saved SQL snippets to `specs/007-push-notifications-reliability/quickstart.md` (already included) and ensure visibility in README links if applicable

- [x] T017 [P] Update or add unit test for `src/store/notifications.ts` to ensure no page-level `new Notification` usage (`tests/unit/notifications.spec.ts`)
- [x] T018 [P] Add integration test ensuring `enablePush` reuses existing subscription stub (`tests/integration/push-enable.spec.ts`)
- [x] T019 Add integration test to ensure schedule helper posts with `Prefer: resolution=merge-duplicates` (`tests/integration/push-schedule.spec.ts`)
- [ ] T020 Manual acceptance: Android Chrome and iOS PWA per `quickstart.md` (document results in PR description)

## Dependencies
- T001-T003 must be authored first and should fail initially
- T004-T005 database before backend changes (T006-T008)
- T009-T010 helpers before Settings (T011)
- T012-T013 SW and notification behavior before integration tests (T017-T019)

## Parallel Execution Examples
- Launch these in parallel:
  - T001, T002, T003 (contract tests) [P]
  - T009, T010 (frontend helpers) [P]
  - T015, T016 (diagnostics/docs) [P]
