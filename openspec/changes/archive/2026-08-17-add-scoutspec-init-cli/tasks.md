## 1. Package & CLI Setup

- [x] 1.1 Initialize root `package.json` with CLI scripts, build pipeline (`tsup`), and dependencies (`commander`, `@clack/prompts`, `picocolors`).
- [x] 1.2 Setup TypeScript configuration (`tsconfig.json`) and entrypoint at `src/cli/index.ts` and `bin/scoutspec.js`.

## 2. Templates & Embedded Assets

- [x] 2.1 Create template assets for `scoutspec/context.md` and `scoutspec/index.yaml`.
- [x] 2.2 Bundle skill files from `skills/scout-product-requirement/` into package distribution templates.

## 3. Scaffolding & Skill Injection Engine

- [x] 3.1 Implement core filesystem scaffolding helper in `src/core/scaffold.ts` for directory tree and context rendering.
- [x] 3.2 Implement skill injection helper in `src/core/inject-skills.ts` for `.claude/skills/` and `.opencode/skills/`.
- [x] 3.3 Add conflict detection logic (existing folder handling: overwrite / merge / abort).

## 4. Interactive & Non-Interactive Init Command

- [x] 4.1 Implement `init` command handler in `src/cli/commands/init.ts` with interactive prompts using `@clack/prompts`.
- [x] 4.2 Support non-interactive mode via `-y` / `--yes` and `--agents` CLI flags.

## 5. Verification & Testing

- [x] 5.1 Build the CLI package using `tsup`.
- [x] 5.2 Test `scoutspec init` in a temporary test directory interactively and non-interactively.
- [x] 5.3 Verify skill injection and generated file structures.
