## Why

Setting up Scoutspec manually in a project requires creating directory structures (`scoutspec/context.md`, `scoutspec/index.yaml`, `scoutspec/specs/`, `scoutspec/requirements/`) and copying skill definition bundles to agent harnesses like `.claude` or `.opencode`. An interactive CLI command (`scoutspec init` / `npx scoutspec init`) automates project initialization, captures initial business context interactively, and injects agent skills into selected agent environments.

## What Changes

- Add a Node.js CLI package with executable `scoutspec` (supporting `npx scoutspec init` and `scoutspec init`).
- Implement interactive project setup using terminal prompts (`@clack/prompts`):
  - Detect existing `scoutspec/` folder and offer overwrite / merge confirmation.
  - Multi-select agent harness targets (`claude` -> `.claude/skills/`, `opencode` -> `.opencode/skills/`).
  - Interactive business context Q&A (Project description, Tech stack, Target audience/market) or skip with blank template.
- Scaffold filesystem layout (`scoutspec/context.md`, `scoutspec/index.yaml`, `scoutspec/specs/`, `scoutspec/requirements/`).
- Copy or inject Scoutspec skills (`scout-product-requirement`) to selected agent harness directories.
- Support non-interactive mode via flags (`-y`, `--yes`, `--agents <list>`).

## Capabilities

### New Capabilities
- `cli-init`: Interactive and scripted CLI initialization command for scaffolding Scoutspec repositories and injecting skills into agent harnesses.

### Modified Capabilities
<!-- None -->

## Impact

- New CLI binary and Node.js package structure (`package.json`, `src/cli/`, `bin/`).
- Direct integration with `.claude/skills/` and `.opencode/skills/` agent configurations.
- Dependencies: `@clack/prompts`, `commander`, `picocolors`, `tsup`.
