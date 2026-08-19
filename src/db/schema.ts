export interface HikerProfileTable {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  fitnessAttestation?: string | null;
  emergencyContactEncrypted?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SummitTable {
  id: string;
  name: string;
  elevationM: number;
  difficultyClass: string;
  latitude: number;
  longitude: number;
  gpxTrackUrl?: string | null;
  createdAt: string;
}

export interface TripTable {
  id: string;
  organizerId: string;
  summitId: string;
  title: string;
  routeSummary?: string | null;
  startTime: string;
  endTime?: string | null;
  capacity: number;
  requiredGear: string; // JSON string
  status: 'open' | 'full' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface TripParticipantTable {
  id: string;
  tripId: string;
  hikerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  experienceNote?: string | null;
  gearConfirmed: boolean;
  requestedAt: string;
  updatedAt: string;
}

export interface TripChatMessageTable {
  id: string;
  tripId: string;
  senderId: string;
  messageText: string;
  isPinned: boolean;
  createdAt: string;
}

export interface HikerSummitLogTable {
  id: string;
  hikerId: string;
  summitId: string;
  tripId?: string | null;
  loggedAt: string;
  notes?: string | null;
}

export interface CommunityHubTable {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
}

export interface CommunityMemberTable {
  id: string;
  hubId: string;
  hikerId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface CommunityTripTable {
  id: string;
  hubId: string;
  tripId: string;
}

// In-Memory Mock Storage Engine for Phase 1/2 tests
export class MockDatabase {
  hikerProfiles: Map<string, HikerProfileTable> = new Map();
  summits: Map<string, SummitTable> = new Map();
  trips: Map<string, TripTable> = new Map();
  tripParticipants: Map<string, TripParticipantTable> = new Map();
  tripChatMessages: Map<string, TripChatMessageTable> = new Map();
  hikerSummitLogs: Map<string, HikerSummitLogTable> = new Map();
  communityHubs: Map<string, CommunityHubTable> = new Map();
  communityMembers: Map<string, CommunityMemberTable> = new Map();
  communityTrips: Map<string, CommunityTripTable> = new Map();

  clear() {
    this.hikerProfiles.clear();
    this.summits.clear();
    this.trips.clear();
    this.tripParticipants.clear();
    this.tripChatMessages.clear();
    this.hikerSummitLogs.clear();
    this.communityHubs.clear();
    this.communityMembers.clear();
    this.communityTrips.clear();
  }
}

export const db = new MockDatabase();
