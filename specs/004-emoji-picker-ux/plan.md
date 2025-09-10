# Implementation Plan: Emoji Picker UX + Onboarding Polish

**Branch**: `004-emoji-picker-ux` | **Date**: 2025-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-emoji-picker-ux/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
UX polish feature adding built-in emoji picker for class creation, first-run onboarding with optional sample data, enhanced live updates for Today view with proper done item visibility, safety features (undo toasts, export/import), comprehensive keyboard shortcuts, and PWA verification. Technical approach: extend existing Zustand store with archive cleanup, create reusable EmojiPicker component with localStorage persistence, implement OnboardingGuide with step-by-step callouts, add ExportImport utilities for data backup/restore.

## Technical Context
**Language/Version**: TypeScript 5.4, React 18.3  
**Primary Dependencies**: Zustand 4.5 (state), Mantine 7.14 (UI), dayjs 1.11 (dates)  
**Storage**: IndexedDB via localforage (app data), localStorage (emoji recents, onboarding state)  
**Testing**: Vitest 2.0, @testing-library/react 16.0, jsdom 24.1  
**Target Platform**: Web PWA (desktop + mobile browsers), GitHub Pages deployment  
**Project Type**: web (frontend-only PWA)  
**Performance Goals**: <200ms emoji picker open, <50ms Today view updates, minimal bundle impact  
**Constraints**: Offline-capable, no external emoji APIs, preserve existing PWA functionality  
**Scale/Scope**: Small feature addition (~8 new components, ~15 test files, 0 breaking changes)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (PWA frontend only)
- Using framework directly? YES (Mantine components, Zustand store, no wrappers)
- Single data model? YES (extend existing Assignment type, no DTOs)
- Avoiding patterns? YES (direct component composition, no Repository/Factory patterns)

**Architecture**:
- EVERY feature as library? NO (PWA frontend uses component architecture)
- Libraries listed: N/A (component-based React app, not library architecture)
- CLI per library: N/A (web application)
- Library docs: N/A (README documents usage)

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES (tests written first, must fail before implementation)
- Git commits show tests before implementation? YES (TDD mandatory for new components)
- Order: Contract→Integration→E2E→Unit strictly followed? YES (component contracts → integration → unit)
- Real dependencies used? YES (actual DOM, localStorage, IndexedDB via localforage)
- Integration tests for: new components, data model changes, UI flows? YES
- FORBIDDEN: Implementation before test, skipping RED phase? ENFORCED

**Observability**:
- Structured logging included? YES (console logging for development, error boundaries)
- Frontend logs → backend? N/A (frontend-only PWA)
- Error context sufficient? YES (React error boundaries, try/catch in async operations)

**Versioning**:
- Version number assigned? 0.1.0 (MINOR increment for new features)
- BUILD increments on every change? YES (following semver)
- Breaking changes handled? N/A (all changes are non-breaking extensions)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - React PWA with component architecture under `src/`

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load Phase 1 artifacts: data-model.md, contracts/*.yaml, quickstart.md
- Generate tasks following refined milestone structure with TDD enforcement
- Each milestone builds on previous, with clear dependency chains
- Test tasks precede implementation tasks for Red-Green-Refactor cycle

**Milestone Structure**:

**M1 — Store & Types**:
- Add `completedAt`/`archivedAt` to Assignment type; migrate/hydrate defaults
- Add store actions: `toggleDone`, `archiveCompletedOlderThan(90)`, `seedSampleData`, `exportData`, `importData`, `undoLast`
- Enhanced selectors: `selectToday(now, filter)`, `selectUpcoming(now, filter)`, `countTodayProgress(now)` - exclude archived by default

**M2 — Today**:
- Restore greeting + centered progress ring (tabular numbers; blank center when total=0)
- Filter pills (All/Overdue/Today/Due soon/Done) synced to URL hash
- Reactive render via store subscribe/selectors

**M3 — Upcoming**:
- Keep done items visible; style muted + strikethrough
- Same filter pills as Today; date grouping with sticky headers

**M4 — Classes**:
- Add Class button with hotkey `c`; ClassModal (name required, emoji picker, color swatches)
- Card overflow menu: Edit, Delete (with confirmation), show open-task count

**M5 — Emoji & Onboarding**:
- EmojiButton component (Popover + emoji-mart) used in ClassModal
- Optional notes emoji insert in AssignmentForm
- First-run OnboardingHints (3 callouts) + "Add sample data" with Undo support

**M6 — Safety & PWA & A11y**:
- Toasts with Undo for deletes/import replace; Snooze options (Tonight/Tomorrow/1h)
- Verify manifest/icons/SW scope; ensure 404 redirect; add aria-labels, focus-visible
- Tests + README updates

**Parallel Execution Markers**:
- Store actions in M1 marked [P] (independent operations)
- Filter components in M2/M3 marked [P] (independent files)
- Modal components in M4/M5 marked [P] (independent files)
- Test files across all milestones marked [P] (independent test scenarios)

**TDD Enforcement**:
- Each store action gets failing test BEFORE implementation
- Each component gets contract test BEFORE implementation  
- Each user flow gets integration test BEFORE feature implementation
- Red-Green-Refactor cycle strictly enforced in task ordering

**Estimated Output**: 
- ~42 numbered tasks across 6 milestones
- ~12 [P] parallel tasks for independent components/actions
- ~18 test-first tasks to enforce TDD
- ~6 integration validation tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No constitutional violations detected*

All features follow established patterns:
- Component-based React architecture (no wrapper patterns)
- Direct Zustand store usage (no repository abstractions)  
- Standard localStorage and IndexedDB usage (existing patterns)
- TDD approach with failing tests first
- Single project structure maintained


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS  
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none - all within constitutional bounds)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*