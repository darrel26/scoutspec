## 1. Storage Schemas & Base Directory Structure

- [x] 1.1 Define directory scaffolding and schema template for `scoutspec/index.yaml` and `scoutspec/context.md`
- [x] 1.2 Define requirement folder layout `scoutspec/requirements/<slug>/` and `meta.yaml` lifecycle state transitions

## 2. Research Subagent Prompts & Delta Fan-Out

- [x] 2.1 Implement Business Objectives delta prompt `skills/scout-product-requirement/prompts/business-objectives.md`
- [x] 2.2 Implement Team Goals delta prompt `skills/scout-product-requirement/prompts/team-goals.md`
- [x] 2.3 Implement Competitor Analysis delta prompt with WebSearch `skills/scout-product-requirement/prompts/competitor-analysis.md`
- [x] 2.4 Implement Customer Pain delta prompt `skills/scout-product-requirement/prompts/customer-pain.md`
- [x] 2.5 Implement parallel dispatcher writing to `research/*.md`

## 3. Synthesis & Knowledge Backpropagation

- [x] 3.1 Implement synthesis logic generating `scoutspec/requirements/<slug>/synthesis.md`
- [x] 3.2 Implement `context.md` knowledge backpropagation and deduplication logic

## 4. Frontier-Based Grilling & Proposal Generation

- [x] 4.1 Implement dynamic question frontier extraction and risk-tier ranking
- [x] 4.2 Implement iterative multi-turn grilling loop logging to `grilling.md` with hybrid exit triggers
- [x] 4.3 Implement `proposal.md` generator upon reaching `ready` status

## 5. Native Markdown Delta Spec Mechanics & Archive Preparation

- [x] 5.1 Implement delta spec generator supporting `ADDED`, `MODIFIED`, `REMOVED` sections in `specs/<capability>/spec.md`
- [x] 5.2 Implement spec sync and archive parser rules

## 6. End-to-End Verification

- [x] 6.1 Run test scenario with sample prompt and verify full lifecycle (`researching` → `ready`)
- [x] 6.2 Verify generated files (`research/*.md`, `synthesis.md`, `grilling.md`, `proposal.md`, `specs/`) and `context.md` updates
