# Capability: Trip Coordination

## Purpose
Enables Summit Leads to organize mountain expeditions, define roster parameters and gear requirements, and review/approve joining participants to ensure trip safety.

## ADDED Requirements

### Requirement: Expedition Creation
Summit Leads MUST be able to create a new trip associated with a specific summit, setting date, meeting point, capacity, required gear, and difficulty prerequisites via `createTripAction`.

#### Scenario: Create a new summit trip
Given an authenticated user on a summit page
When they submit `createTripAction` with trip details (date, max 8 hikers, mandatory microspikes and ice axe)
Then a new trip expedition record is created in PostgreSQL with status 'open'
And the user is assigned as the Summit Lead (`organizer_id`).

### Requirement: Organizer Approval Queue
The platform MUST require organizer approval for attendees requesting to join a trip before adding them to the confirmed roster.

#### Scenario: Request to join a trip
Given a Summit Seeker viewing an active trip with open capacity
When they execute `requestJoinTripAction` with gear confirmation checked (`gear_confirmed = true`)
Then their participant status is stored as 'pending'
And the Summit Lead receives a real-time notification to review the request.

#### Scenario: Approve participant
Given a Summit Lead reviewing pending join requests
When they execute `updateParticipantStatusAction` with `status = 'approved'`
Then the participant status is updated to 'approved'
And they are added to the trip roster and granted access to native trip chat and emergency contact decryption.

### Requirement: Time-Bounded Emergency Contact Decryption
The platform MUST decrypt and expose emergency contact information for approved trip participants strictly during the active trip window.

#### Scenario: Access emergency contact during trip window
Given a Summit Lead viewing an approved participant's details
When `NOW()` is between `start_time - 24 hours` and `end_time + 12 hours`
Then the server decrypts the AES-256-GCM encrypted emergency contact payload (`GET /api/v1/trips/[id]/emergency-contact`)
And displays it securely to the Summit Lead.

#### Scenario: Deny emergency contact outside trip window
Given a Summit Lead viewing an approved participant's details
When `NOW()` is outside the active trip window
Then the server rejects the decryption request with `403 FORBIDDEN` (`EMERGENCY_CONTACT_LOCKED`).
