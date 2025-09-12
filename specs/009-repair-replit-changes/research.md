# Research: Repair Replit Changes + Ship Clean Deploy

## Decisions
- Vite base path remains `/homework-app/` for GH Pages project site.
- Keep SW at `/sw.js` with cache name keyed by `__BUILD_ID__` to guarantee cache busting post-deploy.
- Maintain runtime config via `public/config.json` for `functionsBase` and `vapidPublic`.
- Supabase Functions (`subscribe`, `schedule`, `send-notifications`) will continue with `verify_jwt: false` (inline config) to simplify CORS validation across environments.
- CORS allowed origins include localhost (5000/5173/4173), GitHub Pages origin `https://eanhd.github.io`, and the current Replit preview domain.
- Workflows: retain `test.yml` and `gh-pages.yml`; ensure Pages workflow uses `actions/checkout` with `fetch-depth: 0` and uploads `dist/`.

## Rationale
- GH Pages base `/homework-app/` matches repository name and existing config, ensuring asset URLs resolve.
- Versioned SW cache avoids stale assets and SW update loops post-deploy.
- Runtime config avoids secrets in client code and allows per-env endpoints/keys without rebuild.
- `verify_jwt: false` expedites demo/testing; security hardening can enable JWT later.
- Explicit CORS origins keep functions callable from dev/preview/prod without wildcard risks.
- CI uses standard Pages deployment; shallow clones can break versioning/scripts, so `fetch-depth: 0` is safer.

## Alternatives Considered
- Workbox routing plugin for SPA fallbacks: unnecessary; `public/404.html` handles GH Pages routing.
- Hosting functions elsewhere: out-of-scope; Supabase functions are already integrated.

## Unknowns / Clarifications Needed
- Exact GitHub Pages URL to validate (assumed `https://eanhd.github.io/homework-app/`).
- Availability/location of VAPID keys for production verification.
- Confirm if any other Replit-generated files exist beyond `.replit`.

