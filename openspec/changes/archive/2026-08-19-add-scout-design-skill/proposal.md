## Why

After completing product requirement gathering (`/scout:product-requirement`), projects need a dedicated technical architecture and system design phase (`/scout:design`) before implementation. Currently, there is no standardized way to fan out technical research across specialized agents, dynamically discuss technical trade-offs based on brownfield vs greenfield context, and generate comprehensive High-Level (HLD) and Low-Level (LLD) design documentation alongside refined delta specs.

## What Changes

- Add `/scout:design` skill and execution template supporting multi-agent technical fan-out (Topology, Storage, API, Security/Ops).
- Introduce dynamic, delta-focused technical grilling turns that adapt to existing codebase stack (`scoutspec/context.md`) instead of hardcoded interrogations.
- Produce comprehensive Technical Design Document (`design.md`) combining HLD (architecture, data flow, operational readiness) and LLD (DB schemas, API definitions, data models, work sequencing).
- Incrementally update capability delta specs (`specs/<capability>/spec.md`) with explicit technical scenarios (`ADDED`/`MODIFIED`/`REMOVED`) before code implementation.

## Capabilities

### New Capabilities
- `technical-design`: Covers multi-agent technical research, adaptive technical grilling, HLD+LLD technical design doc generation, and delta spec synchronization.

### Modified Capabilities
- None

## Impact

- Adds `/scout:design` skill file (`skills/scout-design/SKILL.md` or template) and prompts/references.
- Updates state machine transitions in `scoutspec` docs/templates (`ready` ──▶ `designing` ──▶ `implementing`).
- Enhances persistent project memory integration (`scoutspec/context.md`) for technical decisions.
