import { db } from '../../db/index.ts';
import type {
  CommunityHubDTO,
  CommunityHubDetailDTO,
  CreateHubInput,
  HubMemberDTO,
  JoinHubInput,
  LinkTripToHubInput,
  TripSummaryDTO,
} from '../../types/dtos.ts';
import type { CommunityHubTable, CommunityMemberTable, CommunityTripTable } from '../../db/schema.ts';

export class HubServiceError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number = 400) {
    super(message);
    this.name = 'HubServiceError';
    this.code = code;
    this.status = status;
  }
}

export async function createHub(
  ownerId: string,
  input: CreateHubInput
): Promise<CommunityHubDTO> {
  if (!input.name || !input.slug) {
    throw new HubServiceError('VALIDATION_ERROR', 'Name and slug are required', 400);
  }

  for (const hub of db.communityHubs.values()) {
    if (hub.slug.toLowerCase() === input.slug.toLowerCase()) {
      throw new HubServiceError('HUB_SLUG_TAKEN', 'Hub slug is already taken', 409);
    }
  }

  const id = `hub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();

  const newHub: CommunityHubTable = {
    id,
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    ownerId,
    createdAt,
  };

  db.communityHubs.set(id, newHub);

  const memberId = `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const ownerMember: CommunityMemberTable = {
    id: memberId,
    hubId: id,
    hikerId: ownerId,
    role: 'owner',
    joinedAt: createdAt,
  };
  db.communityMembers.set(memberId, ownerMember);

  return {
    id: newHub.id,
    name: newHub.name,
    slug: newHub.slug,
    description: newHub.description,
    ownerId: newHub.ownerId,
    memberCount: 1,
    createdAt: newHub.createdAt,
  };
}

export async function joinHub(
  hikerId: string,
  input: JoinHubInput
): Promise<HubMemberDTO> {
  const hub = db.communityHubs.get(input.hubId);
  if (!hub) {
    throw new HubServiceError('NOT_FOUND', 'Community hub not found', 404);
  }

  for (const member of db.communityMembers.values()) {
    if (member.hubId === input.hubId && member.hikerId === hikerId) {
      return {
        id: member.id,
        hubId: member.hubId,
        hikerId: member.hikerId,
        role: member.role,
        joinedAt: member.joinedAt,
      };
    }
  }

  const memberId = `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const joinedAt = new Date().toISOString();
  const newMember: CommunityMemberTable = {
    id: memberId,
    hubId: input.hubId,
    hikerId,
    role: 'member',
    joinedAt,
  };

  db.communityMembers.set(memberId, newMember);

  return {
    id: newMember.id,
    hubId: newMember.hubId,
    hikerId: newMember.hikerId,
    role: newMember.role,
    joinedAt: newMember.joinedAt,
  };
}

export async function linkTripToHub(
  userId: string,
  input: LinkTripToHubInput
): Promise<{ hubId: string; tripId: string }> {
  const hub = db.communityHubs.get(input.hubId);
  if (!hub) {
    throw new HubServiceError('NOT_FOUND', 'Community hub not found', 404);
  }

  const trip = db.trips.get(input.tripId);
  if (!trip) {
    throw new HubServiceError('NOT_FOUND', 'Trip not found', 404);
  }

  let isHubAdminOrOwner = false;
  for (const member of db.communityMembers.values()) {
    if (member.hubId === input.hubId && member.hikerId === userId && (member.role === 'owner' || member.role === 'admin')) {
      isHubAdminOrOwner = true;
      break;
    }
  }

  const isTripOrganizer = trip.organizerId === userId;

  if (!isHubAdminOrOwner && !isTripOrganizer) {
    throw new HubServiceError('FORBIDDEN', 'Only hub admins/owners or trip organizers can link trips', 403);
  }

  for (const link of db.communityTrips.values()) {
    if (link.hubId === input.hubId && link.tripId === input.tripId) {
      return { hubId: input.hubId, tripId: input.tripId };
    }
  }

  const linkId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newLink: CommunityTripTable = {
    id: linkId,
    hubId: input.hubId,
    tripId: input.tripId,
  };

  db.communityTrips.set(linkId, newLink);

  return { hubId: input.hubId, tripId: input.tripId };
}

export async function getHubDetail(slugOrId: string): Promise<CommunityHubDetailDTO> {
  let hub = db.communityHubs.get(slugOrId);
  if (!hub) {
    for (const h of db.communityHubs.values()) {
      if (h.slug === slugOrId) {
        hub = h;
        break;
      }
    }
  }

  if (!hub) {
    throw new HubServiceError('NOT_FOUND', 'Community hub not found', 404);
  }

  let memberCount = 0;
  for (const member of db.communityMembers.values()) {
    if (member.hubId === hub.id) {
      memberCount++;
    }
  }

  const trips: TripSummaryDTO[] = [];
  for (const link of db.communityTrips.values()) {
    if (link.hubId === hub.id) {
      const trip = db.trips.get(link.tripId);
      if (trip) {
        const summit = db.summits.get(trip.summitId);
        const organizer = db.hikerProfiles.get(trip.organizerId);

        let approvedCount = 0;
        for (const p of db.tripParticipants.values()) {
          if (p.tripId === trip.id && p.status === 'approved') {
            approvedCount++;
          }
        }

        trips.push({
          id: trip.id,
          organizerId: trip.organizerId,
          organizerName: organizer ? organizer.fullName : 'Unknown Organizer',
          organizerAvatarUrl: organizer?.avatarUrl ?? null,
          summitId: trip.summitId,
          summitName: summit ? summit.name : 'Unknown Summit',
          title: trip.title,
          startTime: trip.startTime,
          endTime: trip.endTime ?? null,
          capacity: trip.capacity,
          approvedCount,
          status: trip.status,
          createdAt: trip.createdAt,
        });
      }
    }
  }

  return {
    id: hub.id,
    name: hub.name,
    slug: hub.slug,
    description: hub.description,
    ownerId: hub.ownerId,
    memberCount,
    createdAt: hub.createdAt,
    trips,
  };
}

export async function listHubs(): Promise<CommunityHubDTO[]> {
  const result: CommunityHubDTO[] = [];
  for (const hub of db.communityHubs.values()) {
    let memberCount = 0;
    for (const member of db.communityMembers.values()) {
      if (member.hubId === hub.id) {
        memberCount++;
      }
    }
    result.push({
      id: hub.id,
      name: hub.name,
      slug: hub.slug,
      description: hub.description,
      ownerId: hub.ownerId,
      memberCount,
      createdAt: hub.createdAt,
    });
  }
  return result;
}
