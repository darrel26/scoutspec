# System Topology & Software Architecture: Open Summit

## 1. System Topology Options

### Option A: Serverless Full-Stack Monolith (Recommended)
- **Deployment Platform**: Vercel (Next.js App Router).
- **Compute Model**: Serverless Functions (Node.js runtime for API/SSR, Edge runtime where needed).
- **Data Tier**: Supabase / Neon PostgreSQL (Managed DB with PostGIS extension).
- **Authentication**: Managed Auth (Supabase Auth / Clerk).
- **Real-Time / Messaging**: Supabase Realtime (WebSockets over managed infrastructure) or Vercel AI SDK / SSE stream for chat.
- **Storage**: Supabase Storage / S3 for GPX files, user profile images, peak assets.
- **Fit for Team & Scope**: High efficiency for 1-3 full-stack engineers. Low operational overhead, zero server management, automatic scaling, unified TypeScript codebase.

### Option B: Microservices Architecture
- **Structure**: Independent services (Auth Service, Peak Service, Trip Service, Chat Service, Profile Service, Community Service).
- **Compute / Hosting**: Kubernetes (EKS/GKE) or ECS with API Gateway (Kong/AWS API Gateway).
- **Data Tier**: Multi-database setup (Dedicated Postgres instances per service).
- **Fit for Team & Scope**: Rejected. Massive operational overhead, deployment complexity, high infrastructure costs, and unnecessary network latency for a 1-3 engineer team building MVP.

### Option C: Traditional Stateful Container Monolith
- **Structure**: Single Node.js/Fastify or Django monolith in Docker containers.
- **Hosting**: AWS ECS / Fly.io / Render with custom WebSocket server.
- **Data Tier**: Self-hosted or managed PostgreSQL + PostGIS + Redis.
- **Fit for Team & Scope**: Rejected. Requires manual scaling, infrastructure maintenance, custom WebSocket connection management, and DevOps maintenance compared to Vercel + Supabase.

---

## 2. Codebase & Package Boundaries

### Codebase Structure (Next.js App Router Monorepo / Unified Project)

```
scoutspec/_scout_opensummit/
├── app/                        # Next.js App Router (Routes & Pages)
│   ├── (auth)/                 # Auth route group (sign-in, sign-up)
│   ├── (dashboard)/            # Authenticated user dashboard
│   ├── api/                    # API Routes (Route Handlers)
│   │   ├── summits/            # Peak search & detail endpoints
│   │   ├── trips/              # Expedition CRUD & roster endpoints
│   │   ├── chat/               # Chat & announcement endpoints
│   │   ├── profiles/           # Hiker profiles & summit logs
│   │   └── communities/        # Club & hub management endpoints
│   ├── summits/                # Peak catalog & summit detail pages
│   ├── trips/                  # Expedition pages & roster management
│   ├── profiles/               # Public profiles & summit history
│   ├── communities/            # Outdoor club hub pages
│   ├── layout.tsx              # Root layout & providers
│   └── page.tsx                # Landing page
├── components/                 # UI & Component Hierarchy
│   ├── ui/                     # Primitives (shadcn/ui, buttons, modals, inputs)
│   ├── map/                    # MapLibre GL JS integration & GPX viewers
│   ├── summits/                # Summit filters, elevation profiles, peak cards
│   ├── trips/                  # Trip creation forms, roster queues, gear checklists
│   ├── chat/                   # Real-time chat box, pinned announcement banner
│   ├── profiles/               # Experience badges, summit log timeline
│   └── communities/            # Club branding, community trip boards
├── lib/                        # Shared Utilities & Domain Logic
│   ├── db/                     # Kysely / Drizzle / Supabase DB client & PostGIS queries
│   ├── auth/                   # Auth helpers & RBAC session guards
│   ├── geo/                    # GeoJSON & GPX parsers/formatters
│   └── validations/            # Zod validation schemas
├── types/                      # TypeScript type definitions
└── public/                     # Static assets (markers, map icons)
```

### Component Hierarchy & Module Boundaries
- **Presentation Layer**: React Server Components (RSC) for initial page render + Client Components for interactive UI (MapLibre maps, live chat, interactive roster approval buttons).
- **API & Data Access Layer**: Server Actions and API Route Handlers. Data access mediated through typed queries (PostGIS spatial queries via SQL/Kysely/Supabase client).
- **Infrastructure Layer**: Supabase Auth (Identity), Supabase Realtime (WebSockets), Supabase Storage (GPX & Images).

---

## 3. Component Interactions & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (Browser)                                 |
| Next.js Client Components (MapLibre GL JS, Chat UI, Roster Queue, Forms)          |
+--------------------------+------------------------------+-------------------------+
                           |                              |
               HTTPS (REST / Server Actions)        WebSockets (Realtime)
                           |                              |
                           v                              v
+--------------------------------------------------+ +------------------------------+
|             VERCEL EDGE / SERVERLESS             | |       SUPABASE REALTIME      |
| Next.js API Routes & Server Actions              | | (Managed WebSocket Broker)  |
| - Authentication & RBAC Checks                   | +--------------+---------------+
| - Zod Payload Validation                         |                |
| - Business Logic Execution                       |                |
+--------------------------+-----------------------+                |
                           |                                        |
                   PostgreSQL Driver                                |
                           |                                        |
                           v                                        v
+-----------------------------------------------------------------------------------+
|                         SUPABASE / NEON POSTGRESQL DB                             |
| - Core Tables (users, summits, trips, trip_participants, messages, communities)   |
| - PostGIS Extension (ST_DWithin, ST_Distance, Spatial Indexing for Peaks/Routes)  |
| - Row Level Security (RLS) policies                                               |
+-----------------------------------------------------------------------------------+
```

### End-to-End Sequence Diagram (Trip Join Request & Native Chat Update)

```
Hiker (Client)               Serverless Gateway (Vercel)          Database (Supabase)        Organizer (Client)
      |                                  |                                 |                        |
      |--- 1. Submit Join Request ------>|                                 |                        |
      |    (POST /api/trips/123/join)   |                                 |                        |
      |                                  |--- 2. Auth & RBAC Check ------->|                        |
      |                                  |--- 3. Insert Participant (queue)|                        |
      |                                  |<-- 4. Roster Updated -----------|                        |
      |<-- 5. Request Pending HTTP 200 --|                                 |                        |
      |                                  |                                 |--- 6. Event Trigger -->|
      |                                  |                                 |   (Realtime WebSocket) |
      |                                  |                                 |    Roster Queue Update |
      |                                  |                                 |<-- 7. Approve Hiker --|
      |                                  |<-- 8. UPDATE status='approved' -|                        |
      |                                  |--- 9. Commit Transaction ------>|                        |
      |                                  |                                 |--- 10. Realtime Event->|
      |                                  |                                 |    (Status Approved)   |
      |<---------------------------------|---------------------------------|                        |
      |   (Roster updated via Realtime)  |                                 |                        |
```

---

## 4. Trade-off Analysis

| Architecture Dimension | Selected Strategy (Serverless Monolith) | Alternative Strategy A (Microservices) | Alternative Strategy B (Stateful Container Monolith) |
|---|---|---|---|
| **Development Velocity** | **High**: Single repo, unified TS types, seamless full-stack DX. | **Low**: Multi-repo/service overhead, RPC interfaces, contract maintenance. | **Medium**: Single repo, but requires server setup and Docker management. |
| **Operational Complexity** | **Very Low**: Fully managed (Vercel + Supabase). No server maintenance. | **Very High**: Kubernetes/ECS, API Gateways, service meshes, distributed logging. | **Moderate**: Requires server orchestration, manual OS updates, custom WebSocket handling. |
| **Cost Efficiency** | **High**: Pay-per-request serverless tier with generous free/low-cost tiers. | **Low**: Continuous baseline server compute cost across multiple microservices. | **Medium**: Fixed server costs regardless of traffic spikes. |
| **Scalability** | **High**: Automatic horizontal scaling on Vercel Edge/Serverless. DB scales vertically/read-replicas. | **Extreme**: Granular independent scaling per microservice. Overkill for MVP. | **Moderate**: Requires configuring Auto-scaling Groups (ASG) or container scaling. |
| **Geospatial & Search Performance** | **High**: PostGIS integrated directly in primary DB with spatial indexes (GIST). | **Complex**: Requires dedicated Geo-service or syncing spatial DB with core DBs. | **High**: PostGIS on single DB, but compute tied to application server performance. |
