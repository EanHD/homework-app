# Research: Push Notifications — Reliability v2

## Decisions

1) Single active subscription per user
- Decision: Enforce one active subscription per user; last write wins.
- Rationale: Prevent duplicate notifications across multiple active subscriptions; simplifies delivery logic.
- Alternatives: Many-per-user with send-time dedupe; rejected to reduce edge cases and DB churn.

2) Idempotent scheduling and dedupe
- Decision: `POST /schedule` accepts ISO 8601 UTC `sendAt` and uses a uniqueness key (`user_id`, `assignment_id`, `send_at`) to dedupe retries. Client may set `Prefer: resolution=merge-duplicates` semantics.
- Rationale: Retries or reopens must not create duplicates; unique key is simple and robust.
- Alternatives: Hash-based dedupe keys; rejected as unnecessary complexity.

3) Marking delivery completion
- Decision: Cron delivery marks `sent_at` after ≥1 successful send; subsequent attempts skip.
- Rationale: Guarantees at-most-once user-visible delivery while allowing retries until first success.
- Alternatives: Exactly-once delivery across all devices/endpoints; unnecessary given single active subscription.

4) Dead subscription pruning
- Decision: Remove endpoints returning 404/410 during send; log removals.
- Rationale: Keep table clean and avoid repeated failures.

5) CORS and preflight
- Decision: Implement `OPTIONS` for `/subscribe` and `/schedule` with appropriate `Access-Control-*` headers; allow required frontend origins.
- Rationale: Ensure web client can call functions directly.
- Alternatives: Proxy via another domain; not needed.

6) Test notification latency target
- Decision: “~60s” means deliver within 60s ±30s under normal conditions.
- Rationale: Accounts for cron minute granularity and network jitter.

7) Service Worker UX
- Decision: Display notifications only from SW; on click, open/focus `#/main` via base `/homework-app/`.
- Rationale: Consistent UX; avoids multiple tabs.

8) Diagnostics scope
- Decision: Provide minimal DB sanity queries and console logs (counts, actions). No heavy dashboards.
- Rationale: Keep scope small; enough to troubleshoot.

## Open Questions (resolved by defaults above)
- Multi-device policy: Single active subscription per user; last subscription replaces previous.
- Origin policy: Allow GitHub Pages origin(s) for this repo.
- Timestamp guidance: Require ISO 8601 UTC for `sendAt`.

## References
- Web Push protocol (VAPID)
- Supabase Edge Functions, Scheduled Functions

