# Implementation Plan: Push Notifications — Reliability v2

**Branch**: `007-push-notifications-reliability` | **Date**: 2025-09-11 | **Spec**: specs/007-push-notifications-reliability/spec.md
**Input**: Feature specification from `/specs/007-push-notifications-reliability/spec.md`

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
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Improve reliability to ensure exactly one push per scheduled reminder, even across app restarts. Reuse the existing browser subscription (no duplicate subscriptions), constrain the database to one active subscription per user, and make scheduling idempotent using ISO UTC timestamps and duplicate-merge semantics. Delivery marks `sent_at` on first successful send, prunes dead endpoints, and supports CORS with OPTIONS preflight. Settings exposes “Enable push” and a “Test notification (~60s)” action; diagnostics include simple DB sanity queries and console logs. Native platform push is out of scope; Web Push only.

## Technical Context
**Language/Version**: Frontend TypeScript (Vite React); Backend Supabase Edge Functions (TypeScript/Deno)  
**Primary Dependencies**: Frontend: Mantine, Zustand, Workbox; Backend: Supabase (Postgres), Web Push (VAPID)  
**Storage**: Supabase Postgres (`push_subscriptions`, `scheduled_notifications`) with uniqueness constraints  
**Testing**: Vitest (frontend); backend contract checks via HTTP scripts/cURL; manual device matrix  
**Target Platform**: Frontend on GitHub Pages (base `/homework-app/`); Backend on Supabase (Edge Functions + scheduled cron)  
**Project Type**: web (frontend + backend contracts)  
**Performance Goals**: Test notification delivered within ~60s; scheduled reminders deliver once at due time  
**Constraints**: PWA-capable; CORS-enabled endpoints; no native push channels  
**Scale/Scope**: Modest user base; single active subscription per user (multi-device policy: last write wins)

NEEDS CLARIFICATION resolved in research with defaults: single active subscription per user (last write wins), success window ±30s for the “~60s” test, diagnostics via DB queries and function logs, ISO 8601 UTC for `sendAt`, and CORS for required origins.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (web app + backend contracts within repo)
- Using frameworks directly; avoid unnecessary abstraction layers
- Single data model across client/server where applicable

**Architecture**:
- No extra libraries added beyond existing stack
- Contracts documented for Edge Functions; no wrapper frameworks introduced

**Testing (NON-NEGOTIABLE)**:
- Contract-first for subscribe/schedule/send-notifications
- Integration verification via quickstart + device matrix

**Observability**:
- Console logs in Edge Functions; simple counts in delivery reports

**Versioning**:
- No public API version bump; internal constraints via DB indexes

Result: No violations identified requiring Complexity Tracking.

## Project Structure

### Documentation (this feature)
```
specs/007-push-notifications-reliability/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
└── contracts/           # Phase 1 output (/plan command)
```

**Structure Decision**: Option 1 (single project) with backend contracts; keep changes minimal and scoped.

## Phase 0: Outline & Research
See `research.md` for resolved decisions: multi-device policy (one per user, last write wins), idempotent scheduling, CORS origins, test latency window, and diagnostics scope.

## Phase 1: Design & Contracts
- Data model updated to enforce a single active subscription per user (`uniq_push_subscriptions_user`).
- Contracts documented for `POST /subscribe`, `POST /schedule`, `POST /send-notifications`, with `OPTIONS` preflight and CORS headers.
- Quickstart includes Android/iOS PWA verification and DB sanity queries.

## Phase 2: Task Planning Approach
**Task Generation Strategy**:
- Contracts → contract test tasks [P]
- Entities → model migration tasks [P]
- User stories → integration test tasks
- Implementation tasks for frontend (Settings, SW) and backend (functions)

**Ordering Strategy**:
- TDD sequence where feasible: contract tests → implementation
- DB constraints before delivery logic
- Frontend enable/test flows after backend is callable

**Estimated Output**: ~20–25 focused tasks in `tasks.md`

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

