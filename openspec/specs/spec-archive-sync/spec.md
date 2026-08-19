## Purpose

Provides spec merging, context updates, and requirement archiving capabilities.

## Requirements

### Requirement: Spec Archive and Sync Engine
The system SHALL provide `/scout:archive` and `/scout:sync` skills to merge delta specs and update system context.

#### Scenario: Archiving requirement
- **WHEN** user invokes `/scout:archive` or `/scout:sync`
- **THEN** system merges change specs into `openspec/specs/`, updates `scoutspec/context.md`, and cleans up change files.
