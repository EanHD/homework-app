# Quickstart: Validate Settings Feature

## Prerequisites
- Install dependencies and run dev server.
- Ensure app loads at `/homework-app/` base.

## Scenarios

1) Access Settings
- Open the app and navigate to Settings from the sidebar or overflow menu.
- Expect grouped sections: Notifications, Appearance, Data, Onboarding, About.

2) Disable Notifications stops scheduling
- In Notifications, toggle Reminders Off.
- Create a new assignment due in ~30 minutes.
- Expect: No reminder is scheduled (store guard prevents it).

3) Default reminder offset applies
- Set default reminder offset to 30 minutes.
- Create an assignment with due time in 2 hours.
- Expect: Reminder time calculated as 90 minutes from now (internal check).

4) Quiet Hours suppresses reminders in window
- Enable Quiet Hours and set 22:00–07:00.
- Create a reminder that would fire at 22:30.
- Expect: Reminder suppressed during quiet hours.

5) Appearance updates immediately and persists
- Toggle Dark theme and set Font Size to Large.
- Reload the app.
- Expect: Dark theme + Large font remain in effect.

6) Export/Import
- Tap Export JSON; save the file.
- Clear all assignments/classes (via Clear All Data or manually).
- Tap Import JSON; pick the exported file.
- Expect: Classes and assignments restored. Preferences unchanged.

7) Onboarding actions
- Tap Replay Tour; expect onboarding hints to reappear.
- Tap Reset Sample Data; expect sample items to be present.

8) About
- Verify app name/version visible with “Made with ❤️ by Ean”.

## Notes
- Use Vitest to run unit/integration tests.
- For jsdom, quiet hour checks should be unit-tested via helper functions.

Status: Ready
