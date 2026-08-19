## Why

`README.md` only documents initial CLI setup (`init`) and product requirement gathering (`/scout:product-requirement`). Recent developments added full SDLC support with skills for technical design (`/scout:design`), task breakdown (`/scout:tasks`), implementation/apply (`/scout:apply`), spec archiving (`/scout:archive`), and living spec synchronization (`/scout:sync`). README needs updating to accurately reflect all capabilities.

## What Changes

- Update README title section/features summary to include all 6 lifecycle capabilities (`product-requirement`, `design`, `tasks`, `apply`, `archive`, `sync`).
- Update `init` documentation to note injection of all available scout skills into agent skill directories.
- Update repository structure diagram and documentation to include all 6 skills.
- Add workflow/usage documentation sections for technical design, task breakdown, implementation execution, spec archiving, and spec sync.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None. (Documentation update only; `skip_specs: true` set in `.openspec.yaml`).

## Impact

- `README.md`: Updated to cover full suite of scoutspec skills and workflows.
- Developer onboarding: Gives accurate and complete overview of CLI & agent capabilities.
