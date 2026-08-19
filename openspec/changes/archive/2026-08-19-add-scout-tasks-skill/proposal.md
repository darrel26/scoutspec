# Proposal: Add /scout:tasks Skill for Stateless Task Breakdown

## Why

After `/scout:design` produces technical architecture and design documents (`design.md`), complex implementations require a structured breakdown tool (`/scout:tasks`). This tool breaks down high-level designs into stateless, contract-first tasks that can be executed concurrently by multiple agents without context drift or code merge conflicts. Incorporating git-worktree support guarantees complete filesystem and git state isolation during multi-agent parallel execution.

## What Changes

- Introduce the `/scout:tasks` skill to decompose `proposal.md`, `design.md`, and `specs/` into a stateless task graph (`tasks.md`).
- Enforce a 3-Phase task structure:
  - **Phase 1: Contract & Boundary Lock** (Shared interfaces, DB schemas, types).
  - **Phase 2: Stateless Parallel Execution** (Self-contained tasks with directory scope limits, git-worktree isolation (`isolation: "worktree"`), and explicit input/output definitions).
  - **Phase 3: Integration & Alignment Barrier** (Branch merge, cross-module wiring, and automated test verification).
- Add explicit git-worktree workflow guidelines for multi-agent parallel execution.
- Add templates and prompt helpers for task generation and multi-agent execution mapping.
- Register `/scout:tasks` in `src/core/inject-skills.ts` and CLI scaffold helpers.

## Capabilities

### New Capabilities
- `task-breakdown`: Decomposes technical design artifacts into stateless, parallelizable execution units with clear contract boundaries, allowed file scopes, git-worktree isolation rules, and explicit verification criteria.

### Modified Capabilities
*(None)*

## Impact

- Adds `skills/scout-tasks/` (Skill definition, prompts, references).
- Adds `templates/skills/scout-tasks/` (Task graph template with git-worktree tags).
- Updates `src/core/inject-skills.ts` for automated skill injection.
