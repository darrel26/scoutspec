# Task Breakdown Graph: Open Summit

## 1. Phase 1: Foundation & Contract Lock (Sequential)

- [x] 1.1 Lock Shared Types & DTO Contracts
  - **Inputs:** `design.md#33-typescript-dto-contracts`, `design/api.md`
  - **Allowed Scope:** `src/types/**`
  - **Expected Artifacts:** `src/types/index.ts`, `src/types/dtos.ts`
  - **Verification:** `npx tsc --noEmit`
  - **Spec Mapping:** `specs/summit-discovery/spec.md`, `specs/trip-coordination/spec.md`

- [x] 1.2 Database Schema & Drizzle ORM Setup
  - **Inputs:** `design.md#31-data-model-database-schema`, `design/storage.md`
  - **Allowed Scope:** `src/db/**`
  - **Expected Artifacts:** `src/db/schema.ts`, `src/db/index.ts`
  - **Verification:** `npx tsc --noEmit`
  - **Spec Mapping:** `specs/summit-discovery/spec.md`, `specs/trip-coordination/spec.md`

---

## 2. Phase 2: Parallel Implementation (Stateless & Worktree Isolated)

- [x] 2.1 Implement Summit Discovery & PostGIS Spatial Search `[mode: parallel]` `[isolation: worktree]`
  - **Inputs:** `src/types/dtos.ts`, `src/db/schema.ts`, `specs/summit-discovery/spec.md`
  - **Allowed Scope:** `src/modules/summits/**`, `src/app/api/v1/summits/**`
  - **Expected Artifacts:** `src/modules/summits/service.ts`, `src/modules/summits/actions.ts`, `src/app/api/v1/summits/route.ts`, `tests/summits.test.ts`
  - **Verification:** `npx tsx --test tests/summits.test.ts`
  - **Spec Mapping:** `specs/summit-discovery/spec.md#Requirement-Search-and-Filter-Summits`

- [x] 2.2 Implement Trip Expedition & Organizer Approval Queue `[mode: parallel]` `[isolation: worktree]`
  - **Inputs:** `src/types/dtos.ts`, `src/db/schema.ts`, `specs/trip-coordination/spec.md`
  - **Allowed Scope:** `src/modules/trips/**`, `src/app/api/v1/trips/**`
  - **Expected Artifacts:** `src/modules/trips/service.ts`, `src/modules/trips/emergency.ts`
  - **Verification:** `npx tsx --test tests/e2e/expedition-flow.test.ts`
  - **Spec Mapping:** `specs/trip-coordination/spec.md#Requirement-Expedition-Creation`, `specs/trip-coordination/spec.md#Requirement-Organizer-Approval-Queue`

- [x] 2.3 Implement Real-Time Trip Chat & Pinned Announcements `[mode: parallel]` `[isolation: worktree]`
  - **Inputs:** `src/types/dtos.ts`, `src/db/schema.ts`, `specs/trip-communication/spec.md`
  - **Allowed Scope:** `src/modules/chat/**`, `src/app/api/v1/trips/[id]/chat/**`
  - **Expected Artifacts:** `src/modules/chat/service.ts`
  - **Verification:** `npx tsx --test tests/e2e/expedition-flow.test.ts`
  - **Spec Mapping:** `specs/trip-communication/spec.md#Requirement-Native-Trip-Chat`, `specs/trip-communication/spec.md#Requirement-Pinned-Announcements`

- [x] 2.4 Implement Hiker Profile & Peak Summit Logging `[mode: parallel]` `[isolation: worktree]`
  - **Inputs:** `src/types/dtos.ts`, `src/db/schema.ts`, `specs/hiker-profile/spec.md`
  - **Allowed Scope:** `src/modules/profiles/**`, `src/app/api/v1/profiles/**`
  - **Expected Artifacts:** `src/modules/profiles/service.ts`, `src/modules/profiles/actions.ts`, `tests/profiles.test.ts`
  - **Verification:** `npx tsx --test tests/profiles.test.ts`
  - **Spec Mapping:** `specs/hiker-profile/spec.md#Requirement-Summit-Logging`

- [x] 2.5 Implement Community Hubs & Club Trip Boards `[mode: parallel]` `[isolation: worktree]`
  - **Inputs:** `src/types/dtos.ts`, `src/db/schema.ts`, `specs/community-hubs/spec.md`
  - **Allowed Scope:** `src/modules/hubs/**`, `src/app/api/v1/hubs/**`
  - **Expected Artifacts:** `src/modules/hubs/service.ts`, `src/modules/hubs/actions.ts`, `tests/hubs.test.ts`
  - **Verification:** `npx tsx --test tests/hubs.test.ts`
  - **Spec Mapping:** `specs/community-hubs/spec.md#Requirement-Community-Space-Creation`

---

## 3. Phase 3: Integration & Spec Verification Barrier (Sequential)

- [x] 3.1 Integration Route Wiring & E2E Verification
  - **Inputs:** All Phase 2 module outputs (`src/modules/**`)
  - **Allowed Scope:** `src/app/**`, `tests/e2e/**`
  - **Expected Artifacts:** `tests/e2e/expedition-flow.test.ts`
  - **Verification:** `npx tsx --test tests/e2e/expedition-flow.test.ts`
  - **Spec Mapping:** `proposal.md#capabilities`, `design.md#4-security--operational-readiness`
