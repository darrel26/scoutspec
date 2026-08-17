# Scoutspec

> Autonomous, spec-driven PDLC & SDLC intelligence harness for AI agents.

Scoutspec provides an end-to-end specification system featuring persistent multi-run memory, 4-agent parallel discovery, frontier-based ambiguity grilling, and living delta-spec synchronization.

---

## Repository Structure

```
scoutspec/
├── docs/                                  # Comprehensive documentation
│   ├── architecture/                      # System design, dataflow, state machine
│   │   └── system-overview.md
│   ├── guides/                            # How-to & workflow integration guides
│   │   └── product-requirement-gathering.md
│   └── reference/                         # Schemas, heuristics, and sync rules
│       ├── meta-schema.md
│       ├── grilling-framework.md
│       └── delta-spec-rules.md
│
├── skills/                                # Agent skill definitions & prompt bundles
│   └── scout-product-requirement/
│       ├── SKILL.md                       # Orchestrator & lifecycle state engine
│       ├── prompts/                       # Modular worker agent prompts
│       │   ├── business-objectives.md
│       │   ├── team-goals.md
│       │   ├── competitor-analysis.md     # WebSearch-enabled
│       │   └── customer-pain.md
│       └── references/                    # Skill-specific heuristics & schemas
│
├── scoutspec/                             # Runtime knowledge base & requirements store
│   ├── context.md                         # Persistent project brain (cross-run memory)
│   ├── index.yaml                         # Global requirement registry
│   ├── specs/                             # Ground-truth living capability specs
│   └── requirements/                      # Per-feature discovery runs & delta specs
│       └── <slug>/
│           ├── meta.yaml                  # State machine tracking
│           ├── research/*.md              # Parallel research findings
│           ├── synthesis.md               # Merged domain facts
│           ├── grilling.md                # Frontier Q&A audit trail
│           ├── proposal.md                # Validated requirement proposal
│           └── specs/<capability>/spec.md # Delta specs (ADDED/MODIFIED/REMOVED)
│
└── openspec/                              # Meta-spec tracking for scoutspec development
    ├── config.yaml
    └── specs/
```

---

## Core Workflow

```
/scout:product-requirement <prompt>
  │
  ├── 1. Read context.md (Persistent Memory)
  │
  ├── 2. Parallel Delta Fan-Out (4 Workers)
  │     ├── Business Objectives
  │     ├── Team Goals
  │     ├── Competitor Analysis (WebSearch)
  │     └── Customer Pain
  │
  ├── 3. Synthesis & Knowledge Backpropagation (Updates context.md)
  │
  ├── 4. Frontier Grilling Loop (Interactive Q&A logged to grilling.md)
  │
  └── 5. Produce proposal.md & Delta Specs (ADDED/MODIFIED/REMOVED)
```

---

## Documentation Links

- [System Architecture](docs/architecture/system-overview.md)
- [Product Requirement Gathering Guide](docs/guides/product-requirement-gathering.md)
- [Metadata Schema Reference](docs/reference/meta-schema.md)
- [Grilling Framework](docs/reference/grilling-framework.md)
- [Delta Spec Rules](docs/reference/delta-spec-rules.md)
