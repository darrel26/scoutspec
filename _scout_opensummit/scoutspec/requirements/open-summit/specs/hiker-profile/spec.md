# Capability: Hiker Profile

## Purpose
Maintains user profiles recording peak summit history, experience levels, gear inventories, and emergency contact information.

## ADDED Requirements

### Requirement: Summit Logging
Users MUST be able to log completed mountain summits with date, route taken, conditions, and optional photos.

#### Scenario: Log a completed summit
Given a user who completed a hike to Mt. Rainier
When they log the summit with date, photo, and trip report
Then the peak is added to their profile's completed summits list
And their total summit count increases.

### Requirement: Profile & Experience Badge
Users MUST have a public profile displaying their outdoor experience summary, completed peaks, and self-attested fitness rating.

#### Scenario: View hiker profile
Given a Summit Lead evaluating a join request
When they click on the applicant's profile
Then they see the applicant's completed summits list, technical experience tags, and profile bio.
