````markdown
````markdown
# Tasks: Emoji Picker UX + Onboarding Polish

**Input**: Spec and plan from `/specs/004-emoji-picker-ux/`
**Prerequisites**: spec.md (required), plan.md, research.md, data-model.md

## Execution Flow (main)
```
1. Load plan.md (6 milestones: Store → Today → Upcoming → Classes → Emoji+Onboarding → Safety+PWA)
2. Generate tasks: deps → store/types → pages → components → polish → tests/docs
3. Different files → [P]; same file → sequential
4. Number tasks sequentially (T001+)
5. TDD enforcement: test tasks before implementation
6. Provide dependencies and parallel run example
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: M1 — Store & Types (Foundation)
- [x] T001 **Deps**: Install dependencies: `npm i @emoji-mart/react @emoji-mart/data` (zustand, nanoid already present; Mantine, dayjs already present). Update `package.json`.
- [x] T002 **Types & Repository**: Extend `Assignment` in `src/store/types.ts` with `completedAt?: string | null`, `archivedAt?: string | null`; update `src/store/repository.ts` with methods:
  - `toggleDone(id)` → set `completed` true/false and set/clear `completedAt` (ISO string / null)
  - `archiveCompletedOlderThan(days=90)` → set `archivedAt=now` for items with `completedAt < now-90d` and `archivedAt=null`
  - `exportData()` → serialize classes + assignments to JSON
  - `importData(payload)` → merge imported data with existing
  - Boot hook: invoke `archiveCompletedOlderThan(90)` on app initialization
- [x] T003 **Store Enhancement** (`src/store/app.ts`): Extend Zustand store state with `{ classes[], assignments[], seenOnboarding: boolean, lastUndo?: Snapshot }`, actions `loadAll()`, `addClass()`, `updateClass()`, `deleteClass()` (sets lastUndo), `addAssignment()`, `updateAssignment()`, `deleteAssignment()` (with Undo), `toggleDone()` (set/unset completedAt), `archiveCompletedOlderThan()`, `seedSampleData()`, `exportData()`, `importData()` (with Undo), `setSeenOnboarding(true)`; selectors `countTodayProgress(now)`, `selectToday(now, filter)`, `selectUpcoming(now, filter)`, `openCountByClass(id)`.

## Phase 3.2: M2 — Today Page Enhancements
- [x] T004 **ProgressHeader** (`src/ui/ProgressHeader.tsx`): Use Mantine RingProgress size=96 thickness=10; label centered via `<Center>`. Apply numeric CSS: `font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "lnum" 1`. Hide "% done" label if total=0 (show tooltip "No assignments yet"). Time-aware greeting on left; ring on right.
- [x] T005 **Today Page** (`src/pages/Today.tsx`): Use store selectors; remove manual refreshes. Filter pills → URL hash sync; EmptyState CTA opens AssignmentForm.

## Phase 3.3: M3 — Upcoming Page Enhancements  
- [x] T006 **Upcoming Page** (`src/pages/Upcoming.tsx`): Group assignments by date; include done items (muted + strikethrough + checked icon). Filter pills: All | Overdue | Due soon (≤7d) | Done.

## Phase 3.4: M4 — Classes CRUD
- [x] T007 **Classes Page** (`src/pages/Classes.tsx`): Header with "Add class" button (hotkey `c`). ClassModal: name (required), emoji via EmojiButton, color swatches. Card: emoji, name, color chip, open-task count; overflow menu → Edit/Delete (confirm cascade deletion of assignments).

## Phase 3.5: M5 — Emoji & Onboarding Components
- [x] T008 [P] **EmojiButton** (`src/ui/EmojiButton.tsx`): Mantine Popover + emoji-mart Picker; localStorage for skinTone/recents; props `{ value?, onChange, size?, ariaLabel?, withLabel? }`. Integrate into ClassModal; optional toolbar button inserts emoji at caret in AssignmentForm notes.
- [x] T009 [P] **OnboardingHints** (`src/ui/OnboardingHints.tsx`): Three Popovers guiding: Nav → Add button → Filters; "Got it" + "Add sample data" options. Store `seenOnboarding` flag; expose "Replay tour" in Settings.

## Phase 3.6: M6 — Safety, Convenience & Polish
- [x] T010 **Safety & Convenience**: Toasts for Save/Delete/Snooze/Import with Undo (restore lastUndo snapshot). Snooze actions on AssignmentCard overflow: +1h, Tonight 8pm, Tomorrow 9am.
- [x] T011 **A11y & PWA**: aria-labels on action icons; focus-visible styles; prefers-reduced-motion guards. Validate manifest (`/homework-app/manifest.webmanifest`), icons (192/512/maskable), SW scope (`/homework-app/`), 404 redirect functionality.

## Phase 3.7: M6 — Tests & Documentation
- [x] T012: Additional test coverage (comprehensive tests for progress header, enhanced selectors, archive functionality, and backup/export features)
- [x] T013: Update README documentation (document emoji picker, onboarding, accessibility features, and data management capabilities)

## Dependencies
- M1 (T001–T003) before pages/components (T004–T009) and polish/tests (T010–T013).
- Store selectors (T003) required for page updates (T004–T007).
- EmojiButton (T008) can proceed after dependencies installed (T001).
- Tests (T012) follow corresponding implementations; README (T013) last.

## Parallel Example
```bash
# After T003 (store ready), run these in parallel:
Task: EmojiButton component (src/ui/EmojiButton.tsx) [P]
Task: OnboardingHints component (src/ui/OnboardingHints.tsx) [P]
Task: Test files (tests/unit/*.test.ts) [P]
Task: README updates [P]
```

## Notes
- [P] tasks = different files, no dependencies
- Keep tasks atomic; commit after each
- TDD: tests before implementation where applicable
- Do NOT break existing store consumers; extend functionality gracefully

## Validation Checklist
- [ ] Store exposes new actions and selectors; pages update reactively
- [ ] ProgressHeader shows proper greeting and handles empty state
- [ ] Today/Upcoming filters work with URL hash persistence
- [ ] Classes CRUD includes emoji picker and open-task counts
- [ ] Onboarding guides new users without being intrusive
- [ ] Export/import preserves data integrity with undo support
- [ ] All accessibility requirements met
- [ ] PWA functionality remains intact
- [ ] Tests passing; README updated with new features

````

````
