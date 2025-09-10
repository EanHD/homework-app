# Implementation Plan: Settings

**Branch**: `005-add-a-settings` | **Date**: 2025-09-10 | **Spec**: specs/005-add-a-settings/spec.md
**Input**: Feature specification from `/specs/005-add-a-settings/spec.md`

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
Add a central Settings experience for Homework Buddy so users can configure Notifications (enable/disable, default reminder offset, quiet hours), Appearance (light/dark theme, font scale), Data (export/import, clear with Undo), Onboarding (replay tour, reset sample data), and About. Preferences persist locally and apply across the SPA.

Milestones:
- M1 Store & Schema: Extend store with preferences slice and hydrate from localStorage.
- M2 UI: Build `src/pages/Settings.tsx` with grouped sections using Mantine components.
- M3 Integration: Apply theme/font scale globally, integrate reminder scheduling and onboarding hooks, wire export/import.
- M4 Tests & Docs: Unit tests for store persistence and toggles; integration test that disabling notifications prevents scheduling; README Settings overview.

## Technical Context
**Language/Version**: TypeScript 5.x, React 18  
**Primary Dependencies**: Vite 5 (bundler/dev), Mantine UI (components + theming), Zustand (app store), localforage (IndexedDB data)  
**Storage**: IndexedDB (via localforage) for classes/assignments; preferences persisted via localStorage (Zustand middleware)  
**Testing**: Vitest (unit + integration in jsdom)  
**Target Platform**: Modern browsers (installable PWA)  
**Project Type**: Single web app (frontend only)  
**Performance Goals**: Instant settings apply; list interactions under ~16ms  
**Constraints**: Offline-first; PWA base `/homework-app/`; a11y and reduced-motion respected  
**Scale/Scope**: Single-user local data; dozens–hundreds of assignments

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (frontend only)
- Using framework directly: Yes (React + Mantine directly)
- Single data model: Yes (Class, Assignment, Preferences)
- Avoiding unnecessary patterns: Yes (no repositories/UoW)

**Architecture**:
- Frontend app only; no backend/API
- Libraries: Mantine (UI), Zustand (state), localforage (storage), Vite (tooling)
- No CLIs or extra libraries required

**Testing (NON-NEGOTIABLE)**:
- RED→GREEN→Refactor applied per task where feasible
- Unit tests for store preferences and selectors
- Integration test ensures notification scheduling respects global disable
- Real storage exercised via memory-backed adapters where relevant

**Observability**:
- Basic error boundaries and console warnings where needed

**Versioning**:
- App version via package.json; no breaking API surface (local-only)

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

**Structure Decision**: Option 1 (Single project). Frontend app at repository root with `src/pages`, `src/store`, and `public` (PWA assets).

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

**Output**: research.md with unknowns resolved or explicitly deferred with rationale

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. API contracts: N/A (no backend). Define store interfaces, actions, and selectors as internal contracts in data-model.md. Create `/contracts/` for completeness.

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

**Output**: data-model.md, contracts/ (empty), quickstart.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: ~12–18 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


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
- [x] All NEEDS CLARIFICATION resolved for v1 scope
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
