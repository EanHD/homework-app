# Data Model: Push Reliability v2

## Tables

### push_subscriptions
- user_id: text (primary key)
- endpoint: text (not null)
- p256dh: text (not null)
- auth: text (not null)
- created_at: timestamptz (default now())

Constraints & Indexes:
- Primary key on `user_id` (enforces one active subscription per user)
- Unique index on `endpoint` to prevent duplicates (optional but recommended)

Notes:
- On subscribe, delete previous row for `user_id` then insert new row (idempotent, last write wins).

### scheduled_notifications
- id: uuid (primary key, default gen_random_uuid())
- user_id: text (not null)
- assignment_id: text (not null)
- title: text (not null)
- body: text (not null)
- send_at: timestamptz (not null)
- sent_at: timestamptz (null)

Indexes:
- idx_sched_user_send_at (btree on user_id, send_at)
- idx_sched_unsent (partial index where sent_at is null)
- uniq_sched_dedupe (unique on user_id, assignment_id, send_at)

Retention:
- Delete `sent` rows older than 30 days; delete `unsent` rows >7 days past `send_at`.

## Settings (client-side)
- notificationsEnabled: boolean

## SQL (reference)
```
create table if not exists push_subscriptions (
  user_id text primary key,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);
create unique index if not exists uniq_push_endpoint on push_subscriptions(endpoint);

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

