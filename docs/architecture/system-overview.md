# Scoutspec Architecture Overview

## Design Principles
1. **Self-Contained Lifecycle**: Unifies PDLC (discovery & grilling) and SDLC (design, delta-specs, implementation, archiving) into one system.
2. **Persistent Compound Memory**: Eliminates amnesic cold-starts. Research builds on verified facts in `scoutspec/context.md`.
3. **Frontier-Based Ambiguity Resolution**: Resolves unknowns through prioritized, multi-round grilling loops rather than massive unorganized question lists.
4. **Living Spec Integrity**: Uses declarative `ADDED`, `MODIFIED`, and `REMOVED` delta blocks to prevent specification drift over time.

---

## State Machine Pipeline

```
[ researching ] ──▶ [ synthesizing ] ──▶ [ grilling ] ──▶ [ ready ] ──▶ [ designing ] ──▶ [ implementing ] ──▶ [ archived ]
```

| State | Responsible Agent / Action | Artifacts Produced / Updated |
|---|---|---|
| `researching` | 4 Parallel Subagents | `research/business-objectives.md`, `research/team-goals.md`, `research/competitor-analysis.md`, `research/customer-pain.md` |
| `synthesizing` | Aggregator | `synthesis.md`, updates `scoutspec/context.md` |
| `grilling` | Interactive Grilling Loop | `grilling.md` |
| `ready` | Proposal Generator (`/scout:product-requirement`) | `proposal.md`, initial `specs/<capability>/spec.md` |
| `designing` | 4 Technical Subagents & Grilling (`/scout:design`) | `design.md` (HLD+LLD), `design/`, refined delta `specs/` |
| `implementing` | Execution Engine | `tasks.md`, source code changes |
| `archived` | Spec Sync & Archive Engine | Merges delta specs to `scoutspec/specs/`, updates `scoutspec/context.md` & `scoutspec/index.yaml` |
