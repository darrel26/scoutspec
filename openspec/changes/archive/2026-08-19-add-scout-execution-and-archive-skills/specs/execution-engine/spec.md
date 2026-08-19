## Purpose

Provides a 3-Phase task graph execution engine with contract locking and git-worktree isolation.

## ADDED Requirements

### Requirement: Task Execution Engine
The system SHALL provide a `/scout:apply` skill that executes tasks defined in `tasks.md`.

#### Scenario: Phase-based execution
- **WHEN** user invokes `/scout:apply`
- **THEN** system executes Phase 1 sequentially, Phase 2 in parallel worktrees, and Phase 3 sequentially.
