## Purpose

Provides a multi-agent, adaptive technical design process (`/scout:design`) that generates HLD and LLD technical design documentation and refines capability delta specs.

## Requirements

### Requirement: Parallel Technical Research Fan-Out
The system SHALL spawn 4 specialized subagents (Architecture/Topology, Storage/Data Model, API/Interfaces, Security/Ops) to analyze technical trade-offs in parallel.

#### Scenario: Parallel agent execution
- **WHEN** `/scout:design` is invoked on a requirement with status `ready`
- **THEN** system spawns 4 parallel subagents and stores findings in research memory

### Requirement: Adaptive Technical Grilling
The system SHALL inspect existing project memory (`scoutspec/context.md`) and codebase files to dynamically generate delta-focused technical Q&A turns.

#### Scenario: Greenfield project grilling
- **WHEN** project context is empty or absent
- **THEN** grilling turn includes foundational stack choices (monorepo, topology, primary DB, API style)

#### Scenario: Brownfield project grilling
- **WHEN** project context already establishes stack and patterns
- **THEN** grilling turn inherits existing stack and only asks about delta feature trade-offs

### Requirement: Comprehensive Technical Design Output
The system SHALL write a complete Technical Design Document (`design.md`) containing HLD and LLD sections.

#### Scenario: Design artifact creation
- **WHEN** technical grilling completes or user overrides
- **THEN** system writes `design.md` covering system topology, DB schema, API definitions, operational readiness, and work sequence
