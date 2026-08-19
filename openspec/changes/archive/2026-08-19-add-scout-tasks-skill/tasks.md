## 1. Phase 1: Skill Setup & Templates

- [x] 1.1 Create skill definition `skills/scout-tasks/SKILL.md` with 3-phase execution rules and git-worktree support.
- [x] 1.2 Add prompt templates in `skills/scout-tasks/prompts/task-decomposer.md`.
- [x] 1.3 Add task output template in `templates/skills/scout-tasks/tasks-template.md` with git-worktree isolation metadata.

## 2. Phase 2: Core Integration & Registration

- [x] 2.1 Register `/scout:tasks` in `src/core/inject-skills.ts`.
- [x] 2.2 Add skill CLI command hook/alias in `src/core/scaffold.ts`.

## 3. Phase 3: Validation & Spec Verification

- [x] 3.1 Verify `/scout:tasks` against `openspec/specs/task-breakdown/spec.md`.
- [x] 3.2 Build project (`npm run build`) and test skill injection output.
