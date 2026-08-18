---
name: scout:product-requirement
description: Gather product requirements using 4 parallel delta-research agents, persistent project memory (context.md), frontier-based grilling, and OpenSpec-compatible delta specs.
---

# /scout:product-requirement

Discovers, refines, and formalizes product requirements into self-contained Scoutspec artifacts.

## Usage
`/scout:product-requirement <prompt>`

---

## Phase 1: Context & Metadata Initialization

1. **Verify Root Scaffolding**:
   - Ensure `scoutspec/context.md` exists (create base structure if missing).
   - Ensure `scoutspec/index.yaml` exists (create if missing).

2. **Scaffold Requirement Directory**:
   - Generate kebab-case `<slug>` from user prompt (e.g. `photographer-crm`).
   - Create directories:
     - `scoutspec/requirements/<slug>/`
     - `scoutspec/requirements/<slug>/research/`
     - `scoutspec/requirements/<slug>/specs/`
   - Write initial `scoutspec/requirements/<slug>/meta.yaml` with `status: "researching"`.
   - Update `scoutspec/index.yaml` to register the new requirement.

---

## Phase 2: Parallel Delta-Research Fan-Out

Read `scoutspec/context.md` to load existing project memory.

Spawn 4 worker subagents in parallel with the user prompt and `scoutspec/context.md` content:

1. **Business Objectives Agent**:
   - Prompt: `skills/scout-product-requirement/prompts/business-objectives.md`
   - Output: `scoutspec/requirements/<slug>/research/business-objectives.md`

2. **Team Goals Agent**:
   - Prompt: `skills/scout-product-requirement/prompts/team-goals.md`
   - Output: `scoutspec/requirements/<slug>/research/team-goals.md`

3. **Competitor Analysis Agent** (Tool: `WebSearch`, `WebFetch`):
   - Prompt: `skills/scout-product-requirement/prompts/competitor-analysis.md`
   - Output: `scoutspec/requirements/<slug>/research/competitor-analysis.md`

4. **Customer Pain & Workflows Agent**:
   - Prompt: `skills/scout-product-requirement/prompts/customer-pain.md`
   - Output: `scoutspec/requirements/<slug>/research/customer-pain.md`

---

## Phase 3: Synthesis & Knowledge Backpropagation

1. Update `meta.yaml` to `status: "synthesizing"`.
2. Synthesize findings from all 4 research files into `scoutspec/requirements/<slug>/synthesis.md`.
   - Reconcile overlaps and align business model, team constraints, competitor gaps, and user workflows.
3. **Update Persistent Memory (`scoutspec/context.md`)**:
   - Append newly confirmed facts (target audience, verified competitors, technical choices) into corresponding sections of `scoutspec/context.md`.
   - Prevent duplicated entries.

---

## Phase 4: Frontier-Based Grilling Loop

1. Update `meta.yaml` to `status: "grilling"`.
2. Extract all unknowns and ambiguities from research into an ordered Question Frontier:
   - **Tier 1 (Blocker)**: Business model, core user persona, primary differentiator.
   - **Tier 2 (Scope)**: Technical limits, MVP cut-line, integrations.
   - **Tier 3 (Polish)**: Future roadmap.
3. **Interactive Grilling Turns**:
   - Present 1-3 high-impact questions per turn with options.
   - Append questions and user responses to `scoutspec/requirements/<slug>/grilling.md`.
   - Update frontier queue in `meta.yaml`.
4. **Exit Grilling**:
   - Continue until Question Frontier is clean OR user inputs `done`/`finish`/`generate spec` OR maximum 3 rounds reached.

---

## Phase 5: Artifact & Proposal Generation

1. Update `meta.yaml` to `status: "ready"`.
2. Generate `scoutspec/requirements/<slug>/proposal.md`:
   - `## Why`: Clear problem statement and market motivation.
   - `## What Changes`: Scoped MVP feature set.
   - `## Capabilities`: New/Modified capabilities.
   - `## Impact`: Expected architecture and user impact.
3. Generate initial requirement delta spec `scoutspec/requirements/<slug>/specs/<capability>/spec.md` with `## Purpose` and `## ADDED Requirements` (`### Requirement:` and `#### Scenario:`).
4. Present completion summary to user with next command recommendation: `/scout:design`.
