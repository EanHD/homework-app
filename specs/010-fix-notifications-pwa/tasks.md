# Tasks: Reliable Push Reminders (PWA)

**Input**: Design docs under `/specs/010-fix-notifications-pwa/`
**Prerequisites**: plan.md (required), research.md, data-model.md

## Phase 3.1: Diagnostics & SW Fix First
- [ ] T001 Fix SW default notification for payload-less push in `src/sw.ts` (show a generic reminder when `event.data` is missing; keep click-through behavior)
- [ ] T002 [P] Add Settings diagnostics in `src/pages/Settings.tsx` (display `functionsBase`, VAPID public length, subscription endpoint, and last send/deliver status)
- [ ] T003 [P] Add iOS install/permission guidance banner component `src/ui/IosInstallHint.tsx` and render it in `src/App.tsx` (visible on iOS Safari when not installed)

## Phase 3.2: Config & Scheduling Hardening
- [ ] T004 Improve `src/config.ts` logging and fallback messages when `config.json` missing or invalid (include candidate bases tried)
- [ ] T005 [P] Guard scheduling in `src/store/app.ts` to notify user when schedule API fails (non-OK), and avoid scheduling when offset is undefined/null

## Phase 3.3: Contract Tests & Docs
- [ ] T006 [P] Contract doc stubs for `/subscribe`, `/schedule`, `/send-notifications` in `specs/010-fix-notifications-pwa/contracts/` (request/response examples and error cases)
- [ ] T007 Integration tests for `enablePush` and `scheduleReminder` cover diagnostics (extend existing tests in `tests/integration/`)

## Phase 3.4: E2E Verification
- [ ] T008 E2E: Add step in `tests/e2e/subscription-flow.spec.ts` to assert diagnostics surface (functions base + “Subscribed” badge visible)
- [ ] T009 E2E: Validate SW shows a notification without payload by simulating a `push` event (Playwright service worker mock) and ensuring app responds to click

## Dependencies
- T001 must complete before T009
- T002/T003/T004/T005 can run in parallel ([P])
- T006 before T007
- T008 after T002 is implemented

## Notes
- Keep diffs minimal and scoped to files named in each task.
- Do not modify unrelated code or reorder tasks.
- Prefer smallest change that passes tests and satisfies UX.

