# Feature Specification: Repair Replit Changes + Ship Clean Deploy

**Feature Branch**: `009-repair-replit-changes`  
**Created**: 2025-09-12  
**Status**: Draft  
**Input**: User description: "Audit the repo for Replit‑induced changes and fix anything that breaks local builds, CI, GitHub Pages, service worker, or Supabase functions. Deliver a clean, reproducible deploy to GitHub Pages and a 5‑minute smoke test. Target branch for work: 008‑notifications‑ui‑polish (then merge to main via PR). Replit likely touched: .replit, replit.nix, .github/workflows/*, public/.nojekyll, service worker files, and routing/build configs. Hosting: GitHub Pages. Backend: Supabase Functions. Follow branch/PR etiquette and slash‑command flow. Non‑Goals: no redesign or dependency upgrades unless required to unblock deploys. Constraints: keep diffs small and reviewable (no refactors >50 LOC per file). Feature branches only; do not push to main. Prefer minimal config fixes over new tools. Acceptance: 1) local build/preview succeed, 2) Pages workflow succeeds and site loads at correct base path, 3) service worker registers without loops and cache busts correctly, 4) web push works in dev and prod or failing pieces documented with a working mock and clear fix list, 5) Supabase Functions reachable with CORS preflight passing and verify_jwt flags documented, 6) SMOKE_TEST.md enables ~5 minute validation with PR screenshots/logs."

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

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a project maintainer, I can reliably build and deploy the app after Replit changes so that CI, GitHub Pages hosting, service worker behavior, and Supabase Function calls work end‑to‑end, with a documented 5‑minute smoke test to verify.

### Acceptance Scenarios
1. Given a fresh checkout on the feature branch, when I run `npm run build` and `npm run preview`, then the app builds without errors and serves correctly at the expected base path.
2. Given a pull request from the feature branch, when GitHub Actions runs the Pages workflow, then the build artifact deploys and the site loads at the Pages URL with the correct base path.
3. Given the deployed site is loaded, when the service worker registers, then it does not enter an update/reload loop and updates assets via cache busting on new deploys.
4. Given push notifications are exercised in dev and prod, when a notification subscription and send are attempted, then they succeed; if not fully functional, a working mock path exists and gaps are clearly documented.
5. Given the app calls Supabase Functions from the Pages origin, when preflight and requests are made, then CORS passes and any authentication requirements (e.g., verify_jwt) are identified and documented.
6. Given SMOKE_TEST.md is followed, when a reviewer executes the checklist, then validation completes in about five minutes and screenshots/logs are attached to the PR.

### Edge Cases
- Deployed base path mismatch causes broken asset routing or blank screen.
- Service worker stale cache causing old bundles to persist after deploy.
- CORS preflight failures to Supabase Functions due to missing headers or methods.
- Missing or invalid push notification keys preventing subscription/send in one environment.
- Offline or flaky network states during registration and initial load.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The app MUST build locally without errors and serve via a local preview matching the deployed base path behavior.
- **FR-002**: The GitHub Pages workflow MUST complete successfully and publish a working site at the expected URL.
- **FR-003**: The service worker MUST register without causing reload loops and MUST update caches so users receive new versions after deploys.
- **FR-004**: The push notification flow MUST function in development and production, or a working mock MUST be provided with documented gaps and remediation steps.
- **FR-005**: Calls to Supabase Functions from the deployed site MUST succeed including CORS preflight, with any auth enforcement (e.g., token verification) documented for reviewers.
- **FR-006**: A concise SMOKE_TEST.md MUST exist enabling validation within approximately five minutes including screenshots/logs.
- **FR-007**: Changes MUST be minimal in scope, avoiding large refactors (>50 LOC per file) and dependency upgrades unless strictly required to restore the deploy.
- **FR-008**: Work MUST occur on a feature branch with a PR into main, following repository branch and review etiquette.

*Ambiguities to clarify:*
- **FR-009**: [NEEDS CLARIFICATION: Confirm exact Pages URL and base path expected for this repository/deployment.]
- **FR-010**: [NEEDS CLARIFICATION: Confirm availability of valid push credentials (keys) for both dev and prod, and where reviewers can access them.]
- **FR-011**: [NEEDS CLARIFICATION: Confirm which Supabase Functions endpoints must be validated and whether auth is required for each.]
- **FR-012**: [NEEDS CLARIFICATION: Enumerate any known Replit‑modified files beyond those listed to ensure full audit coverage.]

### Key Entities *(include if feature involves data)*
- **Deployment Artifact**: The built site assets and metadata that determine routing, base path, and cache versioning.
- **Runtime Environment**: The hosting context where the site runs and registers a service worker; includes configuration influencing caching and origin.
- **Notifications Backend**: The external service handling subscription and delivery; expectations include reachable endpoints and permissible CORS.
- **Smoke Test Checklist**: The documented steps, expected observations, and evidence required to validate readiness.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---
