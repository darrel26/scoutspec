# Task Decomposer Prompt

Analyze `proposal.md`, `design.md`, and `specs/` to output a 3-Phase stateless task DAG in `tasks.md`.

## Decomposition Rules

0. **Pre-Flight Baseline Check**
   - Audit target environment configuration, styling setup, and runtime dependencies.
   - Missing baseline dependencies = auto-create Task 0 in Phase 1.

1. **Phase 1: Foundation & Contract Lock**
   - Extract interface types, schemas, and API primitives from `design.md`.
   - Ensure all Phase 1 tasks produce single-source-of-truth contract files.

2. **Phase 2: Stateless Parallel Execution & Target Route Audit**
   - Identify independent modules from HLD/LLD.
   - Cross-reference design entrypoints (UI links, API routes, CLI flags). Every target entrypoint MUST have an explicit implementation task.
   - For each module, generate a Phase 2 task with:
     - `Allowed Scope`: Non-overlapping directory glob (e.g., `src/backend/**`).
     - `Execution Mode`: `[mode: parallel]` `[isolation: worktree]`.
     - `Inputs`: Phase 1 types & spec requirements.
     - `Expected Artifacts`: Code files & test files.
     - `Verification`: Verification command.

3. **Phase 3: Integration & Spec Verification Barrier**
   - Wire parallel modules together.
   - Add end-to-end integration tests.
   - Validate against OpenSpec scenarios in `specs/`.
