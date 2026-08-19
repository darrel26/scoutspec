// Shared Envelope Types
export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorDetail;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorDetail };

// Summit DTOs
export interface SummitDTO {
  id: string;
  name: string;
  elevationM: number;
  difficultyClass: 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5';
  latitude: number;
  longitude: number;
  gpxTrackUrl?: string | null;
  createdAt: string;
}

export interface SummitSearchQueryParams {
  q?: string;
  minElevation?: number;
  maxElevation?: number;
  difficulty?: string;
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
}

// Trip DTOs
export type TripStatus = 'open' | 'full' | 'completed' | 'cancelled';
export type RosterStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface RequiredGearItem {
  id: string;
  name: string;
  mandatory: boolean;
}

export interface TripSummaryDTO {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerAvatarUrl?: string | null;
  summitId: string;
  summitName: string;
  title: string;
  startTime: string;
  endTime?: string | null;
  capacity: number;
  approvedCount: number;
  status: TripStatus;
  createdAt: string;
}

export interface TripParticipantDTO {
  id: string;
  tripId: string;
  hikerId: string;
  hikerName: string;
  hikerAvatarUrl?: string | null;
  fitnessAttestation?: string | null;
  status: RosterStatus;
  experienceNote?: string | null;
  gearConfirmed: boolean;
  requestedAt: string;
  updatedAt: string;
}

export interface TripDetailDTO extends TripSummaryDTO {
  routeSummary?: string | null;
  requiredGear: RequiredGearItem[];
  summit: SummitDTO;
  roster: TripParticipantDTO[];
}

export interface CreateTripInput {
  summitId: string;
  title: string;
  routeSummary?: string;
  startTime: string;
  endTime?: string;
  capacity: number;
  requiredGear: RequiredGearItem[];
}

export interface JoinTripInput {
  tripId: string;
  experienceNote?: string;
  gearConfirmed: boolean;
}

export interface UpdateParticipantStatusInput {
  tripId: string;
  hikerId: string;
  status: 'approved' | 'rejected' | 'withdrawn';
}

export interface EmergencyContactDTO {
  hikerId: string;
  hikerName: string;
  emergencyContactDecrypted: string;
}

// Chat DTOs
export interface ChatMessageDTO {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  messageText: string;
  isPinned: boolean;
  createdAt: string;
}

export interface SendChatMessageInput {
  tripId: string;
  messageText: string;
}

export interface PinChatMessageInput {
  messageId: string;
  tripId: string;
  isPinned: boolean;
}

// Profile & Summit Log DTOs
export interface HikerProfileDTO {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  fitnessAttestation?: string | null;
  createdAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  fitnessAttestation?: string;
  emergencyContact?: string;
}

export interface SummitLogDTO {
  id: string;
  hikerId: string;
  summitId: string;
  summitName: string;
  tripId?: string | null;
  loggedAt: string;
  notes?: string | null;
}

export interface LogSummitInput {
  summitId: string;
  tripId?: string;
  loggedAt?: string;
  notes?: string;
}

// Community Hub DTOs
export interface CommunityHubDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export interface CommunityHubDetailDTO extends CommunityHubDTO {
  trips: TripSummaryDTO[];
}

export interface CreateHubInput {
  name: string;
  slug: string;
  description?: string;
}

export interface JoinHubInput {
  hubId: string;
}

export interface LinkTripToHubInput {
  hubId: string;
  tripId: string;
}

export interface HubMemberDTO {
  id: string;
  hubId: string;
  hikerId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}
