# Homework Buddy (Web)

A lightweight PWA to track classes and assignments with a Today/Upcoming view, progress, streaks, and local reminders. Built with Vite + React + TypeScript and Mantine.

## Features
- **📱 Progressive Web App**: Installable with offline support and service worker notifications
- **📚 Class Management**: Color-coded classes with custom emojis via visual emoji picker
- **📝 Assignment Tracking**: Create, edit, and organize assignments with due dates and priorities  
- **📊 Progress Dashboard**: Daily completion ring, streak tracking, and visual progress indicators
- **🎯 Smart Views**: Today's focus view and upcoming assignments with intelligent filtering
- **🔔 Local Reminders**: Browser notifications for approaching due dates
- **♿ Accessibility**: Full keyboard navigation, screen reader support, and reduced motion options
- **🎨 Guided Onboarding**: Step-by-step tour for new users with contextual hints
- **💾 Data Management**: Export/import functionality for backup and data portability

## Quick Start
- Requirements: Node.js 18+
- Install: `npm ci`
- Dev server: `npm run dev` → open the printed URL
- Tests: `npm test`
- Build: `npm run build` (output in `dist/`)
- Preview build: `npm run preview`

## PWA & Notifications
- Service worker registers automatically (`/homework-app/sw.js`) with scope `/homework-app/`.
- Manifest at `public/manifest.webmanifest` with `start_url: /homework-app/#/main` and `scope: /homework-app/` so installs launch correctly on GitHub Pages.
- Vector icons (SVG) for crisp display across all devices and resolutions.
- Use the in‑app Notifications toggle to request permission. Reminders trigger near due time while the app is open, and via the SW when supported.

## Project Structure
- `src/` — app code
  - `components/` — UI components and screens
  - `store/` — state, selectors, persistence, notifications, scheduler, app store (Zustand)
  - `ui/` — reusable UI components including emoji picker and onboarding
  - `theme.ts` — Mantine theme
  - `a11y.css` — accessibility enhancements and focus management
- `tests/` — Vitest unit tests (store/selectors/UI components)
- `public/` — PWA assets (manifest, icons, service worker)

## Speckit Workflow
This repo follows Speckit (spec → plan → tasks → implementation):
- Completed features: `specs/001-build-homework-buddy/`, `specs/002-redesign-ui/`, `specs/003-ui-ux-state-fixes/`, `specs/004-emoji-picker-ux/`
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
  - ProgressHeader (`src/ui/ProgressHeader.tsx`): greeting + RingProgress for today's completion.
  - StreakChip (`src/ui/StreakChip.tsx`): flame badge with tooltip explaining streak.
  - AssignmentCard (`src/ui/AssignmentCard.tsx`): checkbox, title, class pill, due time, 3‑dot menu (Edit/Snooze/Delete); overdue and completed visual states.
  - DateGroup (`src/ui/DateGroup.tsx`): sticky section headers like "Wed, Sep 10".
  - EmptyState (`src/ui/EmptyState.tsx`): illustration + microcopy + CTA.
  - QuickFilters (`src/ui/QuickFilters.tsx`): All / Overdue / Due today / Done.
  - EmojiButton (`src/ui/EmojiButton.tsx`): Visual emoji picker with search, categories, and accessibility support.
  - OnboardingHints (`src/ui/OnboardingHints.tsx`): Step-by-step guided tour with focus management.
  - Settings (`src/pages/Settings.tsx`): Centralized controls for notifications, appearance, data, onboarding, and about.
- Forms & flows:
  - AssignmentForm (`src/ui/AssignmentForm.tsx`): Modal (desktop) / Drawer (mobile), ≤5 inputs, validation, uses existing store actions.
  - ClassForm (`src/ui/modals/ClassForm.tsx`): Enhanced class creation with emoji picker integration.
  - Keyboard shortcuts: `/` opens form, `Esc` closes, `Enter` submits when valid; mobile FAB opens form.
- Accessibility & motion:
  - Visible focus outlines, AA contrast, `prefers-reduced-motion` respected (see `src/a11y.css`).
  - Enhanced focus management for modals, popups, and interactive elements.
  - Comprehensive ARIA labels and semantic markup throughout.
- Pages & integration:
  - Today/Upcoming/Classes pages in `src/pages/*` render redesigned UI while reusing existing data layer and selectors.

## Emoji Picker System
- **Visual Selection**: Browse emojis by category with search functionality
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Lazy loading and efficient rendering for smooth UX
- **Preferences**: Remembers recently used emojis and skin tone preferences
- **Reduced Motion**: Respects user motion preferences for animations
- **Integration**: Seamlessly integrated into class creation and editing workflows

## Onboarding Experience
- **Guided Tour**: Step-by-step introduction to key features
- **Contextual Hints**: Smart tooltips that appear when relevant
- **Progressive Disclosure**: Introduces features as users encounter them
- **Accessibility**: Focus management and keyboard navigation support
- **Dismissible**: Can be skipped or dismissed based on user preference
- **Persistence**: Remembers onboarding state across sessions

## State & Reactivity (Zustand)
- App store: `src/store/app.ts` (Zustand) is the single source of truth the pages use.
  - State: `classes`, `assignments`, `lastChangeToken`.
  - Actions: `loadAll`, `add/update/delete Class/Assignment`, `toggleDone`, `restoreAssignment`, `exportData`, `importData`.
  - Selectors: `selectToday(now)`, `selectUpcoming(now, { filter })`, `countTodayProgress(now)`.
- Persistence: `src/store/persistence.ts` (localforage). Pages call actions → store persists then updates in‑memory state and bumps `lastChangeToken` to re‑render.
- Migration: optional fields `completedAt` and `archivedAt` are backfilled as `null` on hydrate.
- Cleanup: `bootCleanup()` archives items with `completedAt` older than 90 days; called on app boot.

## Data Management
- **Export**: Download all data as structured JSON with version metadata
- **Import**: Upload and merge data with duplicate detection and validation
- **Backup**: Preserve user data with integrity checks and error handling

## Push Notifications
- Backend (Supabase):
  - Set secrets: `VAPID_PUBLIC`, `VAPID_PRIVATE`, `VAPID_SUBJECT`, `PROJECT_URL`, `SERVICE_ROLE_KEY`.
  - Create tables and indexes (see `specs/006-push-notifications-via/data-model.md`).
  - Deploy Edge Functions:
    - `functions/subscribe/index.ts`
    - `functions/schedule/index.ts`
    - `functions/send-notifications/index.ts`
  - Schedule cron: invoke `send-notifications` every minute.
- Frontend:
  - `.env`: `VITE_FUNCTIONS_BASE=https://<PROJECT>.functions.supabase.co` and `VITE_VAPID_PUBLIC=<public key>`.
  - In Settings: enable push, then “Send test notification”.
  - Service Worker handles `push` and deep-links on `notificationclick`.

Limitations:
- iOS ≥16.4 supports Web Push only when installed to Home Screen; desktop Chromium works broadly.
- Delivery during quiet hours is deferred until quiet hours end.
- **Migration**: Forward-compatible data format with version tracking
- **Conflict Resolution**: Smart merging prevents data loss during imports

## Today, Upcoming, Classes
- Today:
  - Progress ring uses "done today / total due today".
  - Local day (not UTC) for due‑today selection.
  - Filters (All/Overdue/Today/Done) persist in URL hash.
- Upcoming:
  - Keeps Done visible; filter pills: All | Overdue | Due soon (≤ 7 days) | Done.
  - Toggling Done updates UI immediately; archived items are hidden by default.
- Classes:
  - Add/Edit/Delete via modal with emoji picker integration.
  - Shows count of open (not archived, not completed) tasks.
  - Visual emoji indicators for easy identification.

## Notifications & Undo
- Toasts: Mantine Notifications. For actions with Undo, we render a Button inside the message body (no unsupported `action` prop) and update the same toast ID when restored.

## Development Practices
- Prefer the app store (Zustand) for all page interactions; avoid the legacy context in new work.
- When adding selectors, keep them pure, consider `archivedAt`, and use local day where user‑visible.
- Use `lastChangeToken` to subscribe to mutations that need to force a re‑render in views.
- Tests use MantineProvider wrapper and jsdom shims for `matchMedia` and `ResizeObserver` (see `tests/setup.ts`).
- Comprehensive test coverage for core functionality, selectors, and UI components.

## Accessibility Features
- **Keyboard Navigation**: Full app functionality available via keyboard
- **Screen Reader Support**: Comprehensive ARIA labels and semantic markup
- **Focus Management**: Logical focus order and visible focus indicators
- **Reduced Motion**: Respects `prefers-reduced-motion` for animations
- **Color Contrast**: Meets WCAG AA standards for text and interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmark regions

## Troubleshooting
- Pages 404/blank:
  - Ensure Settings → Pages → Source is "GitHub Actions".
  - We include `public/404.html` to redirect unknown paths to `/homework-app/`.
  - Hard refresh (Shift+Reload) to clear a stale service worker.
- Notifications API:
  - Use inline Button inside `notifications.show({ message: <Group>… </Group> })` for Undo.
- Reset local data:
  - Console: `localforage.clear()` then reload, or clear site data in devtools.
  - Use export/import functionality to backup data before clearing.

## Done + Archive Behavior
- Toggling Done sets `completed=true` and records `completedAt` (ISO). Untoggling clears `completedAt` and `completed=false`.
- Upcoming keeps Done items visible (muted + strikethrough) until they are archived.
- Background cleanup on app start archives assignments with `completedAt` older than 90 days by setting `archivedAt`. Archived items are excluded from default lists.
- Today progress ring uses: done today / total due today (includes done).

## Shortcuts
- `a`: Add assignment (opens form)
- `c`: Add class (on Classes page)
- `/`: Add assignment (reserved for future search)
- `e`: Edit focused card (where supported)
- `Backspace`: Delete focused card with confirm; toast offers Undo (10s)
- `Tab`: Navigate through interactive elements
- `Enter`/`Space`: Activate buttons and controls
- `Escape`: Close modals, popups, and overlays

## Reset Local Data (Debug)
- In browser devtools console:
  - `localforage.clear()` to wipe persisted state, then reload.
- Or use Application → Storage in devtools to clear site data.
- Use the export feature before clearing to backup your data.
