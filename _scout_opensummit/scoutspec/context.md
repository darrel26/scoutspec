# Project Context & Persistent Knowledge Base

This file acts as the cumulative memory of the project. Research agents read this before investigating new requirements, and the synthesis step updates it with new discoveries.

## Business Context
<!-- Business models, pricing strategies, market segments, target audience -->
Operates as a Public Benefit Corporation (PBC) using a community-driven freemium model. Open Summit makes it free for hikers to discover summits, find hiking partners, join group expeditions, and organize trips. Revenue comes from optional premium tools for trip organizers and outdoor communities (advanced vetting, club branding, broadcast tools), along with value-added services that enhance planning, coordination, and the overall hiking experience. The platform is designed to grow through community participation rather than intrusive advertising or high transaction fees.

Target Audience: Summit Leads (experienced trip organizers needing streamlined logistics/vetting) and Summit Seekers (intermediate/active hikers seeking safe group expeditions and peak achievements).

## Team & Technical Constraints
<!-- Team capacity, preferred tech stack, architectural principles, delivery constraints -->
Developed by a small engineering team (1-3 full-stack engineers), requiring a lean, maintainable, and cost-efficient architecture. Open-source tech stack: Next.js App Router (TypeScript), PostgreSQL + PostGIS database, Drizzle ORM for type-safe spatial queries, Supabase Auth & Supabase Realtime (self-hostable / free tier) for live trip chat. Deployed on Vercel with MapLibre GL JS / OpenStreetMap for zero-cost topographic map rendering and GPX track import/export.

## Competitor & Market Knowledge
<!-- Known direct/indirect competitors, industry standards, reference benchmarks -->
- Direct / Indirect Competitors:
  - AllTrails: Strong route/map discovery ($35.99/yr), weak community & group logistics.
  - Meetup: Strong event hosting ($16-$30/mo organizer fees), zero outdoor/topographic/summit tools.
  - Strava: Fitness/performance focused ($79.99/yr), lacks group summit planning and safety checks.
  - Peakbagger: Strong peak database & summit logging (Free), outdated UI/UX, no modern group planning.
  - Komoot: Custom route navigation ($59.99/yr), individual-focused without summit partner matching.
- Key Market Gap: Absence of a summit-first community platform combining peak logging, partner skill matching, roster logistics, safety tools, and low-barrier group hosting.

## Customer Personas & Workflows
<!-- Target customer profiles, core jobs-to-be-done, key friction points -->
- Summit Lead Persona: Organizes 1-3 group hikes monthly. Spends 3-5 hours managing fragmented stack (AllTrails + FB/WhatsApp + Google Forms + Google Sheets + Venmo). Main friction: Unvetted attendee safety risks, manual roster/carpool admin, lost chat info, last-minute flakes.
- Summit Seeker Persona: Active hiker seeking partners and group safety for high-exposure peaks. Main friction: Difficulty finding trustworthy groups, clear gear requirements, and transparent trip logistics.
