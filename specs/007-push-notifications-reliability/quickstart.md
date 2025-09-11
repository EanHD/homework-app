# Quickstart: Push Notifications — Reliability v2

## Prerequisites
- Supabase project with Edge Functions + Scheduled Functions
- VAPID keys configured as secrets for send function
- Frontend deployed (GitHub Pages base `/homework-app/`)

## 1) Database Setup
Run SQL from `data-model.md` to ensure constraints:
- `push_subscriptions`: `user_id` primary key (one active subscription per user)
- `scheduled_notifications`: unique `(user_id, assignment_id, send_at)`

## 2) Functions
Implement per `contracts/openapi.yaml`:
- `POST /subscribe`: replace prior subscription for `userId`
- `POST /schedule`: ISO UTC `sendAt`; Prefer: `resolution=merge-duplicates`; echo payload
- `POST /send-notifications`: cron; mark `sent_at` on ≥1 success; prune 404/410
- `OPTIONS` for `/subscribe` and `/schedule` with CORS headers

## 3) Cron
Configure every minute:
```
* * * * *  POST https://<project>.functions.supabase.co/send-notifications
```
Provide service role or signed secret as required by Supabase.

## 4) Frontend Settings
- Toggle “Enable push” → registers SW, reuses existing subscription if present; otherwise subscribes and calls `/subscribe`.
- Button “Send test notification (~60s)” → schedules a test row with `sendAt = now + 60s`.
- Display result: show “Scheduled” with echo payload or “Error: …”.

## 5) Service Worker
- On `push`: `showNotification(title, options)` only in SW
- On `notificationclick`: focus or open `/homework-app/#/main`

## 6) Verification Matrix
- Android Chrome (foreground, background, app closed)
- iOS Safari PWA installed (foreground, background, closed)

Steps for each device:
1. Load app → Settings → Enable push (allow permissions)
2. Tap “Send test notification (~60s)”
3. Expect one notification within ~60s (±30s)
4. Tap notification → app opens to `#/main`
5. Repeat the test after reopening the app → still single delivery

## 7) Diagnostics & Sanity Checks
SQL queries:
```
-- Confirm single active subscription per user
select user_id, count(*) as c from push_subscriptions group by 1 having count(*) > 1;

-- Check unsent due notifications
select * from scheduled_notifications where send_at <= now() and sent_at is null limit 20;

-- Recent deliveries
select * from scheduled_notifications where sent_at is not null order by sent_at desc limit 20;
```
Edge Function logs (console):
- Subscribe: user replaced previous endpoint
- Schedule: upsert status, dedupe applied
- Send: due count, delivered=1, pruned endpoints

## 8) Troubleshooting
- If permission denied: prompt user to enable notifications in OS settings.
- If no delivery: verify VAPID keys, origin, and that cron is firing.
- If duplicates: check `push_subscriptions` uniqueness and schedule dedupe index.

