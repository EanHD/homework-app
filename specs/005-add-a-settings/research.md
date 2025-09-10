# Research: Settings Feature Decisions

## Decisions

- Entry point: Add a dedicated “Settings” tab in the primary navigation (sidebar). If space is constrained, mirror access via the overflow menu.
- Persistence: Store preferences in the Zustand app store and persist via localStorage (middleware). Core data (classes/assignments) continues in IndexedDB via localforage.
- Reminder offset: Fixed options for v1 — 10 min, 30 min, 60 min before due. No custom minutes in v1 to reduce complexity; can extend later.
- Quiet Hours: Represent as start and end times (HH:mm, local time). Suppression happens at send-time: any reminder whose delivery time falls within quiet hours will not be shown. Intervals spanning midnight are handled in logic (see helper below).
- Import behavior: Import/merge ONLY classes and assignments; preferences are not modified by import to avoid unexpected UI changes. Invalid payloads fail with clear error, leaving existing data untouched.
- Clear All Data: Clears classes and assignments (storage + in-memory). Preferences remain unchanged. Provide Undo that restores previous classes/assignments snapshot within a short window.
- “Replay tour”: Sets `seenOnboarding = false` and triggers OnboardingHints on next render; also provide direct trigger from Settings.
- “Reset sample data”: Clears classes/assignments and seeds the default sample data. Offers Undo as with other destructive actions.
- Theme: Provide Light/Dark toggle for v1. No “System” mode initially; can add later.
- Font scale: Two values for v1 — Normal (1.0), Large (~1.125–1.2). Applies via Mantine theme provider.
- Accessibility: All controls have aria-labels; respects prefers-reduced-motion by reducing non-critical transitions in Settings.

## Rationale
- Fixed options for reminder offset simplify UI and reduce edge cases; most students fit these presets.
- Keeping import from changing preferences prevents surprising theme/behavior shifts after a restore.
- Quiet hours spanning midnight are common; implementing inclusive interval logic keeps behavior predictable.
- Limiting scope (no “System” theme, no custom offsets in v1) keeps the feature shippable and consistent with YAGNI.

## Helper Logic Sketch
- isWithinQuietHours(now, start, end):
  - If start <= end: return start <= now < end
  - Else (spans midnight): return now >= start OR now < end
- applyDefaultReminder(dueAt, offset): reminderAt = dueAt - offset
- scheduling guard: if notificationsEnabled === false → skip scheduling; if quietHoursEnabled && isWithinQuietHours(reminderAt) → suppress

## Alternatives Considered
- Importing preferences alongside data → Rejected for v1 to avoid jarring UI changes post-import.
- Custom reminder minutes → Deferred to v2; adds validation and UI complexity.
- System theme option → Deferred; Mantine supports it but out-of-scope for immediate needs.

## Open Items De-scoped to v2
- Custom reminder offsets
- “Use system theme”
- Granular export/import subsets (e.g., only classes)

Status: Complete
