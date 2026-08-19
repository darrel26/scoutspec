# Technical Design Document (TDD) Template

## Metadata & Context
- **Requirement**: `<slug>`
- **Status**: `designing`
- **Author**: AI + Technical Lead
- **Target Scope**: `<scope summary>`
- **Related Proposal**: `proposal.md`

---

## 1. High-Level Design (HLD)

### 1.1 System Architecture & Topology
- Monorepo / Package structure
- Component boundaries & interaction sequence diagram (ASCII)

### 1.2 Cross-Cutting Concerns
- Authentication & Authorization boundaries
- Security policies & input validation

### 1.3 Operational Readiness & Resilience
- Metrics & logging strategy
- Throttling, rate limiting, error tracking

---

## 2. Low-Level Design (LLD)

### 2.1 Data Models & Database Schemas
- Entity tables, fields, types, foreign keys
- Indices & migration scripts

### 2.2 API & Interface Definitions
- Endpoints, methods, route paths
- Request/Response JSON payloads & TypeScript DTOs
- Error codes & HTTP statuses

### 2.3 Component Mechanics & Algorithmic Logic
- Core business logic flow
- Internal state transitions & edge cases

---

## 3. Execution & Rollout Strategy

### 3.1 Work Breakdown & Sequence
- Sequenced implementation tasks with T-shirt sizing (S / M / L / XL)

### 3.2 Deployment & Migration Sequence
- Step-by-step rollout plan & rollback triggers

### 3.3 Alternatives Considered & Trade-Offs
- Summary of rejected options and reasoning
