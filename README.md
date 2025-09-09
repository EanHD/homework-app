# Homework Buddy (Web)

A lightweight PWA to track classes and assignments with a Today/Upcoming view, progress, streaks, and local reminders. Built with Vite + React + TypeScript and Mantine.

## Quick Start
- Requirements: Node.js 18+
- Install: `npm ci`
- Dev server: `npm run dev` → open the printed URL
- Tests: `npm test`
- Build: `npm run build` (output in `dist/`)
- Preview build: `npm run preview`

## PWA & Notifications
- Service worker registers automatically in production builds (`/sw.js`).
- Manifest at `public/manifest.webmanifest`; icons in `public/`.
- Use the in‑app Notifications toggle to request permission. Reminders trigger near due time while the app is open, and via the SW when supported.

## Project Structure
- `src/` — app code
  - `components/` — UI components and screens
  - `store/` — state, selectors, persistence, notifications, scheduler
  - `theme.ts` — Mantine theme
- `tests/` — Vitest unit tests (store/selectors)
- `public/` — PWA assets (manifest, icons, service worker)

## Speckit Workflow
This repo follows Speckit (spec → plan → tasks → implementation):
- Active feature: `specs/001-build-homework-buddy/`
- Execute tasks in order from `tasks.md` (checked as completed in this branch).
- See `AGENTS.md` for session guidance.

## Deploy (GitHub Pages)
- Pushing to `main` or `001-build-homework-buddy` runs the Pages workflow.
- The build artifact in `dist/` is deployed to Pages.
- Vite `base` is configured automatically for this repo.
- URL: `https://eanhd.github.io/homework-app/`

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — type-check and build
- `npm run preview` — preview production build
- `npm test` — run unit tests (Vitest)

## Notes
- Time calculations use UTC day boundaries in selectors to keep tests deterministic.
- Local persistence uses IndexedDB via `localforage` with a small schema guard.
- Notifications require user permission and may vary by browser/platform.

## UI System & Theme
- Theme tokens (`src/ui/theme.ts`):
  - Primary blue `#1E88E5`, slate gray palette, default radius 12, soft shadows (`sm`/`md`), compact spacing scale.
  - Mantine Provider is applied in `src/main.tsx` with global styles and CSS reset.
- AppShell (`src/ui/AppShell.tsx`):
  - Left navbar (Today, Upcoming, Classes) with Tabler icons; top header with page title, date chip, and desktop Add button.
  - Responsive: persistent sidebar ≥1024px; collapses into a Drawer with burger toggle on smaller screens.
  - Semantic landmarks: `header`, `nav`, `main` and `aria-current` on active nav.
- Core components:
  - ProgressHeader (`src/ui/ProgressHeader.tsx`): greeting + RingProgress for today’s completion.
  - StreakChip (`src/ui/StreakChip.tsx`): flame badge with tooltip explaining streak.
  - AssignmentCard (`src/ui/AssignmentCard.tsx`): checkbox, title, class pill, due time, 3‑dot menu (Edit/Snooze/Delete); overdue and completed visual states.
  - DateGroup (`src/ui/DateGroup.tsx`): sticky section headers like “Wed, Sep 10”.
  - EmptyState (`src/ui/EmptyState.tsx`): illustration + microcopy + CTA.
  - QuickFilters (`src/ui/QuickFilters.tsx`): All / Overdue / Due today / Done.
- Forms & flows:
  - AssignmentForm (`src/ui/AssignmentForm.tsx`): Modal (desktop) / Drawer (mobile), ≤5 inputs, validation, uses existing store actions.
  - Keyboard shortcuts: `/` opens form, `Esc` closes, `Enter` submits when valid; mobile FAB opens form.
- Accessibility & motion:
  - Visible focus outlines, AA contrast, `prefers-reduced-motion` respected (see `src/a11y.css`).
- Pages & integration:
  - Today/Upcoming/Classes pages in `src/pages/*` render redesigned UI while reusing existing data layer and selectors.
