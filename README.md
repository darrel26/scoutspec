# Scoutspec

> Autonomous, spec-driven PDLC & SDLC intelligence harness for AI agents.

Scoutspec provides an end-to-end specification & implementation system featuring persistent multi-run memory, 4-agent parallel discovery, frontier-based ambiguity grilling, technical design generation, task DAG decomposition, worktree execution, and living delta-spec synchronization across 6 agent skills (`/scout:product-requirement`, `/scout:design`, `/scout:tasks`, `/scout:apply`, `/scout:archive`, `/scout:sync`).

---

## Quickstart & Installation

Initialize Scoutspec in your project with one command:

```bash
# Interactive setup (scaffolds scoutspec/ & injects agent skills)
npx scoutspec init

# Non-interactive / CI mode
npx scoutspec init -y --agents claude,opencode
```

Or install globally:

```bash
npm install -g scoutspec
scoutspec init
```

### What `init` Does

1. **Scaffolds Filesystem**:
   - `scoutspec/context.md`: Project brain & persistent knowledge base.
   - `scoutspec/index.yaml`: Requirement registry root.
   - `scoutspec/specs/`: Living capability specifications.
   - `scoutspec/requirements/`: Trace history for requirement runs.
2. **Seeds Knowledge**: Interactively captures initial business context, constraints, competitors, and personas (or skips with template).
3. **Injects Skills**: Copies all 6 scout skills (`product-requirement`, `design`, `tasks`, `apply`, `archive`, `sync`) into your selected agent directories (`.claude/skills/`, `.opencode/skills/`).

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
│   ├── scout-product-requirement/         # /scout:product-requirement skill
│   ├── scout-design/                      # /scout:design skill
│   ├── scout-tasks/                       # /scout:tasks skill
│   ├── scout-apply/                       # /scout:apply skill
│   ├── scout-archive/                     # /scout:archive skill
│   └── scout-sync/                        # /scout:sync skill
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
│           ├── design.md                  # HLD & LLD architecture design
│           ├── tasks.md                   # 3-Phase task DAG breakdown
│           └── specs/<capability>/spec.md # Delta specs (ADDED/MODIFIED/REMOVED)
│
└── openspec/                              # Meta-spec tracking for scoutspec development
    ├── config.yaml
    └── specs/
```

---

## Core Lifecycle Workflow

```
1. /scout:product-requirement <prompt>
  └── Reads context.md -> 4-Agent Research -> Synthesis -> Frontier Grilling -> proposal.md & Delta Specs

2. /scout:design <requirement-slug>
  └── Analyzes proposal & specs -> 4 Technical Research Agents -> Grilling -> HLD & LLD design.md

3. /scout:tasks <requirement-slug>
  └── Decomposes proposal.md & design.md -> Generates 3-Phase Task DAG (tasks.md)

4. /scout:apply <requirement-slug>
  └── Executes tasks.md across 3 phases (Foundation -> Parallel Worktrees -> Integration)

5. /scout:archive <requirement-slug> (or /scout:sync <requirement-slug>)
  └── Merges delta specs to openspec/specs/ -> Backpropagates memory to context.md -> Archives folder
```

---

## Agent Skills Reference

| Skill | Command | Description | Key Output Artifacts |
|---|---|---|---|
| **Product Requirement** | `/scout:product-requirement <prompt>` | Gathers requirements with 4 parallel research agents, grilling loop, and delta specs | `proposal.md`, `specs/` |
| **Technical Design** | `/scout:design <slug>` | Generates high-level & low-level architecture designs | `design.md` |
| **Task Breakdown** | `/scout:tasks <slug>` | Breaks down specs and design into a 3-Phase task graph | `tasks.md` |
| **Task Execution** | `/scout:apply <slug>` | Executes task graph sequentially & in parallel worktrees | Code updates, task checks |
| **Spec Archive** | `/scout:archive <slug>` | Merges delta specs into ground truth, updates context, archives run | `context.md`, `openspec/specs/` |
| **Spec Sync** | `/scout:sync <slug>` | Companion command for spec merge & persistent memory sync | `context.md`, `openspec/specs/` |

---

## Documentation Links

- [System Architecture](docs/architecture/system-overview.md)
- [Product Requirement Gathering Guide](docs/guides/product-requirement-gathering.md)
- [Metadata Schema Reference](docs/reference/meta-schema.md)
- [Grilling Framework](docs/reference/grilling-framework.md)
- [Delta Spec Rules](docs/reference/delta-spec-rules.md)
