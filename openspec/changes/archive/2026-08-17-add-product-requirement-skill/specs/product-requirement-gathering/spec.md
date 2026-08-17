## Purpose

Automates end-to-end product requirement discovery, persistent intelligence accumulation, frontier grilling, and lifecycle state management for Scoutspec.

## ADDED Requirements

### Requirement: Persistent Memory and State Initialization
The system SHALL maintain a global requirements registry `scoutspec/index.yaml`, a shared project intelligence file `scoutspec/context.md`, and a requirement metadata file `scoutspec/requirements/<slug>/meta.yaml`.

#### Scenario: First run initialization
- **WHEN** user executes `/scout:product-requirement <prompt>` and `scoutspec/context.md` or `scoutspec/index.yaml` does not exist
- **THEN** system initializes baseline `context.md` and `index.yaml`

#### Scenario: Lifecycle state transition
- **WHEN** requirement progresses through execution phases
- **THEN** system updates status in `meta.yaml` and `index.yaml` sequentially through (`researching` → `synthesizing` → `grilling` → `ready` → `designing` → `implementing` → `archived`)

### Requirement: Delta Research Fan-Out
The system SHALL execute 4 specialized research subagents in parallel that read `scoutspec/context.md` and only investigate information delta.

#### Scenario: Delta research execution
- **WHEN** requirement enters `researching` state
- **THEN** system dispatches 4 parallel agents (Business Objectives, Team Goals, Competitor Analysis, Customer Pain) with prompt input and current `context.md` content

#### Scenario: Research file persistence
- **WHEN** research agents finish execution
- **THEN** findings are written to individual markdown files in `scoutspec/requirements/<slug>/research/*.md`

### Requirement: Synthesis and Knowledge Backpropagation
The system SHALL merge parallel research outputs into `synthesis.md` and update persistent `scoutspec/context.md`.

#### Scenario: Synthesis and context update
- **WHEN** all 4 research agents complete
- **THEN** system compiles merged findings into `scoutspec/requirements/<slug>/synthesis.md` and appends newly verified domain facts into `scoutspec/context.md`

### Requirement: Frontier-Based Grilling Loop
The system SHALL maintain a dynamic question frontier, present iterative Q&A rounds, and persist all turns to `grilling.md`.

#### Scenario: Grilling round execution
- **WHEN** requirement enters `grilling` state
- **THEN** system serves 1 to 3 prioritized frontier questions per round and logs user answers into `scoutspec/requirements/<slug>/grilling.md`

#### Scenario: Frontier resolution exit
- **WHEN** critical unknowns are resolved or user inputs `done`/`finish`/`generate spec`
- **THEN** system sets status to `ready` and generates `scoutspec/requirements/<slug>/proposal.md`

### Requirement: Markdown Delta Specification Sync
The system SHALL format requirement specs using `ADDED`, `MODIFIED`, and `REMOVED` sections compatible with native living spec synchronization.

#### Scenario: Generating delta spec
- **WHEN** requirement specification is produced
- **THEN** delta spec is written to `scoutspec/requirements/<slug>/specs/<capability>/spec.md` with explicit change markers and scenario definitions
