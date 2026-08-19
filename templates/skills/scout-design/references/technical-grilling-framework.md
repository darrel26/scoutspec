# Technical Question Frontier & Grilling Framework

## 1. Adaptive Context Inspection
Before grilling, inspect `scoutspec/context.md` + root configuration files (`package.json`, DB configs).

- **Greenfield Mode**: Context is missing or empty. Ask foundational questions (Topology, DB, API paradigm, Auth).
- **Brownfield Mode**: Context already establishes stack. Skip foundational choices and ask only delta feature trade-offs (Schema changes, route wiring, rate limits).

## 2. Technical Risk Tiers

- **Tier 1: Architectural & System Foundations (Must-Ask)**
  - Monolith vs Microservices vs Serverless topology.
  - Monorepo package structure.
  - Core stack (Language, Framework, Primary Database).

- **Tier 2: Data & Interface Contracts (Should-Ask)**
  - API Paradigm (REST vs GraphQL vs gRPC).
  - Schema extension strategy (New table vs JSONB vs column add).
  - Auth model (JWT vs Session vs OAuth2).

- **Tier 3: Operations & Scale (May-Ask)**
  - Rate limiting / Caching layer (Redis / In-memory).
  - Observability & Deployment sequence.

## 3. Interactive Grilling Format

```markdown
### Technical Grilling (Turn X/3)

1. **[Question Title]**
   - **Context**: Technical impact on system or maintenance.
   - **Options**:
     - A: Option 1 description
     - B: Option 2 description
     - C: Custom answer

*(Reply choice, specify details, or type `done`/`skip` to use context.md defaults.)*
```
