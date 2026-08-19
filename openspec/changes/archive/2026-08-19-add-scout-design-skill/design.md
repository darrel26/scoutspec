## Context

See `proposal.md` for motivation. Scoutspec currently supports `/scout:product-requirement`. This design outlines how `/scout:design` will be structured in `skills/scout-design/` and integrated into the Scoutspec state machine (`scoutspec/context.md` and `meta.yaml`).

## Goals / Non-Goals

**Goals:**
- Provide a multi-agent technical research fan-out step (4 agents: Topology, Storage, API, Security/Ops).
- Support interactive, context-aware technical grilling turns adapted dynamically to greenfield vs brownfield codebases.
- Output a comprehensive Technical Design Document (`design.md`) bridging High-Level Design (HLD) and Low-Level Design (LLD).
- Synchronize refined technical scenarios back into incremental delta specs (`specs/<capability>/spec.md`).

**Non-Goals:**
- Replacing OpenSpec change lifecycle tooling (`openspec/changes/`).
- Auto-implementing code without developer approval.

## Decisions

1. **Multi-Agent Fan-Out Structure**:
   - Spawns 4 specialized technical subagents during initial discovery to avoid context window degradation.
   - *Alternative Considered*: Single large prompt. Rejected due to context limits and shallow technical trade-off evaluation.

2. **Adaptive Delta-Focused Grilling**:
   - Reads `scoutspec/context.md` first. Inherits existing stack for brownfield projects; asks foundational stack questions only for greenfield projects.
   - *Alternative Considered*: Hardcoded static 15-question list. Rejected because it feels redundant on existing projects.

3. **Combined HLD+LLD Template**:
   - `design.md` template covers system topology, API/interfaces, data models/schemas, operational readiness, and work sequence.
   - *Alternative Considered*: Separate HLD and LLD files. Rejected to keep artifact management clean in `scoutspec/requirements/<slug>/`.

## Risks / Trade-offs

- **Subagent token cost** → Use targeted system prompts and structured outputs.
- **Grilling fatigue** → Limit turns to 1-3 prioritized questions per round and provide instant exit (`skip`/`done`).
