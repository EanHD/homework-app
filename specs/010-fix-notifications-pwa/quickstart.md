## Quickstart: Verify Push Reminders

1) Configure runtime
- Ensure `public/config.json` contains:
  - `functionsBase`: your Supabase Functions URL
  - `vapidPublic`: your VAPID public key (matches server VAPID_PUBLIC)

2) Deploy functions
- Deploy `subscribe`, `schedule`, `send-notifications` to Supabase with env: `PROJECT_URL`, `SERVICE_ROLE_KEY`, `VAPID_PUBLIC`, `VAPID_PRIVATE`, `VAPID_SUBJECT`.

3) Enable push in app
- Open Settings → Enable push notifications.
- Confirm badges show `Permission: granted` and `Subscribed`.

4) Send test notification
- Click “Send test notification” in Settings.
- Within 60–120s, a notification appears. Tap to open app.

5) iOS specifics
- Install the PWA to Home Screen on iOS 16.4+ and Allow Notifications.
- Notifications will not arrive to a mere Safari tab.

6) Troubleshooting
- Use Settings diagnostics (functionsBase, VAPID length, last deliver status).
- Check Supabase function logs if delivery shows errors.

