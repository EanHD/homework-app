# Tasks: Backend-Powered Push Notifications

**Input**: Design documents from `/specs/006-push-notifications-via/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md (web: frontend + Supabase contracts)
2. Use research decisions and data-model for table/index details
3. Generate tasks from user-provided list without reordering
4. Keep edits minimal; prefer simplest correct solution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no shared paths)
- Include exact file paths in descriptions

## Phase 3.1: Backend Bootstrap
- [x] T001 Generate VAPID keys — locally generate and store in Supabase secrets
  - Command: `npx web-push generate-vapid-keys`
  - Save to Supabase secrets: `VAPID_PUBLIC`, `VAPID_PRIVATE`, `VAPID_SUBJECT` (e.g., `mailto:you@example.com`)

- [x] T002 Supabase SQL (run in SQL editor) — create tables and indexes
  - `push_subscriptions(user_id text NOT NULL, endpoint text PRIMARY KEY, p256dh text NOT NULL, auth text NOT NULL, created_at timestamptz DEFAULT now())`
  - `scheduled_notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id text NOT NULL, assignment_id text NOT NULL, title text NOT NULL, body text NOT NULL, send_at timestamptz NOT NULL, sent_at timestamptz)`
  - Index: `CREATE INDEX IF NOT EXISTS idx_sched_due ON scheduled_notifications (send_at) WHERE sent_at IS NULL;`

- [x] T003 Edge Function: subscribe (`functions/subscribe/index.ts`)
  - Input: `{ userId, subscription }`
  - Upsert to `push_subscriptions` by `endpoint`; ensure `user_id` matches

- [x] T004 Edge Function: schedule (`functions/schedule/index.ts`)
  - Input: `{ userId, assignmentId, title, body, sendAt }` (ISO string)
  - Upsert (idempotent per `userId+assignmentId+sendAt`) or insert new row
  - Optional delete path: `{ userId, assignmentId, cancel: true }` → mark any future unsent rows for that assignment as sent or delete

- [x] T005 Edge Function: send-notifications (`functions/send-notifications/index.ts`)
  - Query: `SELECT * FROM scheduled_notifications WHERE sent_at IS NULL AND send_at <= now() LIMIT 500;`
  - For each row:
    - Fetch subscriptions for `user_id`
    - Web Push send with VAPID keys; payload JSON `{ title, body, assignmentId, url }`
    - Handle 404/410 to delete bad subscription
    - Set `sent_at = now()`
  - Expose as scheduled function (cron: every minute)

- [x] T006 Supabase schedule — create Scheduled Function for `send-notifications` to run every minute

## Phase 3.2: Frontend Wiring
- [x] T007 Settings & permission flow (frontend)
  - Settings slice: `notificationsEnabled` (bool), `defaultReminderOffsetMin` (10|30|60), `quietHours`
  - Button “Enable push notifications”: register SW if not, request permission, then subscribe: `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: <VAPID_PUBLIC base64→Uint8Array> })`; POST to `/functions/v1/subscribe` with `userId`
  - “Send test notification”: hit `/functions/v1/schedule` with `sendAt = now + 60s`

## Phase 3.3: Frontend CRUD Scheduling + SW + Utils
- [x] T008 Frontend: schedule on CRUD
  - On create/update assignment with reminder: compute `sendAt = dueAt - offset`; POST to `/functions/v1/schedule`.
  - On delete or reminder removed: POST `/functions/v1/schedule` with `{ userId, assignmentId, cancel: true }`.
  - Files: `src/store/app.ts` (hook into add/update/delete), `src/services/pushApi.ts` (new helper for POSTs).

- [x] T009 Service Worker (`public/sw.js`)
  - Add `push` handler:
    ```js
    self.addEventListener('push', (e) => {
      const data = (e.data && e.data.json && e.data.json()) || {};
      e.waitUntil(self.registration.showNotification(data.title || 'Homework Buddy', {
        body: data.body,
        data,
        icon: '/homework-app/icons/icon-192.png',
        badge: '/homework-app/icons/icon-192.png'
      }));
    });
    ```
  - Add `notificationclick` handler:
    ```js
    self.addEventListener('notificationclick', (e) => {
      e.notification.close();
      const url = (e.notification.data && e.notification.data.url) || '/homework-app/#/main';
      e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
        for (const c of list) {
          if ('focus' in c) { c.navigate(url); return c.focus(); }
        }
        if (clients.openWindow) return clients.openWindow(url);
      }));
    });
    ```

- [x] T010 Frontend utils
  - Add base64→Uint8Array helper for VAPID key in `src/utils/webpush.ts`.
  - Local userId helper: generate uuid v4 once, store in localStorage `hb_user_id` in `src/utils/userId.ts`.

## Phase 3.4: Error Handling & Docs
- [x] T011 Error handling & UI states
  - Show statuses in Settings: “Notifications enabled”, “Permission denied”, “Not supported”.
  - Unsubscribe button: `registration.pushManager.getSubscription()?.then(s => s?.unsubscribe())`; delete from backend by endpoint.
  - Files: `src/pages/Settings.tsx`, `src/services/pushApi.ts`.

- [x] T012 Docs
  - README “Push Notifications”: one-time setup (Supabase project, SQL, secrets, schedule), local dev testing (https or `vite --https`), platform limitations.
  - File: `README.md` (new section).

## Dependencies
- T001 before T003–T005 (VAPID keys required)
- T002 before T003–T005 (tables required)
- T005 before T006 (function must exist before scheduling)
- T003–T006 before T007 (frontend integration depends on backend endpoints)

## Parallel Example
```
# After T001–T002 complete:
Task: "Edge Function subscribe (functions/subscribe/index.ts)" [P]
Task: "Edge Function schedule (functions/schedule/index.ts)" [P]
```

## Notes
- Keep task edits limited to the files and systems specified
- Respect quiet hours and payload format per spec when implementing
- Use anonymous `userId` from localStorage for all requests

## Validation Checklist
- [ ] Secrets set: VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT
- [ ] Tables exist with indexes
- [ ] Edge functions deployed and reachable
- [ ] Cron runs every minute and sends due notifications
- [ ] Frontend can enable push, subscribe, and send a test notification
