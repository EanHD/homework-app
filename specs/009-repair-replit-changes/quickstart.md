# Quickstart / Smoke Test (~5 minutes)

Follow these steps to validate the deploy is clean and functional across local and GitHub Pages.

## 1) Local build & preview
- Run: `npm ci && npm run build`
- Preview: `npm run preview` and open `http://localhost:4173/homework-app/`
- Expect: App loads, no console errors; navigation works; icons/manifest load.

## 2) Service worker health
- DevTools → Application → Service Workers: verify registration for scope `/homework-app/`.
- Reload once after first install. Ensure no infinite reload loop.
- Verify new build busts cache: after rebuilding, the SW cache name changes (contains new `__BUILD_ID__`).

## 3) Runtime config
- Check network request for `public/config.json`.
- Validate fields: `functionsBase` points to Supabase Functions host; `vapidPublic` non-empty.

## 4) Web Push (mock path acceptable)
- In Settings, click “Enable Push Notifications”.
- Expect success notification and “Subscribed” badge. If keys unavailable, use mock test:
  - `npm run test:push:config` → prints config; ensure `functionsBase` reachable.
  - `npm run test:push:subscriptions` → exercises endpoints without sending payloads.

## 5) Supabase Functions CORS
- Replace `{HOST}` with the `functionsBase` origin from config, and run preflight:
```
curl -i -X OPTIONS "{HOST}/subscribe" \
  -H "Origin: https://eanhd.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```
- Expect: `204` with `Access-Control-Allow-Origin: https://eanhd.github.io` and allowed methods/headers.

## 6) GitHub Pages deploy
- Create PR from feature branch; ensure CI runs `gh-pages.yml`.
- After deploy, open `https://eanhd.github.io/homework-app/`.
- Repeat steps (2)–(4) on the Pages site.

## 7) Artifacts for PR
- Attach screenshots: SW registration, subscription success, Pages site loaded.
- Include logs: curl preflight response headers; console output from `test:push:*` if used.
