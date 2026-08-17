## Why

Software development lacks a unified, self-contained PDLC and SDLC system with persistent project memory. Teams typically run isolated, amnesic requirement discovery sessions that ignore previous research and require disjointed external tools. Scoutspec provides a standalone spec-driven workflow harness that owns the full lifecycle end to end—from parallel multi-agent discovery and frontier-based grilling to delta spec synchronization and archiving—accumulating project intelligence across every requirement run.

## What Changes

- Establish standalone Scoutspec filesystem architecture (`scoutspec/context.md`, `scoutspec/index.yaml`, `scoutspec/specs/`, `scoutspec/requirements/<slug>/`).
- Add `/scout:product-requirement` skill with lifecycle state machine tracked via `index.yaml` and per-requirement `meta.yaml` (`researching` → `synthesizing` → `grilling` → `ready` → `designing` → `implementing` → `archived`).
- Implement persistent memory integration: 4 parallel delta-research agents (Business Objectives, Team Goals, Competitor Analysis with live search, Customer Pain) read `scoutspec/context.md` to investigate only new gaps.
- Store raw findings in `scoutspec/requirements/<slug>/research/*.md`.
- Implement synthesis step that writes `synthesis.md` and back-propagates discovered project facts into `scoutspec/context.md`.
- Implement multi-turn frontier-based grilling loop logging full Q&A audit trail to `grilling.md` with hybrid exit triggers.
- Generate finalized `proposal.md` within requirement directory to drive native Scoutspec SDLC stages (`design.md`, delta `specs/`, `tasks.md`, apply, archive).
- Adopt Option 1 Markdown delta spec mechanics (`ADDED`, `MODIFIED`, `REMOVED`) for merging requirement deltas into living `scoutspec/specs/` during archive.

## Capabilities

### New Capabilities
- `product-requirement-gathering`: Multi-agent delta research, persistent project memory synchronization, frontier grilling, and lifecycle state tracking under `/scout:product-requirement`.

### Modified Capabilities
*(None)*

## Impact

- Creates `skills/scout-product-requirement/` skill directory with subagent prompt templates and orchestrator.
- Defines core `scoutspec/` storage conventions and metadata schemas (`index.yaml`, `meta.yaml`, `context.md`).
- Operates independently without requiring external OpenSpec CLI runtime.
