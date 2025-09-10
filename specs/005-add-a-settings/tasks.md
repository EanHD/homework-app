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
- [ ] T001 Store — `src/store/settings.ts`: Create Zustand slice with defaults `{ notificationsEnabled: true, reminderOffset: 30, quietHours: { enabled: false, start: "22:00", end: "07:00" }, theme: "light", fontScale: "normal" }`. Persist to localStorage and hydrate on boot.

## Phase 3.2: Settings Page (M2)
- [ ] T002 Page — `src/pages/Settings.tsx`: Build Settings UI using Mantine components. Groups:
  - Notifications → Switch "Enable notifications", Select "Default offset" (10/30/60 min), Switch "Quiet hours" + TimeInputs (start/end)
  - Appearance → Switch "Dark mode", SegmentedControl "Font size"
  - Data → Buttons: Export JSON, Import JSON, Clear all
  - Onboarding → Buttons: Replay tour, Add sample data
  - About → Card with app name and version
  Save changes immediately to the store.

## Phase 3.3: Integration (M3)
- [ ] T003 Integration — Wire settings across app:
  - Notification scheduling respects `settings.notificationsEnabled`, `reminderOffset`, `quietHours`
  - Apply `theme` and `fontScale` to `MantineProvider`
  - Connect Onboarding “Replay” and “Sample data” actions
  - Wire Data actions to existing Export/Import methods

## Phase 3.4: Tests (M4)
- [ ] T004 [P] Tests — `tests/unit/settings.test.ts`: toggles persist, `reminderOffset` changes, quiet hours helper logic (midnight wrap).
- [ ] T005 [P] Tests — `tests/integration/notifications.test.ts`: disabling notifications prevents scheduling.
- [ ] T006 [P] Tests — `tests/integration/exportimport.test.ts`: export/import still functional via Settings page flows.

## Phase 3.5: Docs (M4)
- [ ] T007 [P] README — Update README with a “Settings” section (screenshots). Document notification defaults, quiet hours, theme, and export/import behaviors.

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
- [ ] Settings slice persists and hydrates correctly
- [ ] Settings page updates store immediately and reflects values
- [ ] Notification scheduling respects disable/offset/quiet hours
- [ ] Theme and font scale apply globally
- [ ] Export/Import and Clear all accessible from Settings
- [ ] Tests pass; README updated with screenshots

````

