# Research: Backend-Powered Push Notifications

## Decisions
- Quiet hours behavior: Defer delivery to the first minute after quiet hours end. Do not deliver during quiet hours; do not skip.
- Rate limiting: Soft limit 20 notifications per user per hour. If exceeded, backoff with 2× delay and cap at 60/hour.
- VAPID key rotation: Maintain two active keypairs (current, next). Publish public key `VAPID_PUBLIC` and `VAPID_PUBLIC_NEXT` for overlap; rotate quarterly. Remove old subscriptions on failure codes 404/410.
- Deduplication: Unique key on (`user_id`, `assignment_id`, `send_at`). Drop duplicates. Additionally, suppress sends within a 10‑minute window for the same key.
- Retention: Keep sent notifications 30 days. Delete unsent rows older than 7 days past `send_at`. Compact subscriptions by pruning those unused for >180 days.
- Anonymous user ID: v4 UUID stored in localStorage; persisted across sessions on the same device; copied to subscription rows and scheduled notifications.

## Rationale
- Quiet hours defer ensures users aren’t disturbed while still receiving the reminder promptly.
- Soft rate limits protect against accidental spam while allowing bursts during peak study times.
- Dual-key rotation avoids client breakage; public key update naturally refreshes upon next subscribe/renew.
- Deduplication prevents duplicate delivery when edits occur near send time.
- Retention balances auditability with storage constraints.

## Alternatives Considered
- Skipping in-window notifications altogether: rejected (users could miss reminders). Deferral chosen.
- Strict per-device rate limits: rejected in favor of per-user aggregation; multi-device delivery still respected.
- Hard delete vs. soft delete for subscriptions: keeping just 404/410 cleanup keeps maintenance simple.

## Open Questions (NEEDS CLARIFICATION)
- Exact rate limit thresholds and backoff policy acceptable to stakeholders.
- Whether users expect a “deliver at end of quiet hours” banner vs. silent delivery.
- Rotation cadence (quarterly vs. semi-annual) and ownership of the rotation process.
- Whether to expose a “snooze all until [time]” global control.

