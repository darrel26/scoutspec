# Requirement Metadata Schema Reference

```yaml
slug: "<kebab-case-slug>"
title: "<short-title>"
prompt: "<raw-user-prompt>"
status: "researching" # researching | synthesizing | grilling | ready | designing | implementing | archived
created_at: "YYYY-MM-DDTHH:MM:SSZ"
updated_at: "YYYY-MM-DDTHH:MM:SSZ"
frontier:
  pending_questions: []
  resolved_questions: []
artifacts:
  research:
    business_objectives: "research/business-objectives.md"
    team_goals: "research/team-goals.md"
    competitor_analysis: "research/competitor-analysis.md"
    customer_pain: "research/customer-pain.md"
  synthesis: "synthesis.md"
  grilling: "grilling.md"
  proposal: "proposal.md"
  design: "design.md"
  specs: "specs/"
  tasks: "tasks.md"
```

## Lifecycle States
1. `researching`: Parallel 4-agent fan-out running.
2. `synthesizing`: Aggregating research into `synthesis.md` and back-propagating facts to `context.md`.
3. `grilling`: Interactive multi-round frontier Q&A logged to `grilling.md`.
4. `ready`: Grilling complete, `proposal.md` generated.
5. `designing`: Technical design & delta specs creation.
6. `implementing`: Applying tasks.
7. `archived`: Merged delta specs into living specs & updated `context.md`.
