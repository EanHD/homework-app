-- Push Notifications — Reliability v2: DB changes

-- Enforce one active subscription per user
drop index if exists idx_push_subscriptions_user_id;
create unique index if not exists uniq_push_subscriptions_user
  on public.push_subscriptions(user_id);

-- Cleanup duplicate rows (keep most recent)
delete from push_subscriptions a
using push_subscriptions b
where a.user_id = b.user_id and a.created_at < b.created_at;

-- Add URL column for deep links in scheduled notifications
alter table if exists scheduled_notifications
  add column if not exists url text;

