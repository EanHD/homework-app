## Research: Reliable Push Reminders (PWA)

### Platform Support (iOS/Android/Desktop)
- iOS: Web Push supported on iOS/iPadOS 16.4+ for web apps installed to Home Screen. Safari tabs do not receive push when not active. Users must Allow Notifications during PWA install/permission prompt. Focus/Notification Summary can delay alerts.
- Android/Chrome + Desktop: Standard Web Push supported for installed PWAs and regular tabs (SW active). Works with VAPID.

Decision: Target iOS 16.4+ for installed PWA; provide in-app guidance when unsupported (older iOS or not installed), and surface current permission/subscription state in Settings.

### Payload Strategy
- Current server uses "no payload" push (empty POST with VAPID auth) to trigger `push` event; SW is responsible for calling `showNotification`.
- Current SW (`src/sw.ts`) ignores push events without `event.data`, causing no notification to appear.

Decision: Update SW to display a default notification when `event.data` is missing. Title/body can be generic (e.g., "Homework reminder"), and tapping opens app. If schedule includes a URL, pass it via subscription mapping (future enhancement); for now, rely on `data.url` if present, else open base.

### Configuration Chain
Sources (highest priority to lowest):
1) localStorage overrides: `hb_functions_base`, `hb_vapid_public`
2) Dev/test: Vite env `VITE_FUNCTIONS_BASE`, `VITE_VAPID_PUBLIC`
3) Runtime: `public/config.json` (served at site base, e.g., `/homework-app/config.json`)
4) Fallback: build-time env again

Decision: Keep chain; add clearer console warnings and Settings diagnostics. Verify GH Pages base tagging so fetch path resolves.

### VAPID Keys
- Client must use same public key as server. Server must have matching VAPID_PUBLIC/VAPID_PRIVATE env in Supabase.

Decision: Add a diagnostic in Settings to show VAPID public length (client) and surface last deliver report status text to confirm server key presence.

### CORS
- Edge functions include permissive CORS handler. Ensure deployed origins (GH Pages domain) are allowed in Supabase config.

Decision: If delivery fails with 4xx/5xx, surface error message and link to function logs.

### Retry/Multi-device (Clarifications)
- Retry late reminders: [Needs policy].
- Multi-device delivery: Current server sends to all endpoints for user. [Confirm acceptable].

Decision: Keep current behavior (all endpoints) unless specified otherwise; document it.

