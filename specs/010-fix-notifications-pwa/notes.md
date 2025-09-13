# Notifications Status Snapshot

Date: 2025-09-13
Feature: Reliable Push Reminders (PWA) — `010-fix-notifications-pwa`

## Current State
- iOS (APNs) and Edge (Windows) notifications are delivering after redeploying functions with correct VAPID envs.
- Diagnostics function is live and confirms env presence, lengths, URL‑safe base64, and public key hash.
- Delivery function uses `web-push@3.6.7`, standardized env names, and returns detailed JSON (counts + failures).
- App Diagnostics (Settings) show functionsBase, VAPID public length, subscription endpoint, last schedule/deliver; includes Reset overrides.

## Diagnostics
- Diag endpoint:
  - `curl -s https://tihojhmqghihckekvprj.functions.supabase.co/diag | jq`
- Expected diag output highlights:
  - `present.VAPID_PUBLIC = true`, `present.VAPID_PRIVATE = true`
  - `lengths.VAPID_PUBLIC ≈ 87`, `lengths.VAPID_PRIVATE ≈ 43`
  - `urlSafeBase64.VAPID_PUBLIC = true`, `urlSafeBase64.VAPID_PRIVATE = true`
  - `vapidPublicHash` present

## What We Verified
- App ↔ Server VAPID keys match (lengths + hash).
- iPhone subscription endpoint host = `web.push.apple.com` (APNs) — correct.
- Scheduled flow delivers (previous backlog “flood” confirms end‑to‑end working).
- Direct delivery works when using full (unredacted) endpoint/p256dh/auth.

## Next Actions (Recommended)
- [ ] Add Supabase Schedule for `send-notifications` (e.g., every 1 minute) so delivery runs automatically.
- [ ] Optionally skip WNS endpoints (`*.notify.windows.com`) in deliverer to reduce noise, or plan separate WNS integration.
- [ ] Optionally enhance App Diagnostics with User ID and endpoint host display.
- [ ] Optionally add a "Schedule + auto-trigger" test button in-app for quicker manual verification.

## Server Env (Standardized)
- `VAPID_PUBLIC = BJFkka_ly1iHg5C1nbnj91YaZoBkODv3FvCBute0fZ9PzCmr-Q8VdMoN8QOU_Zh_QCojv4nuBoUtHT60gKZPsF8`
- `VAPID_PRIVATE = DTkLpwd5efuXamvqeu1GmLPM7WbV2GMWbwtYrLroE10` (single line, URL‑safe base64)
- `VAPID_SUBJECT = mailto:you@example.com`
- `PROJECT_URL = https://tihojhmqghihckekvprj.supabase.co`
- `SERVICE_ROLE_KEY = <service role key>`

## Useful Commands
- Verify diag:
  - `curl -s https://tihojhmqghihckekvprj.functions.supabase.co/diag | jq`
- Verify app ↔ server VAPID match:
  - `npx tsx scripts/verify-vapid.ts https://eanhd.github.io/homework-app/config.json https://tihojhmqghihckekvprj.functions.supabase.co`
- Direct send (diagnostics) — requires full (unredacted) values:
  - `curl -s -X POST -H "Content-Type: application/json" \
    -d '{"subscriptions":[{"endpoint":"<full>","keys":{"p256dh":"<full>","auth":"<full>"}}],"message":{"title":"Ping","body":"Hello"}}' \
    https://tihojhmqghihckekvprj.functions.supabase.co/send-notifications | jq`

## Notes
- Apple/APNs success returns HTTP 201 in `statusCounts`.
- 404/410 ⇒ prune stale subscription.
- 401/403 ⇒ fix VAPID envs/subject/format (private must be 43–44 chars, URL‑safe, single line).
- Windows WNS endpoints are not standard Web Push; they will not succeed with VAPID and can be skipped/pruned separately.

