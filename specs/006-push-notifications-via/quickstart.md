# Quickstart: Backend-Powered Push Notifications

## Prerequisites
- Supabase project with Edge Functions and Scheduled Functions enabled
- VAPID keys (public/private + subject)

## 1) Generate VAPID Keys
Use a local script or online tool to generate VAPID key pair.
- VAPID_PUBLIC: Base64URL public key
- VAPID_PRIVATE: Base64URL private key
- VAPID_SUBJECT: mailto:you@example.com

Store as Supabase secrets for functions:
```
supabase secrets set VAPID_PUBLIC=... VAPID_PRIVATE=... VAPID_SUBJECT=mailto:you@example.com
```

## 2) Database Setup
Create tables per `data-model.md`:
```
create table if not exists push_subscriptions (
  user_id text not null,
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);
create index if not exists idx_push_subscriptions_user_id on push_subscriptions(user_id);

create table if not exists scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  assignment_id text not null,
  title text not null,
  body text not null,
  send_at timestamptz not null,
  sent_at timestamptz
);
create index if not exists idx_sched_user_send_at on scheduled_notifications(user_id, send_at);
create index if not exists idx_sched_unsent on scheduled_notifications(send_at) where sent_at is null;
create unique index if not exists uniq_sched_dedupe on scheduled_notifications(user_id, assignment_id, send_at);
```

## 3) Edge Functions
Implement three functions (see contracts/openapi.yaml):
- POST /subscribe → upsert into push_subscriptions
- POST /schedule → upsert/delete from scheduled_notifications
- POST /send-notifications → cron; deliver due rows via Web Push, mark sent, prune 404/410 endpoints

Grant invocation to your frontend origin or use service role token for cron.

## 4) Scheduled Function (Cron)
Configure to run every minute:
```
* * * * *  POST https://<project>.functions.supabase.co/send-notifications
```

## 5) Frontend Integration
- Settings: toggle notifications, set default offset and quiet hours
- On enable: register SW, subscribe to push with VAPID_PUBLIC, POST to /subscribe with userId
- On assignment create/update/delete: compute sendAt = dueAt - offset (respect quiet hours), POST to /schedule (or null to delete)
- Service Worker: handle 'push' → showNotification; 'notificationclick' → focus/open deep link

## 6) E2E Test Path
1. Enable notifications and grant permission
2. Create an assignment due in ~2 minutes with reminder
3. Confirm a push notification arrives; click → app opens at assignment

## 7) Operations
- Rotate keys quarterly: set NEXT keys, roll clients, then retire old
- Monitor delivery failures; remove bad subscriptions on 404/410
- Retention jobs: purge as per data-model.md

