---
name: scout:sync
description: Alias/companion command for spec archiving and persistent memory sync.
---

# /scout:sync

Performs spec synchronization and context memory refresh.

## Usage
`/scout:sync <requirement-slug>`

---

## Steps
1. Execute spec merge from `scoutspec/requirements/<slug>/specs/` to main `openspec/specs/`.
2. Sync system memory state in `scoutspec/context.md`.
