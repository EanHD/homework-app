# Implementation Plan: UI/UX + State Fixes (003)

Created: 2025-09-09  
Status: Draft (Phase 2 Plan)  
Scope: Non‑breaking data upgrades + reactivity + UX improvements for Today/Upcoming/Classes.

## Execution Flow (main)
```
1. Confirm non-breaking store updates; keep existing public contracts
2. Choose reactivity approach (enhance current store vs. add Zustand)
3. Implement M1..M5 in small, verifiable steps
4. STOP — Ready for /tasks generation
```

---

## Tech & Constraints
- React 18 + Vite + TypeScript + Mantine
- Keep current store shape; prefer enhancing existing store (subscribe + selectors) over adding new dependency
- A11y: landmarks, focus outlines, reduced motion
- Non‑breaking: add optional fields only; migrate existing state by backfilling with `null`

---

## Milestones

### M1 — Store & Types
- Types: extend `Assignment` with `completedAt?: string | null`, `archivedAt?: string | null`
- Migration: on hydrate, backfill missing fields as `null`
- Reactivity: ensure a single shared store instance; pages subscribe to store changes (we already expose `subscribe()`)
- Mutations: `add/update/remove/toggleComplete` must notify subscribers (already via `setState`) and persist
- Selectors: add helpers `getTodayTotals(state)` and `isArchived(a)`

### M2 — Today & Header
- Header: restore friendly greeting (time‑aware) + right‑aligned RingProgress
- Ring: center label with tabular numerals; hide label when total=0
- Progress math: numerator = count of today‑due & done; denominator = count of today‑due (done + not done)
- Reactivity: Today list re-renders by subscribing to store; no manual refresh
- Filters: QuickFilters persist in URL hash `?filter=overdue|today|done` (read/write on mount/change)

### M3 — Upcoming behavior
- Keep done items visible with muted/strikethrough + checkmark style
- Filter bar: All | Overdue | Due soon (≤3 days) | Done
- Cleanup service: on app boot (and periodic), archive items where `completedAt` > 90 days; set `archivedAt` and remove from default lists (All excludes archived)
- Optional settings action: “Archive done now” to trigger cleanup manually

### M4 — Classes CRUD
- Add “Add class” button (header); modal for name, emoji, color
- Edit/Delete from overflow menu (delete confirms); update counts
- Open tasks per class computed via selectors (exclude archived)

### M5 — Polish & Tests
- Toasts with undo for delete (10s)
- Keyboard shortcuts: `a` add assignment, `c` add class, `/` focus search (stub), `e` edit focused, `Backspace` delete with confirm/undo
- Tests:
  - Store reactivity emits updates
  - Progress math & zero ring state
  - Toggle done sets/clears `completedAt`; cleanup archives after 90 days
  - Upcoming keeps done visible + filters
- README: document Done + archive behavior and cleanup cadence

---

## Directory & Changes (targeted)
```
src/store/types.ts          # extend Assignment
src/store/store.ts          # toggleComplete sets completedAt; subscribe notifications intact
src/store/selectors.ts      # today totals, archived filtering, due soon
src/store/cleanup.ts        # background cleanup (archive >90 days after completedAt)
src/pages/Today.tsx         # subscribe; filters in hash
src/pages/Upcoming.tsx      # show done, filters, styles
src/pages/Classes.tsx       # add/edit/delete class modal + counts
src/ui/ProgressHeader.tsx   # greeting + ring centering & zero-state
src/ui/modals/ClassForm.tsx # add/edit class modal (new)
```

---

## Risks & Mitigations
- Multiple store instances: enforce a single store creation site (App entry) and pass via module import or context
- Timezone drift: keep UTC day comparisons consistent with current app/tests
- Undo delete: implement simple timeout queue; ensure persistence only after window elapses or re-create on undo

---

## STOP — Ready for /tasks
- Use tasks to drive incremental implementation and tests

