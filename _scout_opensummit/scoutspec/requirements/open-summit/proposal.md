# Proposal: Open Summit

## Why
Mountain hiking and summit expeditions are inherently collaborative and safety-sensitive activities. Currently, hikers and trip organizers struggle with a fragmented workflow across disconnected tools: AllTrails for route discovery, Facebook/Reddit for finding partners, Google Forms for experience vetting, and WhatsApp/Telegram for group communication. This fragmentation leads to unvetted safety risks, buried logistics, last-minute cancellations, and heavy manual administrative burden on trip leads.

Open Summit solves this by offering a dedicated, community-first outdoor platform centered around summits, group expeditions, hiker profiles, and local outdoor communities without commercial retail distractions or high organizer subscription paywalls.

## What Changes
We are introducing the core MVP for **Open Summit**, enabling hikers to discover peaks, organize and join summit trips, vet participants, communicate in real time, and log completed summits.

### Included in MVP Scope:
- **Summit Discovery & Peak Catalog**: Searchable database of summits filtered by elevation, difficulty, technical class, and location.
- **Trip Expedition Management**: Trip creation with date, route summary, required gear, participant capacity, and elevation profile.
- **Organizer Approval & Participant Vetting**: Roster join request queue allowing Summit Leads to review attendee experience profiles and gear confirmations before accepting.
- **Native Trip Chat & Pinned Announcements**: Real-time group chat per trip with dedicated pinned announcement section for critical updates (meetup times, weather changes).
- **Hiker Profiles & Summit Log**: Personal profiles showcasing past completed summits, skill/fitness self-attestation, and active trip registrations.
- **Community & Club Hubs**: Branded community spaces for local outdoor clubs and informal hiking groups to post upcoming trips.

### Explicitly Excluded / De-scoped for MVP:
- Structured carpool seat matrices (handled via trip chat).
- Built-in payment/expense splitting (handled via external links).
- Native offline topographic map tile rendering (handled via GPX track export).

## Capabilities
- `capabilities/summit-discovery`: Peak search, elevation profiles, technical difficulty grading, and trail details.
- `capabilities/trip-coordination`: Expedition creation, RSVP flow, roster management, and organizer approval queue.
- `capabilities/trip-communication`: Real-time group messaging with pinned announcements.
- `capabilities/hiker-profile`: Summit history logging, gear inventory checklists, and experience badges.
- `capabilities/community-hubs`: Group/club creation, member directory, and community trip boards.

## Impact
- **Architecture**: Next.js full-stack web application with Supabase/Neon PostgreSQL database utilizing PostGIS for geospatial peak/location queries.
- **Security & Safety**: Role-based access control for trip leads; encrypted emergency contact handling accessible only during active trip windows.
- **User Impact**: Drastically reduces trip preparation overhead for organizers (from hours to minutes) while significantly elevating safety and trust for participants on mountain summits.
