## Context

Scoutspec is a standalone, self-contained spec-driven workflow system owning the full PDLC and SDLC. See `proposal.md` for background and `specs/product-requirement-gathering/spec.md` for behavioral contracts.

## Goals / Non-Goals

**Goals:**
- Implement persistent project intelligence store (`scoutspec/context.md` + `scoutspec/index.yaml`).
- Implement per-requirement directory structure and state machine in `scoutspec/requirements/<slug>/meta.yaml`.
- Build parallel delta-research fan-out writing to individual `research/*.md` files.
- Implement synthesis step that writes `synthesis.md` and back-propagates insights into `context.md`.
- Implement frontier-based grilling loop logging full audit history into `grilling.md`.
- Implement native Markdown Delta Spec engine (`ADDED`, `MODIFIED`, `REMOVED`) for syncing into living `scoutspec/specs/`.

**Non-Goals:**
- Relying on external OpenSpec CLI binaries or runtime commands.
- Global user-level installation into `~/.claude/` or `~/.opencode/` (isolated locally to repository).

## Decisions

### 1. Persistent State & Knowledge Architecture
- **Choice**: Store global state in `scoutspec/index.yaml` and `scoutspec/context.md`. Store local requirement state in `scoutspec/requirements/<slug>/meta.yaml`.
- **Rationale**: Enables cross-run learning. Later requirements automatically reuse validated personas, architecture patterns, and market knowledge without cold-start amnesia.
- **Alternative Considered**: Ephemeral subagent runs. Rejected because requirements repeat known facts.

### 2. State Machine Transitions
- **Choice**: Explicit lifecycle transitions: `researching` → `synthesizing` → `grilling` → `ready` → `designing` → `implementing` → `archived`.
- **Rationale**: Complete traceability of project maturity and easy resume/re-entry.

### 3. Native Markdown Delta Spec Engine (Option 1)
- **Choice**: Replicate `ADDED`, `MODIFIED`, `REMOVED` section semantics for requirement delta specs.
- **Rationale**: Keeps living specs human-readable and clean in git while maintaining exact requirement auditability across dozens of features.
- **Alternative Considered**: Direct in-place file mutation. Rejected due to lack of isolated requirement diff review.

### 4. Modular Skill Architecture
- **Choice**: Place skill in `skills/scout-product-requirement/` with `SKILL.md` orchestrator, `prompts/` directory for subagents, and `references/` for frontier heuristics and delta engine rules.
- **Rationale**: Clean separation of agent roles and transparent prompt maintenance.

## Risks / Trade-offs

- **Risk: `context.md` bloat over time** → Mitigation: Synthesis step curates and deduplicates facts before appending to `context.md`.
- **Risk: Competitor hallucination without live web data** → Mitigation: Competitor Analysis prompt explicitly mandates `WebSearch` and `WebFetch` tool invocation.
- **Risk: Delta merge conflicts during archive** → Mitigation: Markdown header matching on `### Requirement:` titles with strict section validation.
