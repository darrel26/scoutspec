---
name: scout:apply
description: Executes tasks from tasks.md across a 3-Phase DAG using git-worktree isolation for parallel tasks.
---

# /scout:apply

Executes tasks defined in `scoutspec/requirements/<slug>/tasks.md` sequentially or in parallel depending on phase.

## Usage
`/scout:apply <requirement-slug>`

---

## Phase 1: Foundation Execution (Sequential)
1. Read `scoutspec/requirements/<slug>/tasks.md`.
2. Verify working directory git status is clean.
3. Execute all Phase 1 tasks sequentially.

## Phase 2: Parallel Implementation Execution
1. For each Phase 2 task in `tasks.md`, launch isolated git worktree execution if marked `[mode: parallel]`.
2. Restrict edits to `Allowed Scope`.
3. Verify task artifacts and run `Verification` commands.

## Phase 3: Integration & Spec Verification (Sequential)
1. Merge worktrees into main feature branch.
2. Run cross-module integration tests and verify `specs/` requirements.
3. Update `tasks.md` status to complete.
