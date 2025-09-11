# Implementation Plan: Notifications Reliability & UI Polish

**Feature**: 008-notifications-ui-polish  
**Input**: specs/008-notifications-ui-polish/spec.md  
**Created**: 2025-09-11  
**Status**: Draft

## Phase 0 — Orientation (read-only)

### Framework & Build Detection
- **Framework**: React 18.3 + TypeScript 5.4 + Vite 5.4 (PWA)
- **Build Tool**: Vite with HMR, serves on 0.0.0.0:5000 in dev
- **Hosting**: GitHub Pages (prod: https://eanhd.github.io/homework-app/), Replit (dev)
- **Package Manager**: npm with package-lock.json

### Project Map
```
Key Directories:
├── public/
│   ├── sw.js (Service Worker - app-shell caching + push handling)
│   ├── manifest.webmanifest (PWA manifest)
│   └── config.json (runtime config: functionsBase, vapidPublic)
├── src/
│   ├── services/pushApi.ts (Push API client)
│   ├── utils/push.ts (enablePush flow)
│   ├── sw-registration.ts (SW registration logic)
│   ├── ui/AppShell.tsx (main layout component)
│   └── config.ts (runtime config loader)
├── supabase/functions/
│   ├── _shared/cors.ts (CORS handler)
│   ├── subscribe/ (subscription management)
│   ├── schedule/ (reminder scheduling)
│   └── send-notifications/ (cron sender)
├── specs/ (SpecKit feature specifications)
└── .github/prompts/ (SpecKit command definitions)
```

### SpecKit Rules Summary (10-12 lines)
SpecKit enforces spec-driven development through 3 phases: `/specify` creates feature branches and spec.md from user descriptions; `/plan` generates implementation plans with research, data models, and contracts; `/tasks` breaks down plans into executable items with dependency tracking. Features live in numbered directories under `specs/` (001-, 002-, etc.). Each phase has mandatory artifacts and gates. Shell scripts orchestrate the workflow (`create-new-feature.sh`, `setup-plan.sh`, `check-task-prerequisites.sh`). Constitutional requirements from `memory/constitution.md` guide technical decisions. PRs must link to specs and include checklists. The system uses JSON output for programmatic integration. Branching follows `###-feature-name` pattern. Changes are minimal, reviewable, and preserve existing architecture.

### Supported Slash Commands
- `/specify <description>` - Create new feature specification and branch
- `/plan <context>` - Generate technical implementation plan with artifacts  
- `/tasks <context>` - Break down plan into executable development tasks

## Phase 1 — Notifications Audit

### Current Push Flow Mapping
```
1. SW Registration: src/sw-registration.ts → public/sw.js (scope: appBase())
2. Permission Flow: Settings UI → src/utils/push.ts::enablePush()
3. Subscription Creation: pushManager.subscribe() with VAPID key from config
4. Backend Store: POST /subscribe → supabase/functions/subscribe/
5. Reminder Scheduling: POST /schedule → supabase/functions/schedule/
6. Delivery: Cron → send-notifications → Web Push API
```

### Environment & VAPID Configuration
- **Dev Config**: src/config.ts loads from Vite env (VITE_FUNCTIONS_BASE, VITE_VAPID_PUBLIC)
- **Prod Config**: public/config.json fetched at runtime
- **Current VAPID Public**: `BBNeezOWTW41reqn5HgAS5fLpX6qZqilfwumb6Q4zm6d9elUxRwa-wrnwsY-bwdDIyyMhYRrNdPC7-M1_EtxSqo`
- **Functions Base**: `https://tihojhmqghihckekvprj.functions.supabase.co`

### Identified Issues
1. **HMR Connection Failures**: Vite WebSocket can't connect through Replit proxy
2. **CORS Origins**: Functions allow localhost:5173 but dev uses port 5000
3. **Permission State Handling**: No graceful HTTPS/support checks
4. **Cache Busting**: SW may serve stale registration

## Phase 2 — Minimal Fixes (small, safe diffs)

### SW Registration & Cache Fixes
**File**: `src/sw-registration.ts`
- Add cache-busting query param to SW URL
- Improve error handling for unsupported environments
- Ensure proper scope handling across dev/prod

### Permission UX Hardening  
**File**: `src/utils/push.ts`
- Add HTTPS requirement check before permission request
- Provide clear fallback messaging for unsupported browsers
- Handle denied permission state gracefully

### Supabase CORS Updates
**File**: `supabase/functions/_shared/cors.ts`
```typescript
// Add missing dev origins
const allowed = new Set([
  'http://localhost:5000',     // Replit dev
  'http://127.0.0.1:5000',    // Replit dev alternative
  'http://localhost:5173',    // Vite default
  'http://127.0.0.1:5173',   // Vite default alternative
  'https://eanhd.github.io',  // GitHub Pages
]);
```

### Function Authentication
- **subscribe/**: verify_jwt: false (browser-called, no auth)
- **schedule/**: verify_jwt: false (browser-called, no auth)  
- **send-notifications/**: verify_jwt: false (cron-called)

### Test Script Creation
**File**: `scripts/test-push.js`
- Complete E2E test: register → subscribe → schedule → verify delivery
- Include curl examples for manual API testing
- Environment detection (dev vs prod)

## Phase 3 — UI Polish

### Header Height Fix
**File**: `src/ui/AppShell.tsx`
- Current: fixed height 60px
- Issue: May obstruct content on small screens
- Fix: Ensure content area accounts for header via padding/margin

### Safe Area Insets (Mobile)
**Files**: `src/a11y.css`, `src/ui/AppShell.tsx`
```css
/* Add to AppShell styles */
.app-header {
  padding-top: env(safe-area-inset-top);
}
.app-content {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Bottom Bar/Content Clipping Prevention
- Identify components using `100vh` (brittle on mobile)
- Replace with `100dvh` or container-based heights
- Ensure scrollable areas have proper bounds

### Keyboard/IME Handling (Mobile)
- Test virtual keyboard push-up behavior
- Ensure form inputs remain visible when focused
- Use `viewport-fit=cover` meta tag if needed

## Phase 4 — Tests & CI

### E2E Notification Testing
**Framework**: Vitest + jsdom (existing) + Playwright (new)
**Tests**:
- Service Worker registration and push subscription
- Mocked push message handling
- Permission request flow
- Configuration loading

### Layout Guard Tests  
**Tests**:
- Header height doesn't exceed viewport
- Content areas don't overflow containers
- Safe area calculations work correctly
- Mobile keyboard interactions

### CI Integration
- Extend existing Vitest setup in package.json
- Add Playwright to devDependencies if needed
- Use existing GitHub Actions workflow

## Phase 5 — Docs & PRs

### Documentation Deliverables
1. **NOTIFICATIONS_REPORT.md**: Complete architecture, failure analysis, fixes
2. **UI_REPORT.md**: Visual bugs found, solutions applied, before/after
3. **SMOKE_TEST.md**: Copy-paste validation commands for dev/prod

### PR Strategy  
**Branches**:
- `feat/notifications-reliability-m1` (SW, CORS, permission fixes)
- `fix/ui-mobile-safe-areas-m1` (layout, safe areas, clipping)
- `chore/e2e-tests-m1` (test coverage, CI integration)

### Release Notes Draft
```markdown
## M1 Sprint: Notifications Reliability & UI Polish

### 🔔 Push Notifications
- Fixed dev environment CORS and connection issues
- Improved permission handling with HTTPS checks
- Added comprehensive test script and validation tools

### 📱 Mobile UI Improvements  
- Fixed header obstruction and content clipping
- Added safe-area inset support for iOS devices
- Improved keyboard interaction handling

### 🧪 Testing & Quality
- Added E2E notification flow testing
- Implemented layout regression guards
- Enhanced CI coverage for critical user flows
```

## Branching/PR Strategy

### Small, Focused PRs
1. **notifications-reliability**: Core notification fixes (~3-4 files)
2. **ui-safe-areas**: Layout and mobile improvements (~2-3 files)  
3. **tests-documentation**: Test coverage and docs (~4-5 files)

### Timeboxing Guidelines
- Each fix max 50 lines or 30 minutes investigation
- If complexity exceeds limits, propose alternatives with tradeoffs
- Prioritize working solutions over perfect solutions

## Technical Context Integration

### User-Provided Implementation Details
Following the phase structure provided:
- Maintain read-only orientation phase for project understanding
- Focus on minimal, safe diffs for notification reliability
- Prioritize mobile-specific UI improvements (safe areas, keyboard handling)
- Ensure comprehensive testing and validation tools
- Provide clear handoff documentation with runnable commands

### Constitutional Alignment
- Preserve existing architecture and design language
- Keep changes minimal and reviewable
- Focus on user value and reliability improvements
- Maintain backward compatibility and progressive enhancement

## Progress Tracking

### Phase 0 (Orientation) 
- [x] Framework/build detection complete
- [x] Project structure mapped
- [x] SpecKit rules documented

### Phase 1 (Notifications Audit)
- [x] Push flow mapped
- [x] Environment configuration identified
- [x] Issues catalogued

### Phase 2 (Minimal Fixes)
- [ ] SW registration improvements
- [ ] Permission UX hardening
- [ ] CORS configuration updates
- [ ] Test script creation

### Phase 3 (UI Polish)
- [ ] Header height adjustment
- [ ] Safe area insets implementation
- [ ] Content clipping prevention
- [ ] Mobile keyboard handling

### Phase 4 (Tests & CI)
- [ ] E2E notification tests
- [ ] Layout guard tests
- [ ] CI integration

### Phase 5 (Docs & PRs)
- [ ] Documentation creation
- [ ] PR preparation
- [ ] Release notes draft

## Execution Status
- [x] Project architecture analyzed
- [x] Technical constraints identified
- [x] Implementation phases defined
- [x] Artifact requirements documented
- [ ] Ready for task generation phase