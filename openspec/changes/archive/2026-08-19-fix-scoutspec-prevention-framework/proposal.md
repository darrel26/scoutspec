## Why

Scoutspec execution generated backend services and UI that passed 100% unit tests but failed in production due to missing navigable UI routes, unconfigured styling dependencies, and incomplete verification barriers. Implementing a Universal Prevention Framework across `scout:design`, `scout:tasks`, and `scout:apply` skills will prevent silent integration failures.

## What Changes

- Add pre-flight baseline check in `scout:tasks` to verify toolchains/packages and auto-inject Task 0 if missing dependencies exist.
- Add route & target coverage audit in `scout:design` and `scout:tasks` to map all user-facing entry points (UI routes, API endpoints, CLI flags) 1:1 to implementation tasks.
- Add E2E build & reachability verification gate in `scout:apply` (Phase 3) enforcing full build compilation, route reachability checks, and functional integration tests.

## Capabilities

### New Capabilities

- `prevention-framework`: Enforces Pre-Flight Baseline Checks, Target Coverage Audits, and E2E Build Verification Gates across Scoutspec agent skills.

### Modified Capabilities

None.

## Impact

- `skills/scout-design/prompts/api-interfaces.md` & `topology-architecture.md`
- `skills/scout-tasks/SKILL.md` & `prompts/task-decomposer.md`
- `skills/scout-apply/SKILL.md`
- `templates/skills/` mirrors of these skills
