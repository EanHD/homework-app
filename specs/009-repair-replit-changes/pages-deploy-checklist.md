# T014 — GitHub Pages Deploy via actions/deploy-pages@v4

This repository uses a single Pages workflow at `.github/workflows/pages.yml` to build and deploy `dist/` to GitHub Pages.

## What’s configured in repo
- Workflow: `.github/workflows/pages.yml`
  - Permissions: `contents: read`, `pages: write`, `id-token: write`
  - Checkout: `actions/checkout@v4` with `fetch-depth: 0`
  - Build: `npm ci && npm run build`
  - Artifact: `actions/upload-pages-artifact@v3` with `path: dist`
  - Deploy: `actions/deploy-pages@v4` (environment `github-pages`)
- SPA requirements handled:
  - Vite `base: '/homework-app/'` in production
  - `public/404.html` for SPA routing
  - `.nojekyll` written to `dist/`

## One‑time repository settings (UI)
- Settings → Pages → Source: GitHub Actions
- Settings → Actions → General → Workflow permissions: Read and write permissions

If you cannot use a browser, you can run the workflow manually from CLI once settings are applied:

```bash
# Requires GitHub CLI and repo permissions
# Trigger the Pages workflow on the current branch
gh workflow run pages.yml

# Or run on a specific ref (e.g., main)
gh workflow run pages.yml --ref main

# Watch workflow
gh run list --workflow=pages.yml
gh run watch <run-id>
```

## Expected outcome
- pages.yml runs build → uploads artifact from `dist/` → deploys with `actions/deploy-pages@v4`.
- Environment `github-pages` is created (first deploy) and the job outputs a `page_url` similar to:
  `https://eanhd.github.io/homework-app/`

## Troubleshooting
- If deployment fails with permissions error, re-check Actions workflow permissions (Read & write).
- If site loads without assets, verify `<base href="/homework-app/">` in `dist/index.html` and that the workflow uploaded `dist/`.
- If 404s on client routes, ensure `public/404.html` exists in `dist/` (workflow touches `.nojekyll` and includes 404.html).
