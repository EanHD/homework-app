# Research: Homework Buddy Web

Decision: UI library = Mantine
- Rationale: Rich component set (Drawer, Tabs, Inputs), responsive defaults, theming supports custom primary palette (#1E88E5) easily.
- Alternatives: MUI (heavier bundle, more boilerplate), Chakra (good, but Mantine’s Drawer/Date inputs are convenient).

Decision: Storage = IndexedDB via localforage
- Rationale: Simple Promise API, cross-browser IndexedDB abstraction, supports drivers and testing adapters.
- Alternatives: direct IndexedDB (more verbose), idb-keyval (lighter but fewer features).

Decision: Timezone/day boundary
- Rationale: Use device-local timezone; “today” = items due whose local date matches current local date. This matches user expectation and offline device behavior.
- Alternatives: UTC normalization (adds cognitive overhead for end users).

Decision: Notifications
- Rationale: Request permission in-app; schedule same-day notifications via Service Worker where supported. For browsers lacking showTrigger/periodic background sync, rely on app-open checks and immediate ‘due now’ notifications.
- Alternatives: None that work fully offline without a backend.

Decision: Reminder offset (v1)
- Rationale: Default to at-due-time notification. Offsets configurable later.
- Alternatives: 5/10/30-min presets now (defer to v2).

Decision: Duplicate titles
- Rationale: Allowed; uniqueness not required functionally. Users can disambiguate by class and date.

Decision: Notes field
- Rationale: Defer; core scope focuses on title, due date, class. Keep model extendable.

Decision: Upcoming filtering by class
- Rationale: Defer for v2; keep simple list sorted by due date in v1.

Open Risks
- Background notification scheduling varies by browser. Mitigation: graceful fallback and clear UI state.
- PWA install prompts differ. Mitigation: expose install availability and instructions, avoid blocking flows.

