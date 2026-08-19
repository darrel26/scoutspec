# API & Interface Design Architecture

## 1. Interface Paradigm

Open Summit uses a hybrid API architecture optimized for Next.js full-stack execution, type safety, low latency, and real-time trip coordination.

- **Next.js Server Actions**: Used for state mutations requiring high UI integration and server validation (trip creation, join requests, roster approvals, profile updates, summit logging, and hub actions). Provides direct end-to-end TypeScript safety and automatic page revalidation.
- **Next.js Route Handlers (REST)**: Used for public data fetching, spatial query discovery (PostGIS peak searches), GPX file exports, and role-gated emergency contact retrieval.
- **WebSockets / Supabase Realtime**: Used for real-time trip chat communication and instant broadcast of pinned announcements.

---

## 2. Endpoint & Server Action Specifications

### 2.1 Summit Discovery Catalog

#### `GET /api/v1/summits`
Search and filter peaks using spatial and metadata parameters.

- **Query Parameters**:
  - `q` (string, optional): Text search query for peak name.
  - `min_elevation` (number, optional): Minimum elevation in meters.
  - `max_elevation` (number, optional): Maximum elevation in meters.
  - `difficulty` (string, optional): Difficulty class filter (`Class 1`, `Class 2`, `Class 3`, `Class 4`, `Class 5`).
  - `near_lat` (number, optional): Latitude for spatial radius search.
  - `near_lng` (number, optional): Longitude for spatial radius search.
  - `radius_km` (number, optional, default: 50): Search radius in kilometers around (`near_lat`, `near_lng`).
  - `limit` (number, optional, default: 20, max: 100): Pagination limit.
  - `offset` (number, optional, default: 0): Pagination offset.
- **Response**: `200 OK` -> `ApiEnvelope<SummitDTO[]>`

#### `GET /api/v1/summits/[id]`
Get detailed metadata for a single summit.

- **Parameters**: `id` (UUID)
- **Response**: `200 OK` -> `ApiEnvelope<SummitDTO>` | `404 Not Found`

#### `GET /api/v1/summits/[id]/gpx`
Export GPX track file for a summit.

- **Parameters**: `id` (UUID)
- **Response**: `200 OK` -> File download (`application/gpx+xml`) | `404 Not Found`

---

### 2.2 Trip Expedition Management & Roster

#### `GET /api/v1/trips`
List upcoming trips with optional filters.

- **Query Parameters**:
  - `summit_id` (UUID, optional): Filter trips by peak.
  - `status` (string, optional): `open`, `full`, `completed`, `cancelled`.
  - `start_after` (ISO 8601 string, optional): Filter trips starting after date.
  - `start_before` (ISO 8601 string, optional): Filter trips starting before date.
  - `hub_id` (UUID, optional): Filter trips hosted by a community hub.
  - `limit` (number, optional, default: 20).
  - `offset` (number, optional, default: 0).
- **Response**: `200 OK` -> `ApiEnvelope<TripSummaryDTO[]>`

#### `GET /api/v1/trips/[id]`
Get trip details including route summary, gear requirements, and participant roster.

- **Parameters**: `id` (UUID)
- **Response**: `200 OK` -> `ApiEnvelope<TripDetailDTO>` | `404 Not Found`

#### `GET /api/v1/trips/[id]/emergency-contact`
Retrieve encrypted emergency contacts for approved trip participants. Access restricted strictly to trip organizer or approved attendees during active trip window (start_time - 12h to end_time + 12h).

- **Parameters**: `id` (UUID)
- **Headers**: Authorization session token.
- **Response**: `200 OK` -> `ApiEnvelope<EmergencyContactDTO[]>` | `403 Forbidden`

#### Server Action: `createTripAction(input: CreateTripInput)`
Create a new expedition.

- **Access**: Authenticated users.
- **Response**: `Promise<ActionResult<TripDTO>>`

#### Server Action: `requestJoinTripAction(input: JoinTripInput)`
Submit a join request for a trip roster with experience note and gear confirmation.

- **Access**: Authenticated users.
- **Validation**: Gear confirmation must be `true`; user cannot double-request.
- **Response**: `Promise<ActionResult<TripParticipantDTO>>`

#### Server Action: `updateParticipantStatusAction(input: UpdateParticipantStatusInput)`
Approve, reject, or withdraw a participant.

- **Access**: Trip organizer (for approve/reject) or attendee (for withdraw).
- **Response**: `Promise<ActionResult<TripParticipantDTO>>`

---

### 2.3 Realtime Trip Communication

#### `GET /api/v1/trips/[id]/chat`
Fetch historic chat messages and pinned announcements for a trip.

- **Parameters**: `id` (UUID)
- **Query Parameters**: `before_id` (UUID, optional), `limit` (number, default: 50).
- **Access**: Approved trip participants & trip organizer.
- **Response**: `200 OK` -> `ApiEnvelope<ChatMessageDTO[]>`

#### Server Action: `sendChatMessageAction(input: SendChatMessageInput)`
Post a chat message to the trip group.

- **Access**: Approved trip participants & trip organizer.
- **Response**: `Promise<ActionResult<ChatMessageDTO>>`

#### Server Action: `pinChatMessageAction(input: PinChatMessageInput)`
Pin or unpin a critical announcement in trip chat.

- **Access**: Trip organizer only.
- **Response**: `Promise<ActionResult<ChatMessageDTO>>`

#### Realtime WebSocket Channel: `trip-chat:[trip_id]`
- **Topic**: `realtime:public:trip_chat_messages:trip_id=eq.[trip_id]`
- **Events**:
  - `INSERT`: New message received -> Broadcast `ChatMessageDTO`
  - `UPDATE`: Pinned announcement state changed -> Broadcast updated `ChatMessageDTO`

---

### 2.4 Hiker Profiles & Summit Logs

#### `GET /api/v1/profiles/[id]`
Get public hiker profile and self-attested fitness info.

- **Parameters**: `id` (UUID)
- **Response**: `200 OK` -> `ApiEnvelope<HikerProfileDTO>`

#### `GET /api/v1/profiles/[id]/summit-logs`
Get completed summit logs for a hiker.

- **Parameters**: `id` (UUID)
- **Response**: `200 OK` -> `ApiEnvelope<SummitLogDTO[]>`

#### Server Action: `updateProfileInfoAction(input: UpdateProfileInput)`
Update personal bio, fitness attestation, and encrypted emergency contact.

- **Access**: Profile owner only.
- **Response**: `Promise<ActionResult<HikerProfileDTO>>`

#### Server Action: `logSummitAction(input: LogSummitInput)`
Log a completed summit (standalone or linked to a trip).

- **Access**: Authenticated users.
- **Response**: `Promise<ActionResult<SummitLogDTO>>`

---

### 2.5 Community Hubs

#### `GET /api/v1/hubs`
List outdoor clubs and communities.

- **Response**: `200 OK` -> `ApiEnvelope<CommunityHubDTO[]>`

#### `GET /api/v1/hubs/[slug]`
Get community hub profile and public trip board.

- **Parameters**: `slug` (string)
- **Response**: `200 OK` -> `ApiEnvelope<CommunityHubDetailDTO>`

#### Server Action: `createHubAction(input: CreateHubInput)`
Create a branded community hub space.

- **Access**: Authenticated users.
- **Response**: `Promise<ActionResult<CommunityHubDTO>>`

#### Server Action: `joinHubAction(input: JoinHubInput)`
Join a community hub.

- **Access**: Authenticated users.
- **Response**: `Promise<ActionResult<HubMemberDTO>>`

#### Server Action: `linkTripToHubAction(input: LinkTripToHubInput)`
Publish an upcoming trip onto a community trip board.

- **Access**: Hub admin/owner or trip organizer.
- **Response**: `Promise<ActionResult<{ hubId: string; tripId: string }>>`

---

## 3. TypeScript DTO Contracts

```typescript
// Shared Envelope Types
export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorDetail;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorDetail };

// Summit DTOs
export interface SummitDTO {
  id: string;
  name: string;
  elevationM: number;
  difficultyClass: 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5';
  latitude: number;
  longitude: number;
  gpxTrackUrl?: string | null;
  createdAt: string;
}

export interface SummitSearchQueryParams {
  q?: string;
  minElevation?: number;
  maxElevation?: number;
  difficulty?: string;
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
}

// Trip DTOs
export type TripStatus = 'open' | 'full' | 'completed' | 'cancelled';
export type RosterStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface RequiredGearItem {
  id: string;
  name: string;
  mandatory: boolean;
}

export interface TripSummaryDTO {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerAvatarUrl?: string | null;
  summitId: string;
  summitName: string;
  title: string;
  startTime: string;
  endTime?: string | null;
  capacity: number;
  approvedCount: number;
  status: TripStatus;
  createdAt: string;
}

export interface TripParticipantDTO {
  id: string;
  tripId: string;
  hikerId: string;
  hikerName: string;
  hikerAvatarUrl?: string | null;
  fitnessAttestation?: string | null;
  status: RosterStatus;
  experienceNote?: string | null;
  gearConfirmed: boolean;
  requestedAt: string;
  updatedAt: string;
}

export interface TripDetailDTO extends TripSummaryDTO {
  routeSummary?: string | null;
  requiredGear: RequiredGearItem[];
  summit: SummitDTO;
  roster: TripParticipantDTO[];
}

export interface CreateTripInput {
  summitId: string;
  title: string;
  routeSummary?: string;
  startTime: string;
  endTime?: string;
  capacity: number;
  requiredGear: RequiredGearItem[];
}

export interface JoinTripInput {
  tripId: string;
  experienceNote?: string;
  gearConfirmed: boolean;
}

export interface UpdateParticipantStatusInput {
  tripId: string;
  hikerId: string;
  status: 'approved' | 'rejected' | 'withdrawn';
}

export interface EmergencyContactDTO {
  hikerId: string;
  hikerName: string;
  emergencyContactDecrypted: string;
}

// Chat DTOs
export interface ChatMessageDTO {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  messageText: string;
  isPinned: boolean;
  createdAt: string;
}

export interface SendChatMessageInput {
  tripId: string;
  messageText: string;
}

export interface PinChatMessageInput {
  messageId: string;
  tripId: string;
  isPinned: boolean;
}

// Profile & Summit Log DTOs
export interface HikerProfileDTO {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  fitnessAttestation?: string | null;
  createdAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  fitnessAttestation?: string;
  emergencyContact?: string;
}

export interface SummitLogDTO {
  id: string;
  hikerId: string;
  summitId: string;
  summitName: string;
  tripId?: string | null;
  loggedAt: string;
  notes?: string | null;
}

export interface LogSummitInput {
  summitId: string;
  tripId?: string;
  loggedAt?: string;
  notes?: string;
}

// Community Hub DTOs
export interface CommunityHubDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export interface CommunityHubDetailDTO extends CommunityHubDTO {
  trips: TripSummaryDTO[];
}

export interface CreateHubInput {
  name: string;
  slug: string;
  description?: string;
}

export interface JoinHubInput {
  hubId: string;
}

export interface LinkTripToHubInput {
  hubId: string;
  tripId: string;
}

export interface HubMemberDTO {
  id: string;
  hubId: string;
  hikerId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}
```

---

## 4. Error Handling & Codes

### 4.1 Standardized Error Envelope
All REST API failure responses return HTTP status codes matching the error category with an `ApiErrorEnvelope` JSON body:

```json
{
  "success": false,
  "error": {
    "code": "TRIP_FULL",
    "message": "Trip capacity has been reached.",
    "details": {
      "capacity": 8,
      "approvedCount": 8
    }
  }
}
```

### 4.2 Standard Domain Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token. |
| `FORBIDDEN` | 403 | Insufficient permissions for requested action. |
| `NOT_FOUND` | 404 | Requested entity (summit, trip, profile, hub) does not exist. |
| `VALIDATION_ERROR` | 400 | Invalid payload or query parameters. |
| `RATE_LIMITED` | 429 | Exceeded request limit. |
| `INTERNAL_ERROR` | 500 | Unhandled server error. |
| `TRIP_FULL` | 422 | Cannot request or approve join; trip roster is at capacity. |
| `TRIP_CLOSED` | 422 | Trip is completed or cancelled. |
| `ALREADY_REQUESTED` | 409 | User has already submitted a join request for this trip. |
| `GEAR_NOT_CONFIRMED` | 400 | Required gear attestation checkbox was not confirmed. |
| `EMERGENCY_CONTACT_LOCKED` | 403 | Emergency contact requested outside active approved trip window. |
| `HUB_SLUG_TAKEN` | 409 | Requested community hub URL slug already exists. |
| `NOT_HUB_MEMBER` | 403 | User must be a member of the community hub to perform action. |
