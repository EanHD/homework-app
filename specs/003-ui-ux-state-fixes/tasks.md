# Tasks: UI/UX + State Fixes

**Input**: Spec and plan from `/specs/003-ui-ux-state-fixes/`
**Prerequisites**: spec.md (required), plan.md

## Execution Flow (main)
```
1. Load plan.md (non‑breaking data + reactivity + UX)
2. Generate tasks: deps → store/types → views → polish → tests/docs
3. Different files → [P]; same file → sequential
4. Number tasks sequentially (T001+)
5. Provide dependencies and parallel run example
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: M1 — Store, Types, Deps
- [x] T001 Deps: install `zustand` and `nanoid`; keep Mantine as-is. Update `package.json`.
- [x] T002 Types & repository: extend `Assignment` in `src/store/types.ts` with `completedAt?: string | null`, `archivedAt?: string | null`; add `src/store/repository.ts` with methods:
  - `toggleDone(id)` → set `completed` true/false and set/clear `completedAt` (now/ null)
  - `archiveCompletedOlderThan(days=90)` → set `archivedAt=now` for items with `completedAt < now-90d` and `archivedAt=null`
  - On app boot: invoke `archiveCompletedOlderThan()`
- [ ] T003 Store (`src/store/app.ts`): create Zustand store with state `{ classes[], assignments[], lastChangeToken }`, actions `loadAll(), addClass(), updateClass(), deleteClass(), addAssignment(), updateAssignment(), deleteAssignment(), toggleDone()`; each action persists via repository THEN updates in-memory state and bumps `lastChangeToken`; add selectors `selectToday(now)`, `selectUpcoming(now, { includeDone, filter })`, `countTodayProgress(now)`; export a single store instance.

## Phase 3.2: M2 — Today & Header
- [ ] T004 Today page (`src/pages/Today.tsx`): use store selectors to compute `totalToday` and `completedToday`; render `<ProgressHeader totalToday={X} completedToday={Y} />`; page re-renders when `lastChangeToken` changes; empty state CTA opens Assignment form; persist QuickFilters (All/Overdue/Today/Done) in URL hash.
- [ ] T005 Upcoming page (`src/pages/Upcoming.tsx`): group by date (dayjs); include Done items (muted + strikethrough + check); add filter pills: All | Overdue | Due soon (<=7d) | Done; do NOT remove items on toggleDone — only style/move when filtered by Done.

## Phase 3.3: M4 — Classes CRUD
- [ ] T006 Classes page (`src/pages/Classes.tsx`): header “Add class” button (shortcut: `c`); modal for name (required), emoji (picker/free text), color (swatch); card shows count of open tasks; overflow menu → Edit, Delete (warn: also deletes its assignments).

## Phase 3.4: M2/M3 — UI Components & Behavior
- [ ] T007 ProgressHeader (`src/ui/ProgressHeader.tsx`): keep centered label for 1–3 digits using `Center` and tabular/lining numerals; hide label when `totalToday=0`; greeting “Good morning/afternoon/evening” by local time; optional name from local settings, fallback “there”.
- [ ] T008 AssignmentCard tweaks (`src/ui/AssignmentCard.tsx`): Overflow menu: Edit, Delete, Snooze 1h (optional: shift due by +1h); visuals — overdue = left border red; done = gray text + strikethrough.

## Phase 3.5: M5 — Keyboard & Toasts, Tests, Docs
- [ ] T009 Keyboard & toasts: global hotkeys — `a` add assignment, `c` add class, `/` focus search (stub), `e` edit focused card, `Backspace` delete with confirm; toast on save/delete/toggle; undo delete restores from temp cache within 10s.
- [ ] T010 Tests: 
  - `tests/unit/store.store.spec.ts`: toggleDone sets/unsets `completedAt`, selectors recompute
  - `tests/unit/store.progress.spec.ts`: today progress math (done/total, zero-state)
  - `tests/unit/store.archive.spec.ts`: `archiveCompletedOlderThan` archives items older than 90d
  - `tests/unit/ui/upcoming.spec.tsx`: done items remain visible after toggle; filters work
- [ ] T011 README: document Done behavior + 90‑day archival; shortcuts list; how to reset local data for debugging.

## Dependencies
- M1 (T001–T003) before pages/components (T004–T008) and polish/tests (T009–T011).
- UI tasks T007–T008 can proceed after store selectors are available.
- Tests follow corresponding implementations; README last.

## Parallel Example
```
# After T003 (store ready), run these in parallel:
Task: ProgressHeader tweaks (src/ui/ProgressHeader.tsx) [P]
Task: AssignmentCard tweaks (src/ui/AssignmentCard.tsx) [P]
Task: Upcoming filters UI (src/pages/Upcoming.tsx) [P]
```

## Notes
- [P] tasks = different files, no dependencies
- Keep tasks atomic; commit after each
- Do NOT break existing store consumers; export a single store instance

## Validation Checklist
- [ ] Store exposes subscribe/reactivity; pages update without manual refresh
- [ ] Today ring math and zero-state match spec
- [ ] Upcoming keeps done visible with filters; cleanup archives >90d
- [ ] Classes CRUD works with counts
- [ ] Hotkeys + toasts function
- [ ] Tests passing; README updated
