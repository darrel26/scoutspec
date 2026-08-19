## Why

Scoutspec state machine currently completes `/scout:tasks` but lacks execution (`/scout:apply`) and spec archiving/syncing (`/scout:archive`, `/scout:sync`) capabilities. Adding these skills completes the end-to-end SDLC & PDLC lifecycle automation.

## What Changes

- Add `/scout:apply` skill to execute tasks from `tasks.md` across 3 phases (sequential foundation, parallel worktrees, sequential integration).
- Add `/scout:archive` and `/scout:sync` skills to merge delta specs into `openspec/specs/`, update `scoutspec/context.md`, and clean up/archive requirements.
- Register new skills in `src/core/inject-skills.ts` and sync templates in `templates/skills/`.

## Capabilities

### New Capabilities
- `execution-engine`: Handles 3-Phase task graph execution with contract locking and git-worktree isolation (`/scout:apply`).
- `spec-archive-sync`: Handles spec synchronization, persistent memory context updating, and requirement archiving (`/scout:archive`, `/scout:sync`).

### Modified Capabilities

## Impact

- `skills/scout-apply/`
- `skills/scout-archive/`
- `skills/scout-sync/`
- `templates/skills/scout-apply/`
- `templates/skills/scout-archive/`
- `templates/skills/scout-sync/`
- `src/core/inject-skills.ts`
