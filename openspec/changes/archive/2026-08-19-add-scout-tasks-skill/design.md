# Design: Stateless Task Breakdown (/scout:tasks)

## Context

See `proposal.md` for motivation. `/scout:design` yields high-level architecture and low-level design files (`design.md`). Converting this design into runnable tasks requires clear execution phases, strict boundary locking, and self-contained task metadata so parallel agents can complete tasks independently without code conflicts or context drift. Using git worktrees isolates filesystem state for parallel subagents.

## Goals / Non-Goals

**Goals:**
- Design `/scout:tasks` skill structure, prompts, and templates.
- Enforce 3-Phase task DAG structure: Phase 1 Contract Lock, Phase 2 Parallel Execution, Phase 3 Integration & Verification Barrier.
- Provide clear metadata schemas per task: `[inputs]`, `[scope]`, `[execution mode]`, `[expected artifacts]`, `[verification]`, `[spec mapping]`.
- First-class support for multi-agent git worktree isolation (`isolation: "worktree"`).

**Non-Goals:**
- Managing subagent lifetime/process monitoring inside `/scout:tasks` itself (delegated to execution runner or Claude agent runtime).

## Decisions

### Decision 1: 3-Phase DAG Task Template Structure

- **Choice:** Require all generated `tasks.md` files to follow strict 3-Phase categorization:
  1. **Phase 1: Foundation & Contract Lock** (Sequential - Types, DB Schemas, Interfaces)
  2. **Phase 2: Parallel Implementation** (Concurrent - Modules partitioned by non-overlapping file directories & run in isolated worktrees)
  3. **Phase 3: Integration & Spec Verification Barrier** (Sequential - Branch merge, Route wiring, E2E tests, OpenSpec validation)
- **Rationale:** Prevents merge collisions during Phase 2 parallel agent runs while ensuring end-to-end purpose alignment in Phase 3.

### Decision 2: Self-Contained Task Metadata Payload with Worktree Isolation

- **Choice:** Format tasks in markdown with explicit key-value parameters:
  ```markdown
  - [ ] Task 2.1: Storage Module Implementation `[mode: parallel]` `[isolation: worktree]`
    - **Inputs:** `src/types/storage.ts`, `design.md#storage`
    - **Allowed Scope:** `src/storage/**`
    - **Expected Artifacts:** `src/storage/driver.ts`, `tests/storage.test.ts`
    - **Verification:** `npm test tests/storage.test.ts`
    - **Spec Mapping:** `specs/technical-design/spec.md#Requirement-Storage-Driver`
  ```
- **Rationale:** Gives spawned subagents complete context without needing full project history or cross-agent communication. Git worktrees guarantee isolated filesystem state per task.

## Risks / Trade-offs

- **[Risk]** Over-fragmentation of tasks leads to high agent token overhead and excessive git worktree creation cost.
  - **Mitigation:** Guidelines in prompt to group small functions into module-level tasks.
- **[Risk]** Overlapping file scopes in Phase 2 lead to git merge conflicts during Phase 3 barrier merge.
  - **Mitigation:** Explicit verification in `/scout:tasks` generator that `Allowed Scope` directories do not intersect across parallel tasks.
