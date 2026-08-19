---
name: scout:design
description: Converts product requirements into technical architecture & design documents (HLD + LLD) using 4 parallel technical research agents, context-aware grilling, and OpenSpec delta specs.
---

# /scout:design

Converts product requirements into comprehensive technical architecture and low-level system designs.

## Usage
`/scout:design <requirement-slug>`

---

## Phase 1: Context & State Initialization

1. **Verify Requirement**:
   - Check `scoutspec/requirements/<slug>/meta.yaml` exists.
   - Verify status is `ready` (or update from `ready` to `designing`).
   - Create directories:
     - `scoutspec/requirements/<slug>/design/`
     - `scoutspec/requirements/<slug>/specs/`

2. **Load Inputs**:
   - Read `scoutspec/requirements/<slug>/proposal.md`
   - Read existing `scoutspec/requirements/<slug>/specs/`
   - Read global project memory `scoutspec/context.md`

---

## Phase 2: Parallel Technical Research Fan-Out

Spawn 4 technical subagents in parallel using context & proposal:

1. **Topology & Architecture Agent**:
   - Prompt: `skills/scout-design/prompts/topology-architecture.md`
   - Output: `scoutspec/requirements/<slug>/design/topology.md`

2. **Storage & Data Model Agent**:
   - Prompt: `skills/scout-design/prompts/storage-datamodel.md`
   - Output: `scoutspec/requirements/<slug>/design/storage.md`

3. **API & Interfaces Agent**:
   - Prompt: `skills/scout-design/prompts/api-interfaces.md`
   - Output: `scoutspec/requirements/<slug>/design/api.md`

4. **Security & Operations Agent**:
   - Prompt: `skills/scout-design/prompts/security-ops.md`
   - Output: `scoutspec/requirements/<slug>/design/security.md`

---

## Phase 3: Context-Aware Technical Grilling Loop

1. Inspect `scoutspec/context.md` to identify known vs unknown technical stack choices (Greenfield vs Brownfield).
2. Construct **Technical Question Frontier**:
   - Greenfield: Ask foundational questions (Monorepo, DB, API paradigm, Auth).
   - Brownfield: Inherit established stack, ask only feature-specific delta trade-offs (Schema extensions, route wiring, rate limits).
3. Conduct 1-3 interactive grilling turns. Store Q&A in `scoutspec/requirements/<slug>/design/technical-grilling.md`.
4. Update `scoutspec/context.md` with newly confirmed technical choices under `## Team & Technical Constraints`.

---

## Phase 4: Technical Design Document (TDD) & Spec Refinement

1. Write `scoutspec/requirements/<slug>/design.md` using `technical-tdd-template.md`:
   - Metadata & Context
   - High-Level Design (HLD): Architecture diagrams, data flow, operational readiness.
   - Low-Level Design (LLD): DB schemas, API endpoints, types, algorithms.
   - Execution & Rollout: Work sequence (S/M/L/XL sizing), migration steps.
2. Refine delta specs in `scoutspec/requirements/<slug>/specs/<capability>/spec.md`:
   - Add/update `### Requirement:` and `#### Scenario:` blocks based on technical constraints.
3. Update `meta.yaml` to `status: "designing"` (or complete).
4. Present summary to user with next command: `/scout:impl`.
