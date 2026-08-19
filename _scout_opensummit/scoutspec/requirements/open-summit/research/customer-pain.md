# Customer Pain & Workflows Research

## Persona Profile
Primary target: **Summit Lead** (Weekend Trip Organizer)
- **Profile**: Seasoned outdoor enthusiast (28–45 yrs old). High safety awareness, strong mountain experience.
- **Habits**: Researches routes weekly, organizes 1–3 group hikes monthly.
- **Tech Comfort Level**: Moderate to high. Daily user of AllTrails, Strava, WhatsApp, Google Sheets, Venmo, Garmin Connect.
- **Operational Context**: Spends 3–5 hours per trip managing logistics across disconnected apps. Frustrated by flaking participants and unvetted hikers on technical summits.

Secondary target: **Summit Seeker** (Individual Hiker)
- **Profile**: Intermediate/active hiker looking for partners, group safety, or guidance to reach higher peaks.
- **Habits**: Hikes bi-weekly, browses social media/meetup groups for weekend outdoor activities.
- **Tech Comfort Level**: High. Mobile-first user expecting frictionless RSVP, clear gear lists, and real-time trip updates.

## Current Fragmented Journey
1. Discovery & Route Planning (AllTrails / CalTopo / Strava)
   Organizer finds trail, evaluates elevation profile, checks recent trip reports, and downloads GPX tracks.
2. Partner Recruitment & Promotion (Facebook Groups / Reddit / WhatsApp / Instagram)
   Organizer posts trip callout with date, location, and difficulty. Reaches out to fragmented social networks.
3. Participant Vetting & Form Submission (Google Forms / Instagram DMs)
   Organizer collects experience levels, emergency contacts, and medical background via standalone web forms or manual chat.
4. Roster & Logistics Management (Google Sheets / Excel)
   Organizer tracks driver/passenger carpool arrangements, shared gear (tents, stoves, ropes), and payment status manually.
5. Real-Time Chat & Coordination (WhatsApp / Telegram / FB Messenger)
   Organizer creates group chat for weather updates, gear checks, and meetup times. Crucial details get buried under chatter.
6. Expense Settlement (Venmo / Splitwise / Zelle)
   Post-trip calculation and manual collection of gas money, park pass fees, and shared supplies.

## Core Friction & Pain Points
- **Unvetted Participant Safety Risks**: No reliable way to verify a joining hiker's true fitness, technical skill, or gear preparation, creating safety hazards on high-exposure summits.
- **Logistical Overhead & Manual Admin**: Organizers spend hours copying data between forms, spreadsheets, and group chats to manage carpools, emergency contacts, and rosters.
- **Scattered & Buried Information**: Vital trip details (pickup spots, start time, mandatory gear, weather pivots) get lost in high-volume chat threads, causing confusion and delays.
- **High Flake Rate & Lack of Trust**: Social group sign-ups suffer from low accountability, leaving carpools short-staffed or forcing organizers to cancel trips last-minute.
- **Inconvenient Post-Trip Expense Splitting**: Manual tracking of gas costs, permit fees, and shared gear expenses creates awkward post-hike reimbursement collection.

## Workflow Unknowns & Questions
- **[Participant Vetting Rigor]**: How strictly should the platform gate join requests for high-difficulty summits?
  - *Option A*: Self-attestation checklist (hiker checks boxes for required experience/gear).
  - *Option B*: Mandatory organizer review and approval gate for every joiner.
  - *Option C*: Verified platform badge/history requirement (e.g., past completed summits recorded on platform).
- **[In-App Communication Depth]**: Should Open Summit build built-in chat or link out to existing channels?
  - *Option A*: Full native group chat with pinned announcements and driver/rider sub-threads.
  - *Option B*: Structured announcement/broadcast board inside platform + external WhatsApp link integration.
- **[Carpool & Logistics Complexity]**: What level of carpool/gear matching belongs in the MVP?
  - *Option A*: Free-form text fields inside trip details for carpool notes.
  - *Option B*: Structured carpool matrix (drivers list seats/origin, passengers claim seats).
- **[Safety & Emergency Contact Handling]**: How should emergency contact data be stored and shared securely?
  - *Option A*: Private encrypted vault visible to trip lead only during active trip window.
  - *Option B*: Mandatory profile-level emergency contact required before joining any trip.
