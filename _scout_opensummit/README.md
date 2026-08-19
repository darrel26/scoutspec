# Open Summit

Open Summit is a community-driven web platform for hikers to discover, join, and organize mountain hiking trips together.

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Running Tests
Run unit tests and end-to-end integration flow:
```bash
npm test
# or run with tsx runner across all test files
npx tsx --test tests/*.test.ts tests/e2e/*.test.ts
```

### Type Checking
```bash
npm run typecheck
```

### Development Server
```bash
npm run dev
```

---

## Core Features

- **Summit Discovery (`/src/modules/summits`)**: Peak search by elevation, difficulty class, spatial radius (haversine formula), GPX track download, and raster tile circuit breaker fallback.
- **Trip Expeditions (`/src/modules/trips`)**: Expedition creation, roster join requests, organizer approval queue, capacity limits, and time-bounded AES-256-GCM emergency contact encryption.
- **Real-Time Trip Chat (`/src/modules/chat`)**: Participant-restricted messaging and pinned announcement banners.
- **Hiker Profiles & Peak Logs (`/src/modules/profiles`)**: Experience attestation and summit achievement logging.
- **Community Hubs (`/src/modules/hubs`)**: Outdoor club creation, member joining, and shared club trip boards.

---

## Project Structure

```
.
├── src/
│   ├── app/api/v1/       # Next.js Route Handlers (REST endpoints)
│   ├── db/               # In-memory mock database & schema types
│   ├── modules/          # Core domain services & Server Actions
│   │   ├── summits/      # Peak discovery & GPX export
│   │   ├── trips/        # Expedition coordination & emergency contacts
│   │   ├── chat/         # Trip group chat & pinned announcements
│   │   ├── profiles/     # Hiker profiles & peak logging
│   │   └── hubs/         # Community hubs & club trip boards
│   └── types/            # TypeScript DTOs & API envelope definitions
├── scoutspec/            # Scoutspec product requirements, specs, & design docs
└── tests/                # Unit tests & E2E integration test suite
```

---

## Scoutspec Artifacts

Product requirement specs and architecture designs are stored in `scoutspec/requirements/open-summit/`:
- `proposal.md`: Problem statement, scope, capabilities.
- `design.md`: HLD topology, database schemas, API contracts, security model.
- `tasks.md`: 3-Phase task graph execution log.
- `specs/`: Capability delta specifications.
