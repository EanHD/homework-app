# Feature Specification: Homework Buddy Web — UI Redesign

**Feature Branch**: `002-redesign-ui`  
**Created**: 2025-09-09  
**Status**: Draft  
**Input**: You are redesigning the UI of “Homework Buddy Web” into a modern, friendly dashboard. Keep the current data layer and routes; focus on polished React UI (Vite + TS). Use Mantine (preferred) or MUI; no CSS chaos. Feel like a lightweight Notion/Calendar hybrid.

Design goals:
- Calm, bright, simple. White canvas, blue accents (#1E88E5), slate grays for text.
- Top app bar with title + “Add” button; left sidebar for navigation.
- Content as cards with generous whitespace, 12px radius, soft shadows.
- Zero-conf onboarding: helpful empty states and a 60-second “first task” flow.

Layout:
- AppShell: LeftNav (icons + labels), TopBar (title, date, quick add).
- Main views: Today, Upcoming, Classes.
- Floating Add button on mobile; TopBar button on desktop.
- Modal/Drawer form for “Add Assignment”. Keep it < 5 inputs + validation.

Components:
- ProgressHeader: “Good afternoon, <name>” + ring showing today’s completion.
- AssignmentCard: checkbox, title, class pill (emoji+color), due time, 3-dot menu.
- DateGroup: sticky headers “Wed, Sep 10”.
- StreakChip: tiny flame + “3-day streak”.
- EmptyState: illustration + microcopy + “Add your first assignment”.
- QuickFilters: All / Due today / Overdue / Completed.

UX touches:
- Keyboard shortcuts: “/” to add, “⌘K/Ctrl+K” to search (future), “E” to edit selected.
- Small haptics on mobile (if supported).
- Smooth 150–200ms transitions, no heavy animations.

Accessibility:
- AA contrast, focus outlines visible, semantic landmarks.
- Prefers-reduced-motion respected.

Responsiveness:
- ≥1024px: persistent sidebar; <1024px: collapsible drawer.
- Cards become compact list rows on very small screens.

Deliverables:
- `src/ui/` theme tokens + AppShell.
- Redesigned Today, Upcoming, Classes views.
- Reusable AssignmentForm Modal/Drawer.
- Empty states, Streak/Progress components.
- Minimal unit tests for AssignmentCard and AssignmentForm validation.
- README section: “UI System & Theme”.

## Execution Flow (main)
```
1. Parse user input; confirm scope is UI-only; preserve existing store/routes
2. Extract design goals → convert to testable, UI-focused requirements
3. Define pages, layout, and components as deliverables (no data changes)
4. Mark any ambiguities as [NEEDS CLARIFICATION]
5. Produce acceptance scenarios focused on UI/UX behavior and a11y
6. Generate functional requirements for layout, responsiveness, a11y, and interactions
7. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT the UI must present and HOW it should behave for users
- ❌ No data model changes; reuse current store and routes
- 🎨 Mantine-first; minimal custom CSS; use theme tokens

---

## User Scenarios & Testing (mandatory)

### Primary Story
As a student, I want a calm dashboard with clear navigation and quick adding so I can see what’s due, get a sense of progress and streak, and add tasks in under a minute.

### Acceptance Scenarios
1. Given a fresh install, When I open the app, Then I see an onboarding empty state with a prominent Add button that opens the Assignment form pre-focused on Title.
2. Given Today has assignments, When I open Today, Then I see a ProgressHeader with a ring percent and a streak chip; assignments are grouped by time or day with clear due times.
3. Given Upcoming has future assignments, When I switch to Upcoming via LeftNav or TopBar, Then I see date-grouped lists with sticky headers.
4. Given I select “Overdue” in QuickFilters, Then only overdue items appear and the filter is visually indicated.
5. Given I press “/” from any main view, Then the Add Assignment modal/drawer opens; Escape closes it and returns focus to the prior trigger.
6. Given I have screen reader enabled, When I navigate, Then landmarks (header/nav/main) are exposed and buttons/controls have helpful labels; focus outlines are visible.
7. Given reduced motion is enabled, When I navigate or open drawers, Then transitions are minimized while remaining perceivable.

### Edge Cases
- Very long titles wrap gracefully without shifting controls.
- Many classes: class pill truncates or ellipsizes but has a tooltip on hover.
- Narrow screens (<360px): card becomes compact list row with tap targets ≥44px.
- Offline: UI shows no network indicators only when relevant; all actions remain local.
- Keyboard-only usage: All interactive elements reachable via Tab order.

## Requirements (mandatory)

### Functional Requirements (UI)
- **FR-UI-001**: Provide an AppShell with left sidebar navigation (Today, Upcoming, Classes) and a TopBar showing title and current date.
- **FR-UI-002**: Include a primary Add button in TopBar on desktop and a floating Add button on mobile (<1024px).
- **FR-UI-003**: Use Mantine theme with primary color #1E88E5; define spacing, radius (12px), and shadow tokens under `src/ui/theme`.
- **FR-UI-004**: Today view shows a ProgressHeader (greeting + ring progress) and a StreakChip; lists render AssignmentCards with checkbox, title, class pill (emoji+color), due time, and a 3-dot menu.
- **FR-UI-005**: Upcoming view groups assignments by calendar date with sticky DateGroup headers (e.g., “Wed, Sep 10”).
- **FR-UI-006**: Classes view shows class cards/rows with emoji, name, and color; handles empty state with guidance.
- **FR-UI-007**: Assignment form is modal (desktop) or drawer (mobile) with ≤5 inputs (Title, Class select/create inline, Due date/time, optional Notes, optional Reminder minutes) and validation; submit focuses newly created item’s region.
- **FR-UI-008**: Provide QuickFilters (All / Due today / Overdue / Completed) above lists; filter state is reflected in UI and accessible labels.
- **FR-UI-009**: Implement keyboard shortcuts: “/” opens Add form, “E” edits selected card (or opens inline action), “⌘K/Ctrl+K” reserved for future search; shortcuts are announced in a Help tooltip.
- **FR-UI-010**: Respect prefers-reduced-motion; default transitions are 150–200ms; no heavy animations.
- **FR-UI-011**: Meet WCAG AA contrast; show visible focus outlines; use semantic landmarks (`header`, `nav`, `main`).
- **FR-UI-012**: Responsiveness: persistent sidebar ≥1024px; collapsible/drawer nav below; cards adapt to compact list rows on very small screens.
- **FR-UI-013**: Do not modify store APIs or routes; integrate with existing selectors and actions only.

### Non-Functional / Constraints
- Mantine as primary UI system with minimal custom CSS; use theme tokens.
- Keep bundle impact reasonable; no heavy animation libs.

### Deliverables (Implementation Targets)
- `src/ui/theme.ts` — theme tokens (colors, radius, shadows, typography scale, motion).
- `src/ui/AppShell.tsx` — LeftNav, TopBar, responsive layout.
- `src/components/ProgressHeader.tsx` — greeting + RingProgress.
- `src/components/DateGroup.tsx` — date header with sticky behavior.
- `src/components/AssignmentCard.tsx` — updated style and 3-dot menu (menu items stubbed if needed).
- `src/components/EmptyState.tsx` — illustration + microcopy; CTA opens Add form.
- `src/components/QuickFilters.tsx` — filter toggles.
- `src/components/AssignmentFormModal.tsx` — desktop modal; reuse Drawer on mobile.
- Views wired in `src/components/TodayView.tsx`, `UpcomingView.tsx`, `ClassesView.tsx` with redesigned layout.
- Tests: minimal unit tests for AssignmentCard rendering and AssignmentForm validation rules.
- README: “UI System & Theme” section describing tokens, layout, and principles.

## Key Entities
- No changes to data entities. Reuse existing Class, Assignment, and Preferences from the current store.

---

## Review & Acceptance Checklist

### Content Quality
- [ ] No data model changes required
- [ ] UI scope is clear and testable
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] Ambiguities resolved or marked
- [ ] Requirements are testable and unambiguous
- [ ] Accessibility and responsiveness addressed

---

## Ambiguities / [NEEDS CLARIFICATION]
- Preferred sidebar items order and icons? (Assumed: Today, Upcoming, Classes)
- Greeting personalization: use user-provided name or generic? (Assume generic “there”) [NEEDS CLARIFICATION]
- Date grouping granularity for Today: group by time-of-day (Morning/Afternoon/Evening) or just a flat list? [NEEDS CLARIFICATION]
- 3-dot menu actions: Edit, Delete, Snooze? (Scope: Edit only; others optional) [NEEDS CLARIFICATION]
- QuickFilters composition prominence on mobile — toolbar vs. dropdown? (Assume toolbar that wraps) [NEEDS CLARIFICATION]

---

## Execution Status
- [ ] Input parsed
- [ ] Requirements generated
- [ ] Ambiguities marked
- [ ] Scenarios defined
- [ ] Spec ready for planning

