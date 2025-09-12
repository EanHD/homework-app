# Tasks: 008 Replit Repair + Clean Deploy (sequential IDs)

Note: Start at the first unchecked task; respect [P] markers (parallelize only when tasks touch different files).

- T000: Read `.github/` SpecKit; post a 10–12 line summary + supported slash commands.
- T001: Project map: build tool, dev server, entry point, service worker path, Supabase functions, CI workflows.
- T002: List files Replit created/edited (`.replit`, `replit.nix`, `.github/workflows/*`, `public/.nojekyll`, `src/sw.*`, router/build configs).
- T003: Classify each as KEEP/REVERT/MODIFY with a 1–2 line rationale; open branch `chore/replit-repair-008` with minimal fixes.
- T004: Ensure local build succeeds: `npm ci && npm run build`. If Vite, set `base: "/homework-app/"` for Pages and ensure SPA 404 fallback.
- T005: Verify static assets + `public/.nojekyll`; confirm env injection strategy (`import.meta.env` or equivalent).
- T006: Fix service worker registration scope/timing; add versioned cache-busting to prevent refresh loops.
- T007: Harden permission flow; wire VAPID/public key for prod; add unsupported/HTTP fallbacks.
- T008: Add `scripts/test-push.[ts|js]` with usage instructions.
- T009: Enumerate Supabase functions and per-function `deno.json` flags (`verify_jwt` on/off).
- T010: Confirm/update CORS allowlist (localhost + Pages origin); provide a successful `curl -X OPTIONS …` preflight example.
- T011: Add troubleshooting notes to `NOTIFICATIONS_REPORT.md`.
- T012: Keep a single Pages workflow `.github/workflows/pages.yml`; remove duplicates. Use:        `permissions: { contents: read, pages: write, id-token: write }` and `actions/checkout@v4` with `fetch-depth: 0`.
- T013: Build and upload artifact from `dist/` (or correct output) via `actions/upload-pages-artifact@v3`.
- T014: Deploy via `actions/deploy-pages@v4`; ensure repo Pages source = GitHub Actions and Actions permissions = Read & write.
- T015: Add lightweight E2E test (mock push OK) + a layout guard test (DOM assertion or screenshot).
- T016: Write `SMOKE_TEST.md` (dev + prod), `NOTIFICATIONS_REPORT.md`, `UI_REPORT.md` with screenshots/logs.
- T017: Open PR `chore/replit-repair-008` → `008-notifications-ui-polish` with diffs & docs.
- T018: Open PR `008-notifications-ui-polish` → `main`; pass checks; provide merge checklist.

- T019: Update PWA manifest: set `public/manifest.webmanifest` `short_name` to a value under 12 characters (e.g., "Homework"); re-check PWA audit.
- T020: Document GH Pages header limitations (Cache-Control, X-Content-Type-Options) and how SW cache versioning + hashed assets mitigate; add notes to `SMOKE_TEST.md` and `NOTIFICATIONS_REPORT.md`.

[Guardrails]
- G000: No dependency upgrades.
- G001: No refactors >50 LOC/file.
- G002: Feature branches only; never push to `main`.
- G003: If blocked >15 min, stop and post unified diffs + options.

Notes (DevTools Issues Triage)
- CSS vendor warnings (-moz-appearance, -webkit-text-size-adjust, scrollbar-width, text-wrap, property order): not present in our code; safe to ignore; if adding CSS, include standard counterparts (appearance, text-size-adjust).
- Cache-busting warning for `/sw.js`: acceptable; SW fetch bypasses cache and contents are versioned via `__BUILD_ID__`.
- Cache-Control and security headers: GH Pages-managed; cannot set per-file headers from repo; document limitations and expected behavior in docs (T016, T020).
