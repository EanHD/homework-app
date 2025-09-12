# T003 — Replit Changes: KEEP/REVERT/MODIFY

This classification focuses on files Replit likely created or influenced and adjacent configs. Each item includes a brief rationale and any minimal fix proposal.

- .replit — KEEP
  - Rationale: Developer convenience in Replit; no impact on builds/CI/Pages.

- replit.nix — N/A
  - Rationale: File not present in repo; nothing to revert.

- vite.config.ts — KEEP (consider MODIFY later only if needed)
  - Rationale: Correct base (`/` dev, `/homework-app/` build), `__BUILD_ID__` for SW, dev server on 5000 with Replit `allowedHosts`.
  - Note: Replit host allow-list is benign; avoid refactor now.

- index.html — KEEP
  - Rationale: Standard Vite dev index; includes `<base href="%BASE_URL%">` and GH Pages diagnostic; build uses transformed HTML from Vite.

- public/.nojekyll — KEEP
  - Rationale: Required so Pages serves static files under `dist/` without Jekyll interference.

- .nojekyll (repo root) — REVERT (remove)
  - Rationale: Unused for GitHub Pages when deploying from `dist/` via Actions; `public/.nojekyll` and workflow-added `dist/.nojekyll` suffice. Avoids confusion.

- public/404.html — KEEP
  - Rationale: SPA redirect for GitHub Pages; required for client-side routing at `/homework-app/`.

- Service worker (src/sw.ts, src/sw-registration.ts) — KEEP
  - Rationale: Registration uses base-aware URL and update handling; SW uses `__BUILD_ID__` cache for busting; no loops observed in logic.

- Supabase functions CORS (supabase/functions/_shared/cors.ts) — KEEP
  - Rationale: Explicit allowlist includes localhost (5000/5173/4173), GH Pages origin, and current Replit preview; matches research.

- Supabase functions JWT flags — KEEP (documented)
  - Rationale: Inline `export const config = { verify_jwt: false }` intentionally disables JWT for demo/testing; deno.json shows `verify_jwt: true` but overridden. Aligning files is optional and deferred.

- CI Workflows (.github/workflows/gh-pages.yml, test.yml) — KEEP (plan to MODIFY in T012)
  - Rationale: Current Pages workflow deploys `dist/` correctly. T012 will consolidate and set `fetch-depth: 0` and permissions per plan.

Minimal fixes to apply with branch:
- Remove root `.nojekyll` (retain `public/.nojekyll` and workflow step that creates `dist/.nojekyll`).

Planned later (per tasks):
- T004–T008: Build, assets, SW cache/versioning, push scripts.
- T009–T010: Enumerate JWT flags, confirm CORS allowlist (+ preflight example).
- T012–T014: Single Pages workflow, set permissions, `fetch-depth: 0`, upload/deploy steps.
