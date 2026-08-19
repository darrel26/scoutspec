---
name: scout:tasks
description: Decomposes product requirements and technical designs into a 3-Phase stateless task breakdown graph with contract locking and git-worktree isolation.
---

# /scout:tasks

Converts product requirements (`proposal.md`), low-level architecture (`design.md`), and delta specs (`specs/`) into a structured, 3-Phase stateless task breakdown graph (`tasks.md`).

## Usage
`/scout:tasks <requirement-slug>`

---

## Phase 1: Context & Requirement Verification

1. **Verify Inputs**:
   - Read `scoutspec/requirements/<slug>/proposal.md`
   - Read `scoutspec/requirements/<slug>/design.md`
   - Read `scoutspec/requirements/<slug>/specs/`

2. **Pre-Flight Baseline Audit**:
   - Audit target environment dependencies (`package.json`, styling packages, global entrypoints, framework configs).
   - If runtime baseline packages or configs are missing, auto-create Phase 1 **Task 0: Pre-Flight Baseline Setup**.

3. **Verify Design Completion**:
   - Ensure `design.md` has no unresolved open questions.

---

## Phase 2: 3-Phase Task Graph Generation

Decompose the design into a strict 3-Phase DAG:

### 1. Phase 1: Foundation & Contract Lock (Sequential)
- Task 0 (if baseline missing) & Shared interfaces, TypeScript types, DB schemas, API contracts.
- Must complete before any Phase 2 task starts.

### 2. Phase 2: Parallel Implementation (Stateless & Isolated)
- Independent feature modules divided into strict non-overlapping file scopes.
- Target & Route Audit: Cross-reference design spec triggers (UI links, API endpoints, CLI flags) against task list. Every entrypoint MUST map 1:1 to an implementation task.
- Every task includes explicit metadata payload:
  - `Inputs`: Required interface/type files.
  - `Allowed Scope`: Directory pattern restricted to this task (e.g. `src/storage/**`).
  - `Execution Mode`: `[mode: parallel]` `[isolation: worktree]`.
  - `Expected Artifacts`: Target files and unit tests.
  - `Verification`: Runnable command (`npm test ...`).
  - `Spec Mapping`: Pointer to requirement in `specs/`.

### 3. Phase 3: Integration & Spec Verification Barrier (Sequential)
- Worktree merge, API route wiring, cross-module integration tests, and OpenSpec spec validation.

---

## Phase 3: Artifact Writing

1. Write `scoutspec/requirements/<slug>/tasks.md` using `templates/skills/scout-tasks/tasks-template.md`.
2. Update `meta.yaml` status to `tasks-ready`.
3. Present task breakdown summary and next command `/opsx:apply`.
