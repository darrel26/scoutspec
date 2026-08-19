## Context

See `proposal.md` for motivation. Scoutspec agent skills currently lack automated validation gates for pre-flight environment baseline, 1:1 route/target coverage mapping, and E2E build/reachability verification.

## Goals / Non-Goals

**Goals:**
- Update `skills/scout-tasks` and `skills/scout-design` prompts to audit dependencies and target routes.
- Update `skills/scout-apply` to add a Phase 3 Build & Reachability Gate.
- Sync templates in `templates/skills/` to mirror all prompt updates.

**Non-Goals:**
- Creating runtime server mocks or complex headless browser test frameworks outside of standard build toolchain commands.

## Decisions

### Decision 1: Phase 1 Task 0 Baseline Auto-Generation

In `skills/scout-tasks/prompts/task-decomposer.md` and `skills/scout-tasks/SKILL.md`:
- Introduce a mandate: Audit project configuration (`package.json`, styles, framework config).
- If dependencies/baseline configs are missing, automatically insert `Task 0: Pre-Flight Baseline Setup` into Phase 1 of `tasks.md`.

### Decision 2: Target Coverage Matrix in Task Decomposition

In `skills/scout-design/prompts/api-interfaces.md` and `skills/scout-tasks/prompts/task-decomposer.md`:
- Require design documents to output an explicit list of target interaction endpoints (UI links, API routes, CLI flags).
- Require task decomposition to cross-reference every target entry point against Phase 2 implementation tasks.

### Decision 3: Phase 3 Verification Gate in Scout Apply

In `skills/scout-apply/SKILL.md`:
- Expand Phase 3 execution into 3 steps:
  1. Build Gate: Run native build toolchain command (`npm run build` or platform equivalent).
  2. Reachability Audit: Programmatically audit compiled output to ensure all target routes map to concrete handlers.
  3. Behavioral Gate: Execute full integration/E2E test suite.

## Risks / Trade-offs

- [Risk] Custom build scripts or non-standard project setups might fail standard build commands. → Mitigation: Allow configurable verification commands in `meta.yaml` / `scoutspec/context.md`.
