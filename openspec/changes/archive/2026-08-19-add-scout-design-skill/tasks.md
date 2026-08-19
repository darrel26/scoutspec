## 1. Skill & Prompt Definitions

- [x] 1.1 Create `skills/scout-design/SKILL.md` defining the state machine transition (`ready` ──▶ `designing`), multi-agent fan-out, interactive grilling turns, and HLD+LLD generation rules.
- [x] 1.2 Create research prompts under `skills/scout-design/prompts/`: `topology-architecture.md`, `storage-datamodel.md`, `api-interfaces.md`, `security-ops.md`.
- [x] 1.3 Create reference docs under `skills/scout-design/references/`: `technical-tdd-template.md`, `technical-grilling-framework.md`.

## 2. Scoutspec Architecture & Template Sync

- [x] 2.1 Update `docs/architecture/system-overview.md` pipeline state machine to document `/scout:design`.
- [x] 2.2 Sync `skills/scout-design/` into `templates/skills/scout-design/`.
- [x] 2.3 Update CLI skill injection code in `src/core/inject-skills.ts` to include `scout-design`.

## 3. Verification & Validation

- [x] 3.1 Run `openspec validate --change add-scout-design-skill` to ensure change proposal compliance.
- [x] 3.2 Test CLI build `npm run build` and ensure skill templates resolve properly.
