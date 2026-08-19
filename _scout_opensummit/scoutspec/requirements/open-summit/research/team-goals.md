# Team Goals & Constraints Research

## Capacity & Timeline
Small engineering team (1-3 full-stack engineers). Lean capacity requiring low maintenance overhead and high leverage tooling. Target 3-month MVP horizon covering summit discovery, trip creation, and group join flows. Target 6-month launch prior to peak hiking season. Sprints operating on 2-week cycles with continuous integration.

## Technical Constraints & Preferences
Modern full-stack web architecture (TypeScript, Next.js) paired with relational database (PostgreSQL via Supabase or Neon) featuring geospatial extensions (PostGIS) for location and summit queries. Managed cloud deployment (Vercel) for minimal operational load and near-zero initial hosting cost. Modular service boundaries to support future weather, mapping, and GPX file integrations. Managed authentication (Clerk or Supabase Auth) to accelerate initial build.

## Operational Unknowns & Questions
- **[Safety & Liability Boundaries]**: Mountain summiting carries physical risk. Platform needs legal exposure strategy for user-organized trips. Options: (A) Mandatory peer-to-peer liability waiver and disclaimer on trip join, (B) Integration with standardized outdoor safety templates, (C) Pure platform disclaimer shifting all liability to individual trip organizers.
- **[Offline Access vs Web-First Scope]**: Hikers lack cellular connectivity on trail. MVP scope must balance web simplicity with trail utility. Options: (A) Web-first platform with downloadable GPX files and print/PDF summaries for MVP, (B) PWA with local storage for offline itinerary viewing, (C) Dedicated mobile app (defer past MVP).
- **[Organizer Trust & Community Vetting]**: Leading high-altitude hikes requires experience. Platform must ensure safety without erecting high friction to trip creation. Options: (A) Community review system and summit history badges, (B) Manual application/vetting for trip organizer role, (C) Open trip creation with user reporting and automated flags.
- **[Geospatial & Map Infrastructure Costs]**: Topographic map tile serving scales quickly in cost under high usage. Options: (A) MapLibre GL JS with OpenStreetMap/MapTiler free tier tiles, (B) Commercial Mapbox integration with strict rate budget, (C) Static map renders for MVP, interactive maps for core trip pages.
