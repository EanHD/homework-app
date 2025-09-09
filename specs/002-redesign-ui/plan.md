# Implementation Plan: UI Redesign (002-redesign-ui)

Created: 2025-09-09  
Status: Draft (Phase 2 Plan)  
Scope: UI-only redesign using Mantine; preserve current data layer and view wiring.

## Execution Flow (main)
```
1. Confirm scope: UI only; no store/API changes (guardrail)
2. Define milestones M1–M4 and map to files and components
3. Specify directory structure and theme tokens under src/ui/
4. Identify dependencies and sequencing; outline risks and non-goals
5. STOP — Ready for /tasks generation
```

---

## Tech Stack & Constraints
- React 18 + Vite + TypeScript
- Mantine UI 7.x; minimal custom CSS only for small utilities
- Existing store/selectors/persistence remain unchanged
- Accessibility: WCAG AA; landmarks; visible focus; prefers-reduced-motion respected
- Performance: keep bundle lean; optional list virtualization if needed later

---

## Milestones (from user input)

### M1 — Shell & Theme (scaffold)
- Theme tokens in `src/ui/theme.ts`:
  - Colors: primary `#1E88E5`, slate grays for text
  - Radius: 12px; Shadows: soft; Spacing + Typography scale
  - Motion: default transitions 150–200ms; reduced motion support
- AppShell in `src/ui/AppShell.tsx`:
  - LeftNav (icons + labels): Today, Upcoming, Classes
  - TopBar (title, current date, Add button); desktop shows Add in TopBar
  - Main area renders current view; existing view wiring preserved
  - Responsive: ≥1024px persistent sidebar; <1024px collapsible/drawer
- Wire AppShell around existing views (Today/Upcoming/Classes). If no router, use internal state; do not alter routes/data.

### M2 — Core Components
- `ProgressHeader` (greeting + RingProgress) using existing selectors
- `StreakChip` (flame + “N‑day streak”) — reuse existing component style, refresh visuals
- `AssignmentCard` (checkbox, title, class pill with emoji/color, due time, 3‑dot menu)
- `DateGroup` (sticky date headers, e.g., “Wed, Sep 10”)
- `EmptyState` (illustration + microcopy; CTA opens Add form)
- `QuickFilters` (All / Due today / Overdue / Completed)
- Optional: list virtualization if rendering cost warrants (defer until needed)

### M3 — Forms & Flows
- `AssignmentForm` as Modal (desktop) / Drawer (mobile)
  - Inputs ≤5: Title, Class select/create, Due date+time, Notes (optional), Reminder (optional)
  - Validation + friendly errors; pre-focus Title; ESC closes; return focus to trigger
- Card menu: Edit/Delete (Delete can be stubbed if out of scope; Edit wired to existing actions)

### M4 — Polish & A11y
- Transitions (150–200ms), focus states, keyboard shortcuts
  - `/` Add, `E` Edit selected card, `⌘K/Ctrl+K` reserved for future search
- Mobile FAB (<1024px) that opens Add
- Snapshot/minimal unit tests: AssignmentCard render; AssignmentForm validation
- README: “UI System & Theme” with tokens and layout principles

---

## Directory Structure (incremental additions)
```
src/
├── ui/
│   ├── theme.ts              # Mantine theme tokens (primary, radius 12px, shadows)
│   └── AppShell.tsx          # LeftNav, TopBar, responsive layout
├── components/
│   ├── ProgressHeader.tsx    # greeting + RingProgress
│   ├── DateGroup.tsx         # sticky date header
│   ├── EmptyState.tsx        # onboarding empty states
│   ├── QuickFilters.tsx      # list filters
│   ├── AssignmentCard.tsx    # updated visuals + 3-dot menu
│   └── AssignmentFormModal.tsx  # modal wrapper around existing Drawer
```

---

## Sequencing & Dependencies
- M1 precedes all (theme + shell)
- M2 can proceed in parallel across separate files; ensure no shared-file conflicts
- M3 depends on M2 (cards/menu) and existing `AssignmentFormDrawer`
- M4 follows after core flows exist

---

## Acceptance & Testing
- Unit tests (Vitest):
  - AssignmentCard renders class pill, title, due, menu button
  - AssignmentForm validation: required Title, valid date/time, non-negative reminder
- Manual a11y checks: focus order, landmarks, reduced motion

---

## Risks & Mitigations
- Route expectations vs current Tabs: If no router, keep Tabs or local state; do not introduce breaking navigation
- Visual regressions: rely on Mantine tokens and modest CSS; snapshot tests for key components
- Performance: defer virtualization unless needed; keep lists simple

---

## Non-Goals
- No changes to data model, store contracts, or persistence
- No backend or sync features; offline remains local

---

## STOP — Ready for /tasks
- Use `/templates/tasks-template.md` to generate `tasks.md`
- Do not create `tasks.md` in this plan phase

