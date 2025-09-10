# Data Model & Internal Contracts: Settings

## Entities

### Preferences
- notificationsEnabled: boolean
- reminderOffsetMinutes: 10 | 30 | 60
- quietHoursEnabled: boolean
- quietStartTime: string ("HH:mm")
- quietEndTime: string ("HH:mm")
- theme: "light" | "dark"
- fontScale: "normal" | "large"
- seenOnboarding: boolean

Notes:
- Persist preferences via localStorage using the app store’s persistence middleware.
- Import/Export for data applies to classes/assignments only (preferences excluded in v1).

## Store Interfaces (Internal Contract)

### State (partial)
```
interface PreferencesState {
  notificationsEnabled: boolean;
  reminderOffsetMinutes: 10 | 30 | 60;
  quietHoursEnabled: boolean;
  quietStartTime: string; // "HH:mm"
  quietEndTime: string;   // "HH:mm"
  theme: 'light' | 'dark';
  fontScale: 'normal' | 'large';
  seenOnboarding: boolean;
}
```

### Actions
```
interface PreferencesActions {
  hydratePreferences(): void; // from localStorage (on boot)
  setNotificationsEnabled(v: boolean): void;
  setReminderOffset(minutes: 10 | 30 | 60): void;
  setQuietHoursEnabled(v: boolean): void;
  setQuietHoursRange(startHHmm: string, endHHmm: string): void;
  setTheme(mode: 'light' | 'dark'): void;
  setFontScale(scale: 'normal' | 'large'): void;
  replayTour(): void; // sets seenOnboarding=false and triggers tour
}
```

### Selectors & Helpers
```
interface PreferencesSelectors {
  isQuietNow(now?: Date): boolean; // handles midnight wrap
}
```
Helper:
```
function isWithinQuietHours(nowMinutes: number, startMinutes: number, endMinutes: number) {
  return startMinutes <= endMinutes
    ? nowMinutes >= startMinutes && nowMinutes < endMinutes
    : (nowMinutes >= startMinutes || nowMinutes < endMinutes);
}
```

## Interactions
- Assignment creation scheduling guard:
  - If `notificationsEnabled === false`, do not schedule reminders.
  - Else compute `reminderAt = dueAt - reminderOffsetMinutes` and suppress if `isQuietNow(reminderAt)`.
- Theme and fontScale applied via MantineProvider theme overrides (global effect).
- Replay tour toggles `seenOnboarding` and triggers onboarding hints.

## Validation Rules
- quietStartTime/quietEndTime format validated as HH:mm (00:00–23:59).
- reminderOffsetMinutes limited to allowed values.
- Theme limited to 'light' | 'dark'; fontScale limited to 'normal' | 'large'.

Status: Complete
