````markdown
# Tasks: Settings

**Input**: Design documents from `/specs/005-add-a-settings/`
**Prerequisites**: plan.md (required), research.md, data-model.md

## Execution Flow (main)
```
1. Load plan.md (milestones M1–M4)
2. Generate tasks: store → page → integration → tests/docs
3. Different files → [P]; same file → sequential
4. Number tasks sequentially (T001+)
5. Provide dependencies and parallel run example
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Store & Schema (M1)
- [x] T001 Store — `src/store/settings.ts`: Create Zustand slice with defaults `{ notificationsEnabled: true, reminderOffset: 30, quietHours: { enabled: false, start: "22:00", end: "07:00" }, theme: "light", fontScale: "normal" }`. Persist to localStorage and hydrate on boot.

## Phase 3.2: Settings Page (M2)
- [x] T002 Page — `src/pages/Settings.tsx`: Build Settings UI using Mantine components. Groups:
  - Notifications → Switch "Enable notifications", Select "Default offset" (10/30/60 min), Switch "Quiet hours" + TimeInputs (start/end)
  - Appearance → Switch "Dark mode", SegmentedControl "Font size"
  - Data → Buttons: Export JSON, Import JSON, Clear all
  - Onboarding → Buttons: Replay tour, Add sample data
  - About → Card with app name and version
  Save changes immediately to the store.

## Phase 3.3: Integration (M3)
- [x] T003 Integration — Wire settings across app:
  - Notification scheduling respects `settings.notificationsEnabled`, `reminderOffset`, `quietHours`
  - Apply `theme` and `fontScale` to `MantineProvider`
  - Connect Onboarding “Replay” and “Sample data” actions
  - Wire Data actions to existing Export/Import methods

## Phase 3.4: Tests (M4)
- [x] T004 [P] Tests — `tests/unit/settings.spec.ts`: toggles persist, `reminderOffset` changes, quiet hours helper logic (midnight wrap).
- [x] T005 [P] Tests — `tests/integration/notifications.spec.ts`: disabling notifications prevents scheduling.
- [x] T006 [P] Tests — `tests/integration/exportimport.spec.tsx`: export/import still functional via Settings page flows.

## Phase 3.5: Docs (M4)
- [x] T007 [P] README — Update README with a “Settings” section (screenshots). Document notification defaults, quiet hours, theme, and export/import behaviors.

## Sneaks (Documented Enhancements)
- [x] S001 [P] CompletedAt Support — Store and display when an assignment was completed:
  - Repo `toggleDone(id)` sets/clears `completedAt`; boot `migrateCompletedAt()` fills legacy done items.
  - Selector `selectDone(now)` sorts by `completedAt` DESC; pages respect Done filter order.
  - UI `AssignmentCard.tsx` shows “Completed • {date}” with tooltip; null-safe.
  - Tests added for toggle/migration and selector sorting.
- [x] S002 [P] Class Modal Emoji Preview — `src/ui/modals/ClassForm.tsx` centers an unclipped emoji in a fixed 44×44 container; aligns with Name/Color inputs.
- [x] S003 [P] Inline Create Class UX — `src/ui/AssignmentForm.tsx`:
  - Emoji field with adjacent `EmojiButton` (size=sm) and description.
  - Color replaced with `ColorField` (swatches + compact ColorPicker + hex input); a11y labels.
  - Fallbacks on save: emoji ‘📘’, color `#1E88E5` if invalid.
  - Basic UI test for ColorField swatch update.

## Dependencies
- Store (T001) before Page (T002) and Integration (T003).
- Integration (T003) before notifications integration test (T005).
- Tests can run in parallel where touching different files: T004, T005, T006, T007 [P].

## Parallel Example
```bash
# After T003 (integration complete), run these in parallel:
Task: Unit tests for settings persistence (tests/unit/settings.test.ts) [P]
Task: Notifications integration test (tests/integration/notifications.test.ts) [P]
Task: Export/Import integration test (tests/integration/exportimport.test.ts) [P]
Task: README updates [P]
```

## Notes
- Keep edits minimal and focused; avoid unrelated refactors.
- Ensure accessibility labels and reduced‑motion guards are respected in the Settings page.

## Validation Checklist
- [x] Settings slice persists and hydrates correctly
- [x] Settings page updates store immediately and reflects values
- [x] Notification scheduling respects disable/offset/quiet hours
- [x] Theme and font scale apply globally
- [x] Export/Import and Clear all accessible from Settings
- [x] Tests pass; README updated with screenshots

````
