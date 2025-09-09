# Tasks: UI Redesign (Mantine AppShell + Components)

**Input**: Spec and plan from `/specs/002-redesign-ui/`
**Prerequisites**: spec.md (required), plan.md

## Execution Flow (main)
```
1. Load plan.md (UI-only; keep data layer/routes)
2. Generate tasks: scaffold → core → flows → polish → tests/docs
3. Different files → [P]; same file → sequential
4. Number tasks sequentially (T001+)
5. Provide dependencies and parallel run example
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: M1 — Shell & Theme (scaffold)
- [x] T001 Deps & theme: ensure `package.json` has `@mantine/core`, `@mantine/hooks`, `@mantine/dates`, `dayjs`, `@tabler/icons-react`; create `src/ui/theme.ts` (primary `#1E88E5`, radius 12, sm/md shadows, spacing scale); wrap app in `<MantineProvider>` with global styles + CSS reset.
- [x] T002 AppShell: create `src/ui/AppShell.tsx` with Left `<Navbar>` (Today, Upcoming, Classes using Tabler icons: `IconCalendarDue`, `IconCalendarTime`, `IconBooks`), Top `<Header>` with page title, small current date chip, and desktop “Add” button; responsive drawer navbar for `<1024px` with hamburger.
- [x] T003 Route wiring preserved: introduce pages `src/pages/Today.tsx`, `src/pages/Upcoming.tsx`, `src/pages/Classes.tsx`; render within AppShell main area; keep existing views available until parity.

## Phase 3.2: M2 — Core Components
- [x] T004 [P] ProgressHeader: add `src/ui/ProgressHeader.tsx` (greeting + `RingProgress` showing today’s completion and message “You’re X% done”).
- [x] T005 [P] StreakChip: add `src/ui/StreakChip.tsx` (flame icon + tooltip explaining streak logic) using existing streak selector.
- [x] T006 [P] AssignmentCard: add `src/ui/AssignmentCard.tsx` with checkbox (complete), title, class pill (emoji+color), due time, 3‑dot menu (Edit/Delete/Snooze 1h); visual states: overdue (left red border 3px), completed (muted + strikethrough title).
- [x] T007 [P] DateGroup: add `src/ui/DateGroup.tsx` to render sticky headers like “Wed, Sep 10”.
- [x] T008 [P] EmptyState: add `src/ui/EmptyState.tsx` with illustration placeholder, header, body, and CTA button.
- [x] T009 [P] QuickFilters: add `src/ui/QuickFilters.tsx` (All / Overdue / Due Today / Completed) to filter lists; no data changes — operate on provided items.

## Phase 3.3: M3 — Forms & Flows
- [x] T010 AssignmentForm: add `src/ui/AssignmentForm.tsx` (Modal on desktop, Drawer on mobile) with fields — Title (required), Class (required, select/create), Due date (required), Time (required), Notes (optional), Reminder toggle + minutes (optional); validate required fields with friendly inline messages; on submit call existing create/update then close and toast “Saved”.
- [x] T011 Integrations: wire AssignmentForm into AppShell TopBar “Add” and mobile FAB; wire card menu Edit/Delete actions (Delete can confirm; snooze 1h optional stub).

## Phase 3.4: M4 — Polish & A11y
- [x] T012 A11y & motion: focus outlines, aria‑labels for icons, `prefers-reduced-motion` media handling, AA contrast on text and pills, smooth 150–200ms transitions.
- [x] T013 FAB & shortcuts: mobile FAB (bottom‑right) to open AssignmentForm; keyboard: `/` opens form, `Esc` closes, `Enter` submits if valid.

## Phase 3.5: Tests & Docs
- [ ] T014 [P] Tests: add `tests/unit/ui/assignment-card.spec.tsx` for interactions (toggle complete, open menu, invoke edit/delete callbacks).
- [ ] T015 [P] Tests: add `tests/unit/ui/assignment-form.spec.tsx` for validation (required fields, non‑negative reminder, valid date/time) — render in modal mode.
- [x] T016 README: add “UI System & Theme” section describing tokens, layout, components, and accessibility principles.

## Dependencies
- M1 (T001–T003) before M2–M4.
- Components in M2 are parallelizable ([P]) as they live in separate files.
- AssignmentForm (T010) depends on theme + AppShell + pages.
- FAB & shortcuts (T013) depend on AppShell and AssignmentForm.
- Tests (T014–T015) after related components exist.

## Parallel Example
```
# After T003 (AppShell + pages), run these in parallel:
Task: ProgressHeader (src/ui/ProgressHeader.tsx) [P]
Task: StreakChip (src/ui/StreakChip.tsx) [P]
Task: DateGroup (src/ui/DateGroup.tsx) [P]
Task: EmptyState (src/ui/EmptyState.tsx) [P]
Task: QuickFilters (src/ui/QuickFilters.tsx) [P]
```

## Notes
- [P] tasks = different files, no dependencies
- Keep tasks atomic; commit after each task
- Avoid concurrent edits to the same file across [P] tasks
- Do NOT modify store types or selectors; compose UI on top of existing functions

## Validation Checklist
- [ ] AppShell present and responsive
- [ ] Components render with Mantine theme tokens
- [ ] Form validates and integrates with store actions
- [ ] Accessibility and motion preferences respected
- [ ] Minimal tests added and passing
- [ ] README updated
