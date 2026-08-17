# Scoutspec Markdown Delta Spec & Sync Rules

## 1. Delta Spec Structure (`specs/<capability>/spec.md`)

Each requirement delta spec specifies behavioral changes using three normative markdown sections:

```markdown
## Purpose
<!-- 1-2 sentences on capability scope -->

## ADDED Requirements

### Requirement: <Requirement Name>
The system SHALL <normative behavior>.

#### Scenario: <Scenario Name>
- **WHEN** <trigger event/condition>
- **THEN** <expected system behavior>

## MODIFIED Requirements

### Requirement: <Existing Requirement Name Exact Match>
The system SHALL <updated behavior>.

#### Scenario: <Scenario Name>
- **WHEN** <trigger condition>
- **THEN** <updated expectation>

## REMOVED Requirements

### Requirement: <Deprecated Requirement Name>
**Reason**: <Why requirement is deprecated>
**Migration**: <How existing behavior or callers adapt>
```

## 2. Archive & Sync Algorithm (`/scout:archive`)

When a requirement is archived:
1. Locate target living spec in `scoutspec/specs/<capability>/spec.md`. If it does not exist, create it.
2. **Apply ADDED**: Append newly declared `### Requirement:` blocks to the living spec under corresponding capability.
3. **Apply MODIFIED**: Locate matching `### Requirement: <Name>` block in living spec and replace entire block with the modified definition.
4. **Apply REMOVED**: Delete matching `### Requirement: <Name>` block from living spec.
5. Update `scoutspec/index.yaml` setting requirement status to `archived`.
6. Append requirement summary to `scoutspec/context.md`.
