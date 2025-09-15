# Implementation Plan: Official v1 Release - Production Polish & Complete Authentication

**Branch**: `012-official-v1-release` | **Date**: September 13, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-official-v1-release/spec.md`
**Arguments**: "we need to polish ui to make it a little more premium feeling, the tour for first timers must show up and be presented in the middle of the screen. all the features are working at this time except apple and google login. we just need a production ready polish without breaking anything! as well as removing clutter files and optimizing the main branch."

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
Create a production-ready v1 release of the homework app with premium UI polish, Google/Apple OAuth integration, optimized performance, and professional magic link email templates. Focus on maintaining existing functionality while enhancing visual design, centralizing the onboarding tour, removing development artifacts, and adding OAuth providers for seamless authentication.

## Technical Context
**Language/Version**: TypeScript 5.0+ with React 18 + Vite 5.0
**Primary Dependencies**: Mantine UI v7, Supabase Client, Zustand, React Router
**Storage**: Supabase PostgreSQL with real-time subscriptions and Auth
**Testing**: Vitest + React Testing Library with jsdom environment
**Target Platform**: Web (GitHub Pages) with PWA capabilities, mobile-responsive
**Project Type**: Single-page web application with service worker
**Performance Goals**: 3s initial load, 1s transitions, 200ms interaction feedback
**Constraints**: GitHub Pages deployment, base path `/homework-app/`, offline-capable PWA
**Scale/Scope**: Educational app for homework management, 10-50 screens, individual users

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Post-Design Re-evaluation** ✅ PASSED

**Simplicity**:
- Projects: 1 (homework-app web application) ✅
- Using framework directly? Yes (React/Mantine components directly, no wrappers) ✅
- Single data model? Yes (enhanced Zustand store with proper typing) ✅
- Avoiding patterns? Yes (direct Supabase client, no repository abstraction) ✅

**Architecture**:
- EVERY feature as library? No - this is a single web app, not a library project ✅
- Libraries listed: N/A (web application, not library distribution) ✅
- CLI per library: N/A (web application deployment via GitHub Pages) ✅
- Library docs: N/A (user-facing web application with UI documentation) ✅

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes (contracts define testable interfaces) ✅
- Git commits show tests before implementation? Will enforce for OAuth integration ✅
- Order: Contract→Integration→E2E→Unit strictly followed? Designed in contracts ✅
- Real dependencies used? Yes (actual Supabase instance, real OAuth providers) ✅
- Integration tests for: OAuth providers, notification system, PWA functionality ✅
- FORBIDDEN: Implementation before test, skipping RED phase ✅

**Observability**:
- Structured logging included? Console logging for development, error tracking for production ✅
- Frontend logs → backend? No (client-side web app, logs stay in browser) ✅
- Error context sufficient? Yes (error boundaries, performance monitoring, structured error logging) ✅

**Versioning**:
- Version number assigned? v1.0.0 (initial production release) ✅
- BUILD increments on every change? Will use semantic versioning with GitHub releases ✅
- Breaking changes handled? N/A for v1.0.0 initial release ✅

**Design Validation**: All contracts maintain simplicity, avoid over-engineering, and focus on testable interfaces. No constitutional violations introduced.
- Frontend logs → backend? No (client-side web app, logs stay in browser)
- Error context sufficient? Yes (error boundaries, Supabase error handling)

**Versioning**:
- Version number assigned? v1.0.0 (initial production release)
- BUILD increments on every change? Will use semantic versioning with GitHub releases
- Breaking changes handled? N/A for v1.0.0 initial release

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

**Structure Decision**: [DEFAULT to Option 1 unless Technical Context indicates web/mobile app]

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
- Load `/templates/tasks-template.md` as base structure
- Generate tasks from Phase 1 contracts and design documentation
- Each contract becomes a test-first implementation sequence
- Break down by feature domain: Auth → UI → Performance → Deployment

**Contract-to-Task Mapping**:
- auth-contract.md → OAuth integration tests [P] + OAuth implementation tasks
- ui-contract.md → UI component tests + premium theme implementation tasks  
- performance-contract.md → performance tests + optimization implementation tasks
- deployment-contract.md → production deployment tests + build configuration tasks

**TDD Task Ordering**:
1. **Contract Tests** (Parallel execution possible):
   - OAuth provider integration tests [P]
   - UI component contract tests [P] 
   - Performance benchmark tests [P]
   - Deployment validation tests [P]

2. **Model Implementation** (Sequential by dependency):
   - Enhanced auth state models
   - UI theme and component models
   - Performance monitoring models
   - Configuration models

3. **Service Implementation** (Sequential by dependency):
   - OAuth service integration (depends on auth models)
   - UI service enhancements (depends on theme models)  
   - Performance monitoring service (depends on metrics models)
   - Build and deployment services (depends on config models)

4. **Integration Tasks** (Sequential):
   - OAuth flow integration tests
   - Premium UI integration tests
   - Performance validation integration tests  
   - End-to-end deployment tests

**Estimated Task Breakdown**:
- 4 contract test tasks (parallel) 
- 8 model implementation tasks (sequential)
- 12 service implementation tasks (mixed parallel/sequential)
- 6 integration test tasks (sequential)
- 5 deployment and cleanup tasks (sequential)
- **Total**: ~35 numbered, ordered tasks

**Parallel Execution Markers**:
- Mark [P] for independent contract tests
- Mark [P] for independent model files
- Mark [P] for component implementations within same domain
- Sequential dependencies clearly marked with task number references

**IMPORTANT**: This phase will be executed by the /tasks command, NOT by /plan

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
- [x] Phase 0: Research complete (/plan command) - research.md created
- [x] Phase 1: Design complete (/plan command) - contracts/, data-model.md, quickstart.md, .github/copilot-instructions.md created
- [x] Phase 2: Task planning complete (/plan command) - task generation approach described
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*