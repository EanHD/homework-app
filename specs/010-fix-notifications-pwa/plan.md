# Implementation Plan: Reliable Push Reminders (PWA)

**Branch**: `010-fix-notifications-pwa` | **Date**: 2025-09-13 | **Spec**: specs/010-fix-notifications-pwa/spec.md
**Input**: Feature specification from `/specs/010-fix-notifications-pwa/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Goal: Make push reminders reliable across supported platforms (Android, Desktop, iOS 16.4+ PWA). The current pipeline includes client subscription (`enablePush`), Supabase Edge Functions (`/subscribe`, `/schedule`, `/send-notifications`), and a Service Worker (`src/sw.ts`) that displays notifications. Root cause candidate identified: server deliberately sends a push with no payload (see `sendPushNoPayload`), but `src/sw.ts` drops push events when `event.data` is absent. On iOS and other platforms, this results in no notification shown despite end-to-end scheduling. Plan: fix SW to show a default notification for payload-less pushes, verify configuration loading (public/config.json), ensure VAPID keys match client/server, add diagnostics and guidance for iOS PWAs, and harden scheduling/resubscription flows.

## Technical Context
**Language/Version**: TypeScript (Vite + React 18)
**Primary Dependencies**: Mantine UI, Zustand, Playwright, Supabase Edge Functions, Service Worker (Vanilla TS)
**Storage**: LocalForage (client state), Supabase tables: `push_subscriptions`, `scheduled_notifications`
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web PWA (Android/Chrome, Desktop, iOS 16.4+ for installed PWAs)
**Project Type**: Single web app + serverless functions (Supabase)
**Performance Goals**: Reminder delivery within ±2 minutes of target under normal conditions
**Constraints**: Offline-capable app shell; iOS requires installed PWA for Web Push; VAPID keys must match client/server; CORS limited to expected origins
**Scale/Scope**: Single-user device push with lightweight scheduling (<=500 pending per cycle)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: [#] (max 3 - e.g., api, cli, tests)
- Using framework directly? (no wrapper classes)
- Single data model? (no DTOs unless serialization differs)
- Avoiding patterns? (no Repository/UoW without proven need)

**Architecture**:
- EVERY feature as library? (no direct app code)
- Libraries listed: [name + purpose for each]
- CLI per library: [commands with --help/--version/--format]
- Library docs: llms.txt format planned?

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (test MUST fail first)
- Git commits show tests before implementation?
- Order: Contract→Integration→E2E→Unit strictly followed?
- Real dependencies used? (actual DBs, not mocks)
- Integration tests for: new libraries, contract changes, shared schemas?
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included?
- Frontend logs → backend? (unified stream)
- Error context sufficient?

**Versioning**:
- Version number assigned? (MAJOR.MINOR.BUILD)
- BUILD increments on every change?
- Breaking changes handled? (parallel tests, migration plan)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (single project) with existing PWA + Supabase functions; no restructuring required beyond doc additions.

## Phase 0: Outline & Research
1. Unknowns to resolve (from spec):
   - iOS support boundaries: Confirm iOS 16.4+ PWA requirement and UX guidance for installation and permissions.
   - Delivery policy: Late reminder retry window and multi-device strategy.
   - Config delivery: Ensure `public/config.json` is fetched under GH Pages base (`/homework-app/`) and contains valid `functionsBase` + `vapidPublic` matching server env.
   - VAPID pairing: Verify VAPID public used by client equals server VAPID public; confirm private key configured server-side.
   - CORS: Confirm allowlist in Supabase functions includes deployed origins.
2. Best practices to consult:
   - Service Worker behavior for payload-less pushes (must show default notification in `push` event).
   - iOS Web Push UX patterns (install prompts, permission flows, “re-enable notifications”).
3. Consolidate findings in `research.md` with decisions and rationale.

**Output**: `specs/010-fix-notifications-pwa/research.md` documenting platform support matrix, config validation flow, and SW behavior for empty payloads.

## Phase 1: Design & Contracts
Prereq: research.md complete.

1. Entities → `data-model.md`:
   - PushSubscription(user_id, endpoint, p256dh, auth)
   - ScheduledNotification(id, user_id, assignment_id, title, body, send_at, sent_at, url)
   - DeliveryAttempt (virtual/logging) for observability [document only]
2. API contracts (already implemented; document in `/contracts/`):
   - POST/DELETE `/subscribe`: upsert/remove subscription.
   - POST `/schedule`: create or cancel (sendAt null) a reminder.
   - POST `/send-notifications`: deliver due reminders (cron/invoke).
   Include request/response examples and error codes.
3. Contract tests (describe in plan; use existing integration tests to validate flows).
4. Test scenarios (E2E):
   - Subscription success/error, unsubscribe, persistence across reloads.
   - Scheduling and manual trigger delivery (verifying SW shows default notification without payload).
   - iOS installed PWA guidance and permission gating.
5. Quickstart: add a concise checklist for configuring VAPID keys, Supabase env, and verifying via Settings “Send test notification”.

**Output**: `data-model.md`, `/contracts/*` docs, `quickstart.md`.

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Start with diagnostics and SW fix:
  - Fix `src/sw.ts` to show a default notification when `event.data` is missing (server sends no payload by design).
  - Add Settings diagnostics: show `functionsBase`, VAPID public length, subscription status, last schedule/deliver status.
  - Add iOS install guidance banner if on iOS Safari not installed.
- Validate configuration chain: `public/config.json` present at base; add failsafe and clearer errors in `getRuntimeConfig`.
- Harden scheduling paths in `src/store/app.ts` to only schedule when offset defined and notify on errors.
- Contract docs/tests for `/subscribe`, `/schedule`, `/send-notifications`.

**Ordering Strategy**:
- TDD where practical (unit for config loader; integration for schedule/subscribe). E2E guarded by disabling onboarding in CI (already done).
- Apply SW fix first to unlock end-to-end behavior; then add diagnostics and guidance.

**Estimated Output**: ~12–16 focused tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
