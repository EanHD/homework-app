# Tasks: Homework Buddy Web

**Input**: Design documents from `/specs/001-build-homework-buddy/`
**Prerequisites**: plan.md (required), research.md, data-model.md

## Execution Flow (main)
```
1. Load plan.md (tech stack: React+Vite+TS, Mantine, localforage, Vitest)
2. Load data-model.md (Class, Assignment, Preferences)
3. Generate tasks: setup → tests → core → integration → polish
4. Different files → [P]; same file → sequential
5. Number tasks sequentially (T001+)
6. Provide dependencies and parallel run example
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup (M1 Scaffold + Theme + Routing)
- [x] T001 Initialize Vite React+TS app; add dependencies in `package.json` (react, react-dom) and devDeps (vite, vitest, @vitejs/plugin-react, typescript); add deps: `@mantine/core`, `@mantine/hooks`, `dayjs`, `localforage`, `workbox-window`.
- [x] T002 Create base config files: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`; set alias `@ -> /src` and test config for Vitest.
- [x] T003 Create PWA shell files: `index.html` with manifest link, `public/manifest.webmanifest`, placeholder icons `public/icon.svg` and `public/maskable.svg`.
- [x] T004 Create app entry: `src/main.tsx`, `src/App.tsx`, `src/theme.ts` (Mantine light theme with primary blue `#1E88E5`).
- [x] T005 Basic routing/tabs: Today and Upcoming navigation in `src/App.tsx` using Mantine Tabs (no data yet).

## Phase 3.2: Tests First (TDD) – Store and Selectors
- [x] T006 [P] Create unit test skeleton `tests/unit/store.spec.ts` covering: add/update/remove class; add/update/remove assignment; toggle complete; streak calculation; today/upcoming selectors; persistence hydrate/save mocks.
- [x] T007 [P] Create unit test `tests/unit/selectors.spec.ts` for `progressPercent`, `getAssignmentsForToday`, `getIncompleteAssignmentIds`, `byDueDateAscending`, `streakDays` with fixed dates via `vi.setSystemTime`.

## Phase 3.3: Core Implementation (M2 CRUD + Lists + Forms)
- [x] T008 Define types and store scaffolding in `src/store/types.ts` and `src/store/store.ts` (state, actions, context/provider); include persistence hooks.
- [x] T009 Implement selectors in `src/store/selectors.ts` (`getAssignmentsForToday`, `getIncompleteAssignmentIds`, `byDueDateAscending`, `progressPercent`, `streakDays`, `getClassMap`).
- [x] T010 Implement persistence with IndexedDB via localforage in `src/store/persistence.ts` (keys, load/hydrate, save with debounce); wire into store.
- [x] T011 [P] UI components: `src/components/ProgressRing.tsx`, `src/components/StreakChip.tsx` (streak indicator), `src/components/AssignmentCard.tsx`.
- [x] T012 [P] Screens: `src/components/TodayView.tsx`, `src/components/UpcomingView.tsx`, `src/components/ClassesView.tsx` consuming selectors and components.
- [x] T013 Lists: `src/components/AssignmentList.tsx` to render ordered assignments with class badge, overdue styles.
- [x] T014 Forms: Bottom drawer add/edit in `src/components/AssignmentFormDrawer.tsx` (fields: title, class select or create inline (emoji+color), due datetime, notes, remindAt minutes); validation and submit to store.
- [x] T015 Update `data-model.md` to include `notes` (string|null) and `remindAtMinutes` (number|null) on Assignment; adjust tests if needed.
- [x] T016 Ensure tests T006–T007 now pass for CRUD and selectors.

## Phase 3.4: Integration (M3 Notifications + PWA)
- [x] T017 PWA manifest: fill name/short_name/theme_color/icons in `public/manifest.webmanifest`; verify paths and maskable icon.
- [x] T018 Service worker: add `public/sw.js` (or `src/sw.ts` with build copy) with offline caching strategy (app shell + runtime caching of static assets) and notification event handling (`notificationclick`).
- [x] T019 SW registration: `src/sw-registration.ts` using `workbox-window` with update flow and registration; import from `src/main.tsx`.
- [x] T020 Notification prompts: `src/components/NotificationsToggle.tsx` to request permission and reflect state.
- [x] T021 Scheduling: implement simple in-app scheduler using `setTimeout` for near-future reminders while app open; on app start, check for due/overdue items and `showNotification` via SW if available; fallback to no-op when unsupported.
- [x] T022 Wire scheduling from store changes: when new assignment or due time changes and permission granted → (re)schedule; cancel on completion/removal.
- [ ] T021 Scheduling: implement simple in-app scheduler using `setTimeout` for near-future reminders while app open; on app start, check for due/overdue items and `showNotification` via SW if available; fallback to no-op when unsupported.
- [ ] T022 Wire scheduling from store changes: when new assignment or due time changes and permission granted → (re)schedule; cancel on completion/removal.

## Phase 3.5: Polish + Tests + Deploy (M4)
- [x] T023 [P] Accessibility/UI polish: focus order, aria labels, color contrast; empty states for lists.
- [ ] T024 [P] Additional unit tests in `tests/unit/store.spec.ts` for persistence edge cases and streak boundaries (midnight/DST).
- [ ] T025 GH Pages deploy: add `npm run build` output to `dist/`; add `vite.config.ts` `base` for repo path; add GitHub Actions workflow `.github/workflows/gh-pages.yml` to deploy `dist` to Pages.
- [x] T025 GH Pages deploy: add `npm run build` output to `dist/`; add `vite.config.ts` `base` for repo path; add GitHub Actions workflow `.github/workflows/gh-pages.yml` to deploy `dist` to Pages.
- [x] T026 Readme: update project README with setup, dev, build, deploy instructions.

## Dependencies
- Setup (T001–T005) before tests and core.
- Tests (T006–T007) should be authored before core; expect failures until T008–T013 complete.
- T008 blocks T009–T010; T011–T013 can proceed once types are defined.
- T014 depends on store and selectors; T015 updates model followed by test updates.
- PWA tasks T017–T021 depend on scaffold and basic app structure.
- Deploy T025 depends on successful build.

## Parallel Example
```
# After T008 (types/store), run these in parallel:
Task: "UI components in src/components/ProgressRing.tsx, StreakChip.tsx, AssignmentCard.tsx" [P]
Task: "Screens in src/components/TodayView.tsx, UpcomingView.tsx, ClassesView.tsx" [P]

# Initial tests can be created in parallel:
Task: "Create unit test skeleton tests/unit/store.spec.ts" [P]
Task: "Create unit test tests/unit/selectors.spec.ts" [P]
```

## Notes
- [P] tasks = different files, no dependencies
- Ensure tests fail initially (TDD) then pass after implementation
- Keep tasks atomic; commit after each task
- Avoid concurrent edits to the same file across [P] tasks

## Validation Checklist
- [ ] All entities have related store tasks
- [ ] Tests precede implementation
- [ ] Parallel tasks are independent
- [ ] Each task specifies exact file paths
- [ ] PWA and notifications covered
