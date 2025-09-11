# Feature Specification: Notifications Reliability & UI Polish

**Feature Branch**: `008-notifications-ui-polish`  
**Created**: 2025-09-11  
**Status**: Draft  
**Input**: User description: "Title: Homework App – Notifications + UI Polish (Sprint M1)

Goal:
- Make Web Push notifications reliable in dev and production.
- Fix visual/layout bugs (header too tall, bottom bar overlap, list clipping at bottom, safe-area on mobile).
- Ship a repeatable smoke test and short docs so I can validate in <5 minutes.

Context:
- Repo: homework-app
- Agent: Replit Agent 3
- Please first read `.github/` SpecKit docs in this repo to understand conventions, PR etiquette, and /-commands.
- Notifications stack suspected: Service Worker + Push subscription + Supabase Functions (e.g., `subscribe`, maybe `schedule`/`send`), CORS module in `supabase/functions/_shared/cors.ts`.

Non-Goals:
- Full redesign.
- Data model changes beyond storing push subscriptions and required metadata.

Constraints:
- Keep diffs small and reviewable. No big refactors.
- Maintain current design language; prefer CSS/utility fixes.
- Guard mobile browsers (iOS Safari, Android Chrome) and HTTPS-only requirements for push.

Deliverables (Acceptance Criteria):
1) Notifications work E2E:
   - Dev: `npm run dev` → register SW → subscribe → run a test script → push arrives.
   - Prod: Deployed site → same flow.
   - Provide `scripts/test-push.[ts|js]` and a `curl` sample that succeeds.
   - Document VAPID/public key setup and where ENV is injected.

2) Supabase integration verified:
   - List active functions (names + paths).
   - Show `deno.json` flags for each (verify_jwt on/off) and why.
   - Confirm CORS origins; provide working preflight `curl -X OPTIONS` example.
   - If cron/schedule exists or is needed for a test ping, document it or add it clearly.

3) UI bugs fixed (at minimum):
   - Header height no longer obstructive.
   - Bottom bar no longer overlaps content; safe-area insets handled.
   - List no longer clipped at bottom; keyboard/focus on mobile doesn't hide content.
   - Provide before/after screenshots or devtools gifs.

4) Tests & CI:
   - Add Playwright or similar e2e for "subscribe → receive test push" (can be mocked if real push flaky in CI).
   - Add a layout guard test (simple viewport screenshot compare or DOM assertions).
   - Ensure CI runs them (reuse SpecKit CI if present).

5) Docs:
   - `NOTIFICATIONS_REPORT.md`: architecture map, failure points found, exact fixes, commands to run.
   - `UI_REPORT.md`: bugs found, minimal diffs, code snippets, screenshots.
   - A 1-page "SMOKE_TEST.md" with copy-paste commands for dev and prod validation.

Risks to watch:
- SW scope/path and cache busting.
- Permission timing; unsupported browser paths.
- CORS and mixed-content/HTTP pitfalls.
- RLS blocking subscription writes in Supabase.
- Mobile viewport units (`100vh`) causing clipping; missing `env(safe-area-inset-*)`.

Definition of Done:
- All acceptance checks pass locally.
- PR(s) open with screenshots/logs.
- I can run SMOKE_TEST.md end-to-end without you."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a student using the homework app, I want reliable push notifications for my assignments that work consistently across development and production environments, and I want the app's interface to display properly on both desktop and mobile devices without content being hidden or overlapped.

### Acceptance Scenarios
1. **Given** I enable notifications in the app settings, **When** I create an assignment with a reminder, **Then** I receive a push notification at the specified time in both development and production environments.
2. **Given** I'm using the app on my mobile device, **When** I navigate through different screens, **Then** the header doesn't obstruct content and lists display fully without being cut off at the bottom.
3. **Given** I'm testing the notification system, **When** I run the provided smoke test commands, **Then** I can validate the entire notification flow within 5 minutes without developer assistance.
4. **Given** I'm using the app on iOS Safari or Android Chrome, **When** I interact with forms or keyboards, **Then** content remains visible and accessible with proper safe-area handling.
5. **Given** I'm a developer working on the app, **When** I run the test suite, **Then** both notification functionality and UI layout are automatically verified.

### Edge Cases
- What happens when notifications are disabled at the browser level but enabled in app settings?
- How does the system handle network connectivity issues during notification registration?
- What occurs when the app is used in landscape mode on mobile devices?
- How does the interface behave on devices with notches or dynamic islands?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The notification system MUST work reliably in both development and production environments without requiring manual intervention.
- **FR-002**: Users MUST be able to receive push notifications for assignment reminders when they have granted browser permission.
- **FR-003**: The system MUST provide a complete smoke test that validates the notification flow end-to-end within 5 minutes.
- **FR-004**: The app interface MUST display correctly on mobile devices with proper safe-area insets and no content obstruction.
- **FR-005**: Headers MUST not block or hide main content areas on any supported screen size.
- **FR-006**: Lists and scrollable content MUST be fully accessible without being clipped at the bottom of the viewport.
- **FR-007**: Keyboard interactions on mobile MUST not hide important content or controls.
- **FR-008**: The system MUST handle notification permission states gracefully, providing clear feedback when permissions are denied.
- **FR-009**: All notification-related backend functions MUST be properly documented with their purposes, authentication requirements, and CORS configurations.
- **FR-010**: The system MUST include automated tests that verify both notification delivery and UI layout correctness.
- **FR-011**: Documentation MUST be provided that allows non-developers to validate the system functionality independently.
- **FR-012**: All visual bugs MUST be fixed using minimal, reviewable changes that maintain the existing design language.

### Key Entities *(include if feature involves data)*
- **Push Notification**: Represents a scheduled or immediate notification to be delivered to a user's device about an assignment or system event.
- **User Device Subscription**: Represents a registered endpoint for delivering push notifications to a specific user's device or browser.
- **UI Layout Component**: Represents interface elements (headers, lists, forms) that must display correctly across different devices and orientations.
- **Test Validation Report**: Represents the results of smoke testing that confirms system reliability and accessibility.

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---