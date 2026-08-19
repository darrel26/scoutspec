# Capability: Summit Discovery

## Purpose
Provides a searchable peak catalog and trail route database enabling hikers to discover mountains, analyze elevation profiles, check technical difficulty ratings, and locate upcoming trips associated with specific peaks.

## ADDED Requirements

### Requirement: Search and Filter Summits
The platform MUST allow users to search and filter mountain summits based on geographic proximity, elevation, difficulty class, and active trips via PostGIS spatial queries.

#### Scenario: Filter summits by difficulty and location
Given a user is browsing the summit catalog
When they apply filters for "Elevation > 10,000 ft", "Class 2", and "Within 50km of lat/lng"
Then the platform executes a spatial radius query (`GET /api/v1/summits`) returning matching peaks sorted by distance
And displays active upcoming trips scheduled for each peak.

#### Scenario: View summit details
Given a user selects a specific summit page
When the page loads
Then it displays key peak metadata (elevation, prominence, difficulty class, route summary, weather forecast widget)
And lists active group trips targeting this summit.

### Requirement: Map and Elevation Visualization
The platform MUST display interactive topographic map overviews and elevation profiles for peak routes using MapLibre GL JS and OpenStreetMap vector/raster tile layers.

#### Scenario: Inspect elevation profile
Given a user is viewing a summit route page
When they hover over the elevation profile chart
Then the map marker updates to show the corresponding point along the trail
And displays current elevation and distance from trailhead.

#### Scenario: Circuit breaker map tile fallback
Given a user viewing an interactive map
When the primary vector tile server experiences a timeout or 5xx error
Then the map engine automatically falls back to OpenStreetMap raster tiles
And displays an offline / degraded map status notice.
