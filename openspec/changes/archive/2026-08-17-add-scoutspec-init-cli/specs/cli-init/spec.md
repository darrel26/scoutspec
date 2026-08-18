## Purpose

Provides a standalone and npx-executable command-line interface to scaffold Scoutspec project directories, populate persistent knowledge context, and inject agent skills into target AI harnesses.

## ADDED Requirements

### Requirement: Interactive Project Initialization
The CLI SHALL provide an interactive `init` command that prompts the user for configuration options and scaffolds the Scoutspec repository structure in the current working directory.

#### Scenario: First-time interactive initialization
- **WHEN** user executes `scoutspec init` (or `npx scoutspec init`) in an uninitialized directory
- **THEN** system prompts for target AI harnesses (e.g. Claude Code, OpenCode)
- **THEN** system prompts whether to input initial business context interactively or use a blank template
- **THEN** system creates `scoutspec/context.md`, `scoutspec/index.yaml`, `scoutspec/specs/`, and `scoutspec/requirements/`
- **THEN** system injects `scout-product-requirement` skill into selected agent harness directories (e.g., `.claude/skills/` and/or `.opencode/skills/`)
- **THEN** system outputs a success message with instructions on running `/scout:product-requirement`

#### Scenario: Existing scoutspec folder conflict
- **WHEN** user executes `scoutspec init` in a directory containing an existing `scoutspec/` folder
- **THEN** system detects the conflict and prompts the user to overwrite, merge missing files, or abort
- **THEN** system respects the user's choice and does not silently clobber existing data

### Requirement: Non-Interactive Initialization
The CLI SHALL support headless and non-interactive initialization via command-line flags.

#### Scenario: Headless initialization with flags
- **WHEN** user executes `scoutspec init -y` or `scoutspec init --yes --agents claude,opencode`
- **THEN** system bypasses interactive prompts
- **THEN** system creates the default directory structure with default templates
- **THEN** system injects skills into specified agent harness directories (defaulting to all detected or supported harnesses if omitted)

### Requirement: Agent Skill Injection
The CLI SHALL inject skill definitions into designated agent directories according to selected harnesses.

#### Scenario: Injecting into Claude Code
- **WHEN** Claude Code is selected as target harness
- **THEN** system copies the complete `scout-product-requirement` skill bundle into `.claude/skills/scout-product-requirement/`

#### Scenario: Injecting into OpenCode
- **WHEN** OpenCode is selected as target harness
- **THEN** system copies the complete `scout-product-requirement` skill bundle into `.opencode/skills/scout-product-requirement/`
