# Technical Design Document: Open Summit

## 1. Executive Summary & Context

Open Summit is an open-source, community-driven web platform designed for mountain hikers, trip organizers, and outdoor clubs to discover peaks, organize summit expeditions, vet participants, and communicate in real time.

This Technical Design Document defines the end-to-end software architecture for the Open Summit MVP. The platform leverages a modern, open-source stack: Next.js App Router (TypeScript), PostgreSQL + PostGIS database with Drizzle ORM, Supabase Auth, and Supabase Realtime (self-hostable / free tier) for live trip chat, deployed on Vercel.

---

## 2. High-Level Design (HLD)

### 2.1 System Architecture Diagram

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

### 2.2 System Topology
- **Deployment Platform**: Vercel (Next.js App Router).
- **Compute Model**: Serverless Functions (Node.js runtime for API/SSR, Edge runtime where needed).
- **Data Tier**: Supabase / Neon PostgreSQL (Managed DB with PostGIS extension).
- **Authentication**: Supabase Auth (Native JWT + RLS).
- **Real-Time Messaging**: Supabase Realtime (WebSockets over open-source engine).
- **Storage**: Supabase Storage / S3 for GPX files and profile images.

---

## 3. Low-Level Design (LLD)

### 3.1 Data Model (Database Schema)

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Hiker Profiles
CREATE TABLE hiker_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  fitness_attestation TEXT,
  emergency_contact_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Summits
CREATE TABLE summits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  elevation_m INTEGER NOT NULL,
  difficulty_class TEXT NOT NULL, -- Class 1-5
  location GEOMETRY(Point, 4326) NOT NULL,
  gpx_track_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_summits_location ON summits USING GIST (location);

-- Trips
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES hiker_profiles(id) NOT NULL,
  summit_id UUID REFERENCES summits(id) NOT NULL,
  title TEXT NOT NULL,
  route_summary TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  capacity INTEGER NOT NULL,
  required_gear JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open', -- open, full, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_trips_start_status ON trips (start_time, status);
CREATE INDEX idx_trips_summit ON trips (summit_id);

-- Trip Participants (Roster)
CREATE TABLE trip_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  hiker_id UUID REFERENCES hiker_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, withdrawn
  experience_note TEXT,
  gear_confirmed BOOLEAN DEFAULT FALSE NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, hiker_id)
);
CREATE INDEX idx_participants_trip_status ON trip_participants (trip_id, status);

-- Trip Chat Messages
CREATE TABLE trip_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES hiker_profiles(id) NOT NULL,
  message_text TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chat_trip_time ON trip_chat_messages (trip_id, created_at DESC);

-- Hiker Summit Logs
CREATE TABLE hiker_summit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hiker_id UUID REFERENCES hiker_profiles(id) ON DELETE CASCADE NOT NULL,
  summit_id UUID REFERENCES summits(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Community Hubs
CREATE TABLE community_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES hiker_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Members
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES community_hubs(id) ON DELETE CASCADE NOT NULL,
  hiker_id UUID REFERENCES hiker_profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hub_id, hiker_id)
);

-- Community Trips
CREATE TABLE community_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES community_hubs(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(hub_id, trip_id)
);
```

### 3.2 Key API Endpoints & Server Actions

| Method / Type | Endpoint / Action | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/summits` | Public | Spatial radius & difficulty search for peaks |
| `GET` | `/api/v1/summits/[id]/gpx` | Public | Export route GPX track file |
| `GET` | `/api/v1/trips` | Public | List upcoming trips by summit or status |
| `GET` | `/api/v1/trips/[id]/emergency-contact` | Approved Attendees | Decrypt emergency contacts (active window only) |
| Action | `createTripAction` | Authenticated | Publish new summit expedition |
| Action | `requestJoinTripAction` | Authenticated | Submit roster join request + gear attestation |
| Action | `updateParticipantStatusAction` | Organizer / User | Approve/reject applicant or withdraw from roster |
| Action | `sendChatMessageAction` | Approved Attendees | Post message to native trip chat |
| Action | `pinChatMessageAction` | Organizer | Pin critical announcement banner in chat |
| Action | `logSummitAction` | Authenticated | Record completed peak summit on profile |
| Action | `createHubAction` | Authenticated | Create new outdoor club space |

---

## 4. Security & Operational Readiness

- **Auth & RLS**: Supabase Auth with PostgreSQL Row Level Security.
- **Emergency Contact Privacy**: Application-level AES-256-GCM encryption. Decryption key restricted to active trip window (`start_time - 24h` to `end_time + 12h`).
- **Rate Limiting**: `@upstash/ratelimit` on Auth (5/min), RSVPs (10/min), Chat (30/min), and Search (60/min).
- **Offline Fault Tolerance**: Client-side `IndexedDB` caching of active trip details + GPX track exports.
- **Circuit Breakers**: Fallback from MapTiler/Mapbox vector tiles to standard OpenStreetMap raster tiles on tile server failure.

---

## 5. Execution & Rollout Roadmap

1. **Sprint 1 (Foundation & Summit Discovery)**: Next.js scaffolding, Drizzle ORM setup, PostGIS summit search, MapLibre map integration.
2. **Sprint 2 (Trip Expedition & Roster Logistics)**: Expedition creation, RSVP flow, organizer approval queue, emergency contact encryption.
3. **Sprint 3 (Native Chat & Profiles)**: Supabase Realtime chat integration, pinned announcements, peak summit logging, community hubs.
4. **Sprint 4 (Hardening & Beta Launch)**: Rate limiting, offline IndexedDB cache, E2E testing, zero-downtime migration pipeline.
