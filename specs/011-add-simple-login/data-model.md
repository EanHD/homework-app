# Data Model: Login & User mapping

## Entities

- User
  - id: uuid (primary)
  - email: string (nullable)
  - display_name: string (nullable)
  - created_at: timestamp

- PushSubscription (existing)
  - endpoint: text (primary key)
  - p256dh: text
  - auth: text
  - user_id: uuid (nullable) — FK -> users.id

- ScheduledNotification (existing)
  - id: uuid
  - user_id: uuid (nullable) — FK -> users.id
  - assignment_id: uuid
  - title, body, send_at, sent_at

## Migrations (SQL snippets)

Add `users` table and user_id FK columns:

```sql
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text,
  display_name text,
  created_at timestamptz default now()
);

alter table push_subscriptions
  add column if not exists user_id uuid;

alter table scheduled_notifications
  add column if not exists user_id uuid;

alter table push_subscriptions
  add constraint if not exists fk_push_subscriptions_user foreign key (user_id) references users(id) on delete set null;

alter table scheduled_notifications
  add constraint if not exists fk_scheduled_notifications_user foreign key (user_id) references users(id) on delete set null;
```
