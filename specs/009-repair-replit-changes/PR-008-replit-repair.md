# chore: Replit repair 008 (T000–T016)

## Summary
Fixes Replit-induced config drift and ships a clean, reproducible GH Pages deploy. Verifies build, base path, SPA routing, service worker cache-busting, push enable flow, functions CORS, and provides smoke-test artifacts + docs.

Base: `008-notifications-ui-polish`  
Head: `chore/replit-repair-008`

## Changes
- Removed root `.nojekyll` (keep `public/.nojekyll` and workflow-created `dist/.nojekyll`).
- Confirmed/kept Vite config: base `/homework-app/` in prod; dev on 5000; `__BUILD_ID__` for SW cache versioning.
- Service worker: base-aware registration, update flow with single reload, versioned cache name.
- Push enable flow: explicit errors and user-friendly messages for unsupported/HTTP/permission-denied/missing VAPID.
- CORS: allowlist confirmed (localhost 5000/5173/4173, GH Pages, Replit preview); added curl preflight examples.
- Pages workflow: consolidated to single `.github/workflows/pages.yml`, `fetch-depth: 0`, artifact upload from `dist/`, deploy via `actions/deploy-pages@v4`.
- E2E tests: lightweight layout guard and mocked subscription flow verified.
- Docs updated: smoke test checklist, troubleshooting, artifact capture instructions.

## Validation
- Local build: `npm run build` OK; `dist/` contains `index.html`, `sw.js`, assets, `.nojekyll`.
- Base path: `<base href="/homework-app/">` present in `dist/index.html`.
- SW: built `sw.js` with cache `hb-app-shell-<buildId>`; update handling correct.
- Runtime config: `dist/config.json` present; `src/config.ts` loads from base with fallbacks.
- CORS: preflight succeeds for allowed origins (see examples below).
- E2E: tests present in `tests/e2e/` and pass locally (mocked push).

## CORS Preflight Examples
See `specs/009-repair-replit-changes/cors-allowlist.md` for complete examples. Replace `{HOST}` with `public/config.json` `functionsBase`:

```
# GitHub Pages origin → /subscribe
curl -i -X OPTIONS "{HOST}/subscribe" \
  -H "Origin: https://eanhd.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

## Artifacts & Docs
- `SMOKE_TEST.md` — 009 quick checklist + commands
- `NOTIFICATIONS_REPORT.md` — troubleshooting + artifacts to attach
- `UI_REPORT.md` — screenshots to capture for PR
- `specs/009-repair-replit-changes/cors-allowlist.md` — allowlist + curl
- `specs/009-repair-replit-changes/functions-flags.md` — function JWT flags
- `specs/009-repair-replit-changes/pages-deploy-checklist.md` — Pages deploy & CLI
- scripts README and test scripts updated

## Merge Checklist
- [ ] Pages source set to “GitHub Actions”; Actions permissions = Read & write
- [ ] Pages workflow runs on this PR and from base branch
- [ ] App loads at https://eanhd.github.io/homework-app/ with no console errors
- [ ] SW registers (scope `/homework-app/`) and no reload loops
- [ ] Settings: enable push → success + Subscribed badge
- [ ] CORS preflight OK for GH Pages + localhost:5000
- [ ] Attach screenshots and logs as listed in docs

---

Scope: minimal, no dependency upgrades or broad refactors; focused on T000–T016 tasks.
