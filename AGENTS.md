# AGENTS: Speckit Workflow Guide

This repository uses the Speckit workflow to structure feature work from specification → plan → tasks → implementation. This guide is for AI/automation agents and humans starting a new session so you can quickly orient and execute the next task correctly.

## Overview
- Phases: Spec → Plan → Tasks → Implementation.
- Source of truth for work: `specs/<feature>/tasks.md`.
- Keep changes minimal and focused on the current task ID (Txxx).
- Do not reorder or rewrite tasks; execute them as written.

## Repo Layout (Speckit)
- `specs/<feature>/spec.md` — business specification (WHAT/WHY).
- `specs/<feature>/plan.md` — implementation plan (architecture/approach).
- `specs/<feature>/tasks.md` — ordered task list to execute now.
- `templates/` — Speckit templates for plan/tasks generation (reference only).
- `scripts/` — helper scripts (e.g., `check-task-prerequisites.sh`).

## Start A New Session (Quickstart)
1. Discover active feature
   - Preferred: derive from current branch name `NNN-feature-name`.
   - Script: `scripts/check-task-prerequisites.sh --json` (lists feature dir and available docs).
   - Fallback: inspect `specs/` and choose the active feature directory.
2. Load context
   - Read `specs/<feature>/spec.md` and `plan.md` to understand scope and stack.
   - Open `specs/<feature>/tasks.md` — this is your execution queue.
3. Pick the next task
   - Start at the first unchecked item (e.g., T001).
   - Respect [P] markers: they indicate independence across files. Avoid touching the same file as another [P] task.
4. Execute precisely
   - Only change files explicitly named in the task.
   - Keep edits minimal; avoid pre-building future tasks.
   - Follow existing style and patterns in this repo; prefer the simplest correct solution.
5. Validate
   - If tests or build steps exist, run them locally. If environment limits installs or network, validate by static checks and inform the user.
6. Report progress
   - Summarize what changed and what’s next. Do not edit `tasks.md` checkboxes unless asked.

## Speckit Phases (How They Map Here)
- Phase 1: Spec — already captured under `specs/<feature>/spec.md`.
- Phase 2: Plan — under `specs/<feature>/plan.md` (includes tech stack and sequencing).
- Phase 3: Tasks — under `specs/<feature>/tasks.md` (ordered Txxx items; [P] means parallelizable/independent files).
- Phase 4: Implementation — you are here; implement tasks in order and keep each change atomic.

## Conventions & Guardrails
- File paths: tasks specify exact paths; create missing files/directories as needed.
- Don’t change templates or task generation logic during implementation.
- Keep diffs focused; avoid unrelated refactors.
- PWA: later tasks may reference `public/` assets, service worker, and `workbox-window`.
- React+Vite+TS: alias `@` → `/src` is introduced during early setup tasks.

## Codex CLI / Automation Notes
- Use small, clear preambles before running multiple related commands.
- Maintain an execution plan and mark steps complete as you go.
- Prefer `rg` for fast search; read files in ≤250-line chunks.
- Do not run network installs or perform `git commit` unless explicitly requested by the user.
- When validation isn’t feasible (e.g., no deps installed), state assumptions and offer follow‑ups.

## App Store (Zustand) vs Legacy Context
- New pages and UI should use the app store at `src/store/app.ts` (Zustand) for all reads/writes.
- Pages should subscribe to `lastChangeToken` or select state slices so the UI re‑renders on mutations.
- AssignmentForm falls back to app store actions (add/update/addClass) when legacy actions are not passed; prefer the app store path.
- Use `loadAll()` on boot to hydrate, and keep `bootCleanup()` on boot to archive old completed items.
- When computing Today, use local day (not UTC) to match user expectations.

## Notifications
- Use Mantine Notifications and render Undo as an inline `<Button>` inside `message`; do not rely on a non‑existent `action` prop in older Mantine versions.

## Testing
- Wrap UI tests with MantineProvider (`tests/utils/providers.tsx`).
- jsdom shims: `tests/setup.ts` provides `matchMedia` and `ResizeObserver`.
- Do not replace the Zustand store when resetting in tests (`useAppStore.setState(..., false)`) so methods remain defined.

## SPA & Pages
- Vite `base` is `/homework-app/` for GH Pages.
- We include `public/404.html` to redirect unknown paths to base.

## When Tasks Are Missing
- If a feature folder exists without `tasks.md`, reference templates in `templates/`:
  - `plan-template.md` describes Phase 2 outputs and constraints.
  - `tasks-template.md` describes how tasks are generated and formatted.
- Ask the user to run the appropriate generation step (e.g., “/tasks”) or provide the missing document(s).

## Helpful Script
- `scripts/check-task-prerequisites.sh` — verifies feature folder and presence of plan; `--json` outputs machine-readable summary.

---
This AGENTS.md applies repo‑wide. If a subdirectory defines a more specific AGENTS.md, the deeper file takes precedence for files under its directory.
