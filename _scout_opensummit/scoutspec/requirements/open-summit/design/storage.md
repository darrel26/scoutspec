# Storage & Data Modeling Architecture

## 1. Data Store Selection
- **Primary Relational DB**: PostgreSQL + PostGIS extension (via Supabase or Neon). Handles structured summit data, geospatial queries (radius/distance to peak), relational integrity (trips, roster, profiles, hubs).
- **Realtime / Chat Engine**: Supabase Realtime (PostgreSQL Logical Replication / WebSockets) or Redis Pub/Sub + WebSockets. Store chat history in Postgres `trip_chat_messages`.

## 2. Schema & Entity Definitions

### `hiker_profiles`
- `id` (UUID, PK, FK -> `auth.users.id`)
- `full_name` (TEXT, NOT NULL)
- `avatar_url` (TEXT)
- `bio` (TEXT)
- `fitness_attestation` (TEXT)
- `emergency_contact_encrypted` (TEXT) -- accessible only during active approved trip window
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### `summits`
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL)
- `elevation_m` (INTEGER, NOT NULL)
- `difficulty_class` (TEXT, NOT NULL) -- Class 1-5
- `location` (GEOMETRY(Point, 4326), NOT NULL) -- PostGIS Point (lon, lat)
- `gpx_track_url` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### `trips`
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `organizer_id` (UUID, FK -> `hiker_profiles.id`, NOT NULL)
- `summit_id` (UUID, FK -> `summits.id`, NOT NULL)
- `title` (TEXT, NOT NULL)
- `route_summary` (TEXT)
- `start_time` (TIMESTAMPTZ, NOT NULL)
- `end_time` (TIMESTAMPTZ)
- `capacity` (INTEGER, NOT NULL)
- `required_gear` (JSONB, DEFAULT '[]'::jsonb)
- `status` (TEXT, NOT NULL, DEFAULT 'open') -- open, full, completed, cancelled
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### `trip_participants` (Roster)
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `trip_id` (UUID, FK -> `trips.id` ON DELETE CASCADE, NOT NULL)
- `hiker_id` (UUID, FK -> `hiker_profiles.id` ON DELETE CASCADE, NOT NULL)
- `status` (TEXT, NOT NULL, DEFAULT 'pending') -- pending, approved, rejected, withdrawn
- `experience_note` (TEXT)
- `gear_confirmed` (BOOLEAN, DEFAULT FALSE, NOT NULL)
- `requested_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- **Constraint**: UNIQUE (`trip_id`, `hiker_id`)

### `trip_chat_messages`
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `trip_id` (UUID, FK -> `trips.id` ON DELETE CASCADE, NOT NULL)
- `sender_id` (UUID, FK -> `hiker_profiles.id`, NOT NULL)
- `message_text` (TEXT, NOT NULL)
- `is_pinned` (BOOLEAN, DEFAULT FALSE, NOT NULL)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### `hiker_summit_logs`
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `hiker_id` (UUID, FK -> `hiker_profiles.id` ON DELETE CASCADE, NOT NULL)
- `summit_id` (UUID, FK -> `summits.id` ON DELETE CASCADE, NOT NULL)
- `trip_id` (UUID, FK -> `trips.id` ON DELETE SET NULL)
- `logged_at` (TIMESTAMPTZ, DEFAULT NOW())
- `notes` (TEXT)

### `community_hubs`
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL)
- `slug` (TEXT, UNIQUE, NOT NULL)
- `description` (TEXT)
- `owner_id` (UUID, FK -> `hiker_profiles.id`, NOT NULL)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### `community_members`
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `hub_id` (UUID, FK -> `community_hubs.id` ON DELETE CASCADE, NOT NULL)
- `hiker_id` (UUID, FK -> `hiker_profiles.id` ON DELETE CASCADE, NOT NULL)
- `role` (TEXT, NOT NULL, DEFAULT 'member') -- owner, admin, member
- `joined_at` (TIMESTAMPTZ, DEFAULT NOW())
- **Constraint**: UNIQUE (`hub_id`, `hiker_id`)

### `community_trips`
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `hub_id` (UUID, FK -> `community_hubs.id` ON DELETE CASCADE, NOT NULL)
- `trip_id` (UUID, FK -> `trips.id` ON DELETE CASCADE, NOT NULL)
- **Constraint**: UNIQUE (`hub_id`, `trip_id`)

### Indices & Performance
- `idx_summits_location`: Spatial GIST index on `summits(location)`.
- `idx_trips_start_status`: Composite index on `trips(start_time, status)`.
- `idx_trips_summit`: Index on `trips(summit_id)`.
- `idx_chat_trip_time`: Composite time-series index on `trip_chat_messages(trip_id, created_at DESC)`.
- `idx_participants_trip_status`: Composite index on `trip_participants(trip_id, status)`.

## 3. Migration & Compatibility Strategy
- **ORM / Schema Tool**: Drizzle ORM. Zero-overhead, type-safe SQL, fast cold starts on Vercel Serverless.
- **Migration Workflow**: Declarative schema in `src/db/schema.ts`. `drizzle-kit generate` produces SQL migration scripts. Execute via `drizzle-kit migrate` in CI/CD pipeline before app deployment.

## 4. Caching & Data Integrity
- **Next.js Data Cache (`unstable_cache` / Tagged revalidation)**:
  - Summit metadata catalog: TTL 24 hours. Tag: `summits`.
  - Public Community Hub profiles: TTL 1 hour. Tag: `hubs`.
- **Dynamic / Non-cached**:
  - Active trip roster status, pending approval queue, real-time chat.
- **Cache Invalidation**:
  - `revalidateTag('summits')` on peak data updates.
  - `revalidateTag('hubs')` on club profile updates.
- **Data Integrity**:
  - Foreign keys enforce cascade deletes on membership/participants.
  - Unique constraints prevent duplicate roster requests and hub memberships.
