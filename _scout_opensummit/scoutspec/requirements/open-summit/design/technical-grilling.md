# Technical Grilling Log: Open Summit

## Round 1

### Question 1: ORM / Query Builder Selection
- **Question**: Which ORM / Query Builder should Open Summit use with PostgreSQL + PostGIS?
- **Selection**: Drizzle ORM
- **Rationale**: Lightweight, type-safe, SQL-like syntax with first-class PostGIS spatial query support and minimal bundle overhead for Server Actions.

### Question 2: Real-time Trip Chat Engine
- **Question**: What engine should power the real-time trip chat for MVP?
- **Selection**: Supabase Realtime (Self-hostable / Free Tier)
- **Rationale**: User specified open-source and zero-cost requirement. Self-hostable Supabase / PostgreSQL Listen-Notify Realtime engine provides free WebSocket pub/sub without proprietary lock-in or recurring SaaS charges.
