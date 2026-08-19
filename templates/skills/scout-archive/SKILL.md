---
name: scout:archive
description: Merges requirement delta specs into master openspec/specs/, updates persistent memory context, and archives requirement folder.
---

# /scout:archive

Archives completed requirement deliverables and syncs specs to project root.

## Usage
`/scout:archive <requirement-slug>`

---

## Steps
1. Verify `tasks.md` is complete.
2. Merge requirement delta specs from `scoutspec/requirements/<slug>/specs/` into `openspec/specs/`.
3. Update `scoutspec/context.md` with new business/technical context discovered during implementation.
4. Move `scoutspec/requirements/<slug>/` to `scoutspec/archive/<slug>/`.
5. Update `meta.yaml` status to `archived`.
