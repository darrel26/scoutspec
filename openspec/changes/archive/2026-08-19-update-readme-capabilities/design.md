## Context

See `proposal.md`. `README.md` currently covers only `scoutspec init` and `/scout:product-requirement`. Scoutspec contains skills in `skills/`:
- `scout-product-requirement`
- `scout-design`
- `scout-tasks`
- `scout-apply`
- `scout-archive`
- `scout-sync`

## Goals / Non-Goals

**Goals:**
- Provide a clear, comprehensive overview of all 6 scout skills in `README.md`.
- Document how `init` injects all capabilities into target agent directories.
- Structure workflow sections logically following the SDLC / PDLC pipeline.

**Non-Goals:**
- Modifying underlying CLI logic or skill definitions.
- Writing separate detailed documentation guides in `docs/` beyond what `README.md` needs.

## Decisions

- **Decision 1: Restructure Core Workflow diagram in README**:
  - Show the end-to-end SDLC pipeline (`product-requirement` → `design` → `tasks` → `apply` → `archive` / `sync`) as interconnected skills.
- **Decision 2: Expand Skills Overview Section**:
  - Add dedicated subsections/tables for each of the 6 skills explaining command usage, role, and output artifacts.

## Risks / Trade-offs

- [Risk] README becoming overly verbose.
  → Mitigation: Use concise tables and high-level workflow diagrams rather than dumping full skill source prompts.
