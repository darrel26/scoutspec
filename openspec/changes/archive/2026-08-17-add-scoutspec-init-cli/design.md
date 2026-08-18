## Context

See `proposal.md` for motivation and requirements. Scoutspec currently has skills stored in `skills/scout-product-requirement/` and reference folder layout in `scoutspec/`. We need a CLI entry point so users running `npx scoutspec init` or `scoutspec init` in any project can interactively initialize Scoutspec structures and copy skills.

## Goals / Non-Goals

**Goals:**
- Provide a Node.js binary CLI with `init` subcommand.
- Use `@clack/prompts` for interactive UX (agent harness selection, optional business context Q&A, overwrite handling).
- Scaffold canonical folders: `scoutspec/context.md`, `scoutspec/index.yaml`, `scoutspec/specs/`, `scoutspec/requirements/`.
- Copy skill bundles to `.claude/skills/scout-product-requirement/` and `.opencode/skills/scout-product-requirement/`.
- Support headless execution with `-y` / `--yes` and `--agents`.

**Non-Goals:**
- Custom binary compilations (Go/Rust) - keep simple Node/TypeScript package.
- Requirement run execution in CLI (that is handled by agent skills like `/scout:product-requirement`).
- Cloud synchronization or remote backends.

## Decisions

### 1. Package Structure and Entrypoint
- Structure:
  - `package.json` with `"bin": { "scoutspec": "./bin/scoutspec.js" }`
  - `src/cli/index.ts` using `commander` for CLI structure.
  - `src/cli/commands/init.ts` for init logic.
  - `src/templates/` storing default templates (`context.md`, `index.yaml`, skills).
- Build tool: `tsup` bundling to CJS/ESM executable.

*Alternatives considered:*
- Standalone bash script: Inconsistent across Windows/Node environments, poor UX.

### 2. Prompting UI
- `@clack/prompts` for interactive CLI flow.
- `picocolors` for terminal coloring.

*Alternatives considered:*
- `inquirer` / `prompts`: Bulkier, `@clack/prompts` provides a modern and clean CLI UX matching modern dev tools.

### 3. Skill Asset Packaging
- Embed/bundle skills from `skills/scout-product-requirement/` into CLI template assets so `npx scoutspec init` operates self-contained without needing git repo clone.

## Risks / Trade-offs

- [Agent folder permissions or existing files] → Check directory presence, create parent folders recursively (`fs.mkdirSync(..., { recursive: true })`), prompt before overwriting.
- [Node environment version] → Target Node >= 18 for native `fs/promises` and global `fetch`/ESM support.
