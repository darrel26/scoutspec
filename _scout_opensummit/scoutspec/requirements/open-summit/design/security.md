# Security, Operational Readiness & Resilience Specification

## 1. Auth & Security Model

### Auth Solution
- **Provider**: Supabase Auth (Native JWT, direct integration with PostgreSQL Row Level Security).
- **Reason**: Single DB/Auth ecosystem eliminates token synchronization overhead for 1-3 dev team.
- **Session Handling**: HttpOnly, Secure, SameSite=Lax cookies managed via Next.js Server Components (`@supabase/ssr`).

### RBAC Matrix
Row Level Security (RLS) policies enforce data isolation directly in PostgreSQL.

| Role | Summit Catalog | Public Trip Info | Approved Roster & Chat | Emergency Contacts | System Admin |
| --- | --- | --- | --- | --- | --- |
| **Guest / Public** | Read | Read | None | None | None |
| **Participant (Seeker)** | Read | Read | Read/Write (if approved) | Self Only (Write) | None |
| **Trip Lead** | Read | Read/Write (own trip) | Read/Write (own trip) | Read (Active Trip Window) | None |
| **Admin** | Read/Write | Read/Write | Read/Write | Audit Access | Full Access |

### Sensitive Data Encryption (Emergency Contacts)
- **Data**: Contact Name, Phone Number, Medical/Allergy Notes.
- **Mechanism**: Application-level AES-256-GCM encryption using `crypto` module with key `EMERGENCY_CONTACT_ENC_KEY` prior to DB insertion. DB stores `encrypted_payload` and `iv`.
- **Time-Bounded Access Window**:
  - RLS / API logic checks `trip_start_time - 24h` <= `NOW()` <= `trip_end_time + 12h`.
  - Outside window: Decryption key denied; data remains inaccessible to Trip Lead.
  - User can view/edit own contact data anytime.

---

## 2. Operational Readiness

### Logging
- **Format**: Structured JSON logs using `pino` logger.
- **Drain**: Standard Vercel Log Drains forwarded to Axiom or Datadog.
- **PII Protection**: Automatic redaction middleware masks fields: `emergency_contact`, `phone`, `password`, `token`, `email`.

### Metrics & Observability
- **Platform**: Vercel Analytics + Speed Insights (Core Web Vitals).
- **Database**: Supabase Dashboard / Neon Insights (Active connections, query duration, p95 latency, cache hit ratio).
- **Alert Triggers**:
  - HTTP 5xx error rate > 2% over 5-minute window.
  - Database pool exhaustion (> 80% connections utilized).
  - Rate-limit breach spikes (> 100 blocks/min).

### Rate Limiting Rules
Implemented via `@upstash/ratelimit` on Vercel Edge Middleware / Next.js API Routes.

| Endpoint / Action | Limit | Window | Identification | Action on Exceed |
| --- | --- | --- | --- | --- |
| **Auth (`/api/auth/*`)** | 5 req | 1 min | IP Address | HTTP 429 + Retry-After header |
| **Join Requests / RSVP** | 10 req | 1 min | User ID / IP | HTTP 429 |
| **Trip Chat Messages** | 30 req | 1 min | User ID | HTTP 429 |
| **Geocoding / Search API** | 60 req | 1 min | IP Address | HTTP 429 |

---

## 3. Resilience & Fault Tolerance

### Offline Fallback Handling
- **Client Cache**: Cache active trip data (meeting point, route description, approved roster summary, emergency instructions) in `IndexedDB` via `idb-keyval` upon joining or viewing trip details.
- **GPX Export**: Native client-side blob download of route GPX files for offline navigation in third-party mobile GIS apps (Gaia GPS, Organic Maps, OsmAnd).
- **UI State**: Offline banner component detects `navigator.onLine === false` and serves cached read-only trip data.

### Circuit Breakers (Map & Geocoding Services)
- **External Dependencies**: MapTiler / Mapbox vector tiles, Nominatim / Mapbox Geocoding.
- **Fallback Strategy**:
  - **Tile Fetch**: 3-second timeout (`AbortController`). On failure or HTTP 5xx, switch map engine layer to public OpenStreetMap raster tile fallback (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
  - **Geocoding**: 3-second timeout. On failure, gracefully degrade to manual coordinate input / local DB summit name search.
  - **State Storage**: In-memory circuit breaker flag (Closed -> Open on 3 consecutive failures; half-open retry after 60s).

---

## 4. Deployment & Rollout Sequence

### Feature Flags
- **Implementation**: Lightweight Vercel Edge Config or environment variables (`process.env.NEXT_PUBLIC_ENABLE_FEATURE_*`).
- **Flags**:
  - `ENABLE_COMMUNITY_HUBS`: Default `false` on initial MVP deploy.
  - `ENABLE_NATIVE_CHAT`: Toggles trip chat system.
  - `ENABLE_EMERGENCY_CONTACTS`: Controls safety contact collection and decryption flow.

### Database Migration Safety
- **Strategy**: Expand-Contract (Zero-Downtime Migration Pattern).
  1. **Expand**: Add new columns/tables as `NULLABLE` or with default values. Never drop or rename active columns in a single release.
  2. **Code Deploy**: Deploy application code supporting both old and new schema variants.
  3. **Backfill**: Execute background data backfill script if required.
  4. **Contract**: Remove old columns/tables in subsequent release after verification.
- **Safety Checks**:
  - Index creation via `CREATE INDEX CONCURRENTLY` to prevent table lockup.
  - Run `supabase db lint` and migration dry-runs in CI pipeline before staging/production deployment.
