## Purpose

Provides a stateless task breakdown skill (`/scout:tasks`) to decompose technical designs into self-contained, parallelizable task units with strict file scope boundaries, git-worktree isolation rules, and contract locking.

## ADDED Requirements

### Requirement: Contract-First Task Breakdown
The system SHALL decompose technical designs into a 3-Phase task graph starting with Phase 1 contract and boundary definition.

#### Scenario: Phase 1 Contract Breakdown
- **WHEN** `/scout:tasks` is run on a `ready` technical design
- **THEN** Phase 1 tasks output locked interface types, schemas, and shared contracts before parallel tasks begin

### Requirement: Stateless Task Payload Specification
The system SHALL assign explicit file scope limits, git-worktree isolation options, input dependencies, and verification rules to every Phase 2 parallel task.

#### Scenario: Parallel Task Payload Definition
- **WHEN** a Phase 2 parallel task is generated in `tasks.md`
- **THEN** task payload defines `Inputs`, `Allowed Scope`, `Execution Mode` (e.g. `[isolation: worktree]`), `Expected Artifacts`, `Verification`, and `Spec Mapping`

### Requirement: Multi-Agent Parallel Execution Safety
The system SHALL organize Phase 2 tasks to allow execution across concurrent subagents or isolated git worktrees without scope overlap.

#### Scenario: Scope Collision Prevention
- **WHEN** parallel tasks are generated in `tasks.md`
- **THEN** system ensures no two parallel tasks have overlapping `Allowed Scope` file paths
