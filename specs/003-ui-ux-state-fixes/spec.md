# Feature Specification: UI/UX + State Fixes

**Feature Branch**: `003-ui-ux-state-fixes`  
**Created**: 2025-09-09  
**Status**: Draft  
**Input**: Fix reactivity and UX issues: Today view not refreshing, Classes page lacks add/edit/delete, Today header greeting+progress, Upcoming hides done items (should keep with done state + filters + archive >90 days). Light data upgrades (non‑breaking), centralized reactivity, keyboard shortcuts, toasts with undo, background cleanup, and a11y.

## Execution Flow (main)
```
1. Parse input; confirm non-breaking data changes only
2. Identify reactivity model and single source of truth for pages
3. Define UI behavior updates for Today/Upcoming/Classes
4. Specify background cleanup and keyboard shortcuts
5. Write testable functional requirements + edge cases
6. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Non-breaking store changes only; preserve existing APIs or extend with optional fields
- ✅ Prefer single shared store instance (or event bus) for reactivity across pages
- ✅ Keep Mantine UI patterns and a11y (focus, labels, reduced motion)
- ❌ Do not introduce heavy frameworks; keep bundle light

---

## User Scenarios & Testing (mandatory)

1. Given I add or edit an assignment, When I return to Today, Then the list and progress ring reflect the change without reload.
2. Given I open the Classes page, When I click “Add class”, Then a modal opens; creating a class adds it to the list with open task count; I can edit or delete a class (delete confirms).
3. Given Today has no assignments, When I open Today, Then I see “Good {morning/afternoon/evening}” and an empty ring with no “0% done” text.
4. Given Upcoming shows future assignments, When I mark one as done, Then it remains visible with a done state (strikethrough + check); filters allow switching to All/Overdue/Due soon/Done.
5. Given I completed an assignment over 90 days ago, When I open the app, Then it is archived in the background and removed from default lists.
6. Given I press `a` or `c`, Then the Add Assignment or Add Class form opens; `e` edits the focused card, `Backspace` asks to delete with undo toast; `/` focuses search (stub).
7. Given I navigate via keyboard or screen reader, When I traverse the UI, Then focus outlines are visible, labels are present, and tab order is predictable.

### Edge Cases
- Progress ring always uses today’s due count as denominator (including done), numerator = today done count.
- Toggle done repeatedly: sets/clears `completedAt`; does not alter `archivedAt` until cleanup.
- Timezone: “today” calculated consistently (UTC day like current app) to avoid drift in tests.
- Deleting a class warns that assignments will be deleted (existing rule) and offers undo for 10s.

---

## Requirements (mandatory)

### Data & Store
- **SR-001**: Extend Assignment with optional fields (non-breaking): `completedAt?: string | null`, `archivedAt?: string | null`.
- **SR-002**: On toggle complete: set `completed` boolean and set/clear `completedAt` accordingly; do not set `archivedAt` here.
- **SR-003**: Background cleanup job on app open (and periodically) archives assignments where `completedAt` is older than 90 days: set `archivedAt` and exclude from default lists.
- **SR-004**: Ensure a single shared store instance is used across pages or provide an event-bus; expose `subscribe()` for re-render without prop drilling.
- **SR-005**: Every mutation (create/update/delete/toggle) triggers reactivity so Today/Upcoming/Classes re-render.

### Today View
- **TV-001**: Header shows “Good {morning/afternoon/evening}, {firstName|there}” and a right-aligned progress ring.
- **TV-002**: Ring percent = (count of assignments due today and done) / (count due today), rounded 0–100.
- **TV-003**: When zero total due today: show empty ring, no label inside, tooltip “No assignments yet”.

### Upcoming View
- **UV-001**: Group assignments by date; show done items in place with muted/strikethrough style and a check.
- **UV-002**: Filters: All | Overdue | Due soon | Done; default = All.
- **UV-003**: Done items remain visible until auto-archived by cleanup; users can toggle done state.

### Classes View
- **CV-001**: Grid/list of classes with emoji, name, color, and count of open tasks.
- **CV-002**: “Add class” primary button; modal to add (emoji, color, name); allow edit and delete (with confirm).

### UX Enhancements
- **UX-001**: Keyboard shortcuts: `a` (add assignment), `c` (add class), `/` (focus search – stub), `e` (edit focused card), `Backspace` (delete with confirm/undo).
- **UX-002**: Toasts with undo for delete actions (10s window).
- **UX-003**: A11y: focus outlines, aria labels, predictable tab order; respects reduced motion.

### Tests
- **TS-001**: Store reactivity test: subscribing to store receives updates on add/update/delete/toggle.
- **TS-002**: Completed/archival logic: toggling sets/clears `completedAt`; archival sets `archivedAt` after 90 days.
- **TS-003**: Today progress ring calculation aligns with spec (numerator/denominator rule) and zero-state behavior.

---

## Key Entities
- Assignment (extended):
  - `completedAt?: string | null` — set when toggled to done; cleared when undone.
  - `archivedAt?: string | null` — set by background cleaner if `completedAt` older than 90 days.

---

## Review & Acceptance Checklist

### Content Quality
- [ ] No breaking API changes; optional fields only
- [ ] Clear reactivity model specified
- [ ] UI behaviors defined for each view

### Requirement Completeness
- [ ] Tests cover reactivity, completion/archival, and progress
- [ ] Accessibility and keyboard shortcuts addressed
- [ ] Cleanup job behavior specified

---

## Ambiguities / [NEEDS CLARIFICATION]
- Source of firstName for greeting (“there” fallback assumed)
- Archive visibility: separate “Archived” filter needed? (Assume excluded from default lists; optional filter later)
- “Due soon” definition (Assume within next 3 days) [NEEDS CLARIFICATION]
- Undo implementation detail: temporary queue vs. re-insert on undo (Assume simple timeout with re-create)

---

## Execution Status
- [ ] Input parsed
- [ ] Requirements generated
- [ ] Ambiguities marked
- [ ] Scenarios defined
- [ ] Spec ready for planning

