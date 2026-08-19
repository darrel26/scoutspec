# Capability: Trip Communication

## Purpose
Delivers real-time group communication for confirmed trip participants using Supabase Realtime WebSockets, featuring dedicated pinned announcements for critical logistics updates.

## ADDED Requirements

### Requirement: Native Trip Chat
The platform MUST provide a real-time WebSocket channel (`trip-chat:[trip_id]`) dedicated to each active trip, accessible only to approved participants and the Summit Lead.

#### Scenario: Send message in trip chat
Given a confirmed participant on an active trip page
When they post a message via `sendChatMessageAction`
Then the message is saved to `trip_chat_messages` and broadcast via WebSocket to all connected roster members in real time.

### Requirement: Pinned Announcements
Summit Leads MUST be able to pin or unpin critical announcements in the trip channel that remain highlighted at the top of the chat view.

#### Scenario: Pin key logistics update
Given a Summit Lead in the trip chat
When they execute `pinChatMessageAction` on a message (e.g. "Meet at trailhead at 4:30 AM sharp")
Then `is_pinned` is set to `true`
And a Realtime UPDATE event broadcasts the pinned announcement banner to all active channel subscribers.
