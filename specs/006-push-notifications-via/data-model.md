# Data Model: Push Notifications

## Tables

### push_subscriptions
- user_id: text (not null)
- endpoint: text (primary key)
- p256dh: text (not null)
- auth: text (not null)
- created_at: timestamptz (default now())

Indexes:
- idx_push_subscriptions_user_id (btree on user_id)

Notes:
- Primary key on endpoint ensures idempotent upserts per device.

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
- Delete sent rows older than 30 days; delete unsent rows >7 days past send_at.

## Settings (client-side)
- notificationsEnabled: boolean
- defaultReminderOffsetMin: number (e.g., 30)
- quietHours: { enabled: boolean, start: "HH:mm", end: "HH:mm" }

