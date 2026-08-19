## Context

See `proposal.md` - Scoutspec currently lacks runtime skills for execution (`/scout:apply`) and archiving/syncing (`/scout:archive`, `/scout:sync`).

## Goals / Non-Goals

**Goals:**
- Implement `/scout:apply` skill & template for task execution.
- Implement `/scout:archive` & `/scout:sync` skills & templates for spec merging and context management.
- Wire new skills into `src/core/inject-skills.ts`.

**Non-Goals:**
- Modify existing `/scout:product-requirement`, `/scout:design`, or `/scout:tasks` skills.

## Decisions

- **Decision 1**: Separate `/scout:apply` (task execution) from `/scout:archive` (spec merging). Keeps lifecycle phases explicit.
- **Decision 2**: Store templates in both `skills/` and `templates/skills/` to support initial CLI setup and local project instantiation.

## Risks / Trade-offs

- [Risk] Task worktree isolation might fail on uncommitted changes → Mitigation: Phase 1 checks git status cleanliness before running.
