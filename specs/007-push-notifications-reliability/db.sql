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

-- Ensure idempotency: one row per (user_id, assignment_id, send_at)
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'uniq_sched_dedupe'
  ) then
    -- Cleanup any duplicates before adding the unique index
    with ranked as (
      select id,
             row_number() over (partition by user_id, assignment_id, send_at order by id) as rn
      from scheduled_notifications
    )
    delete from scheduled_notifications s
    using ranked r
    where s.id = r.id and r.rn > 1;

    create unique index uniq_sched_dedupe
      on public.scheduled_notifications(user_id, assignment_id, send_at);
  end if;
end $$;
