## Data Model: Push Reminders

### Tables (Supabase)
- push_subscriptions
  - user_id (text, pk scope)
  - endpoint (text, unique)
  - p256dh (text)
  - auth (text)

- scheduled_notifications
  - id (uuid)
  - user_id (text)
  - assignment_id (text)
  - title (text)
  - body (text)
  - url (text, nullable)
  - send_at (timestamptz)
  - sent_at (timestamptz, nullable)

### State Transitions
- schedule(created) → due(send-notifications scans) → delivered(sent_at set)
- cancel(marked by null send_at or delete) → not delivered

### Constraints & Rules
- One active subscription per user enforced by `subscribe` (replaces prior by user_id). Future: support multi-device by allowing many subscriptions per user.
- Duplicate schedules are merged using `Prefer: resolution=merge-duplicates`.

