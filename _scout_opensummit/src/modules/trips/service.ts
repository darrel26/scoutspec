import { db, TripTable, TripParticipantTable } from '../../db/index';
import {
  TripDTO,
  TripSummaryDTO,
  TripDetailDTO,
  TripParticipantDTO,
  CreateTripInput,
  JoinTripInput,
  UpdateParticipantStatusInput,
  ActionResult
} from '../../types/index';

export function createTrip(
  organizerId: string,
  input: CreateTripInput
): ActionResult<TripDTO> {
  const organizer = db.hikerProfiles.get(organizerId);
  if (!organizer) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Organizer profile not found' }
    };
  }

  const summit = db.summits.get(input.summitId);
  if (!summit) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Summit not found' }
    };
  }

  const id = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const tripTable: TripTable = {
    id,
    organizerId,
    summitId: input.summitId,
    title: input.title,
    routeSummary: input.routeSummary || null,
    startTime: input.startTime,
    endTime: input.endTime || null,
    capacity: input.capacity,
    requiredGear: JSON.stringify(input.requiredGear || []),
    status: 'open',
    createdAt: new Date().toISOString()
  };

  db.trips.set(id, tripTable);

  // Auto-add organizer as approved participant
  const partId = `part-${Date.now()}`;
  db.tripParticipants.set(partId, {
    id: partId,
    tripId: id,
    hikerId: organizerId,
    status: 'approved',
    gearConfirmed: true,
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return {
    success: true,
    data: {
      id,
      organizerId,
      organizerName: organizer.fullName,
      organizerAvatarUrl: organizer.avatarUrl,
      summitId: summit.id,
      summitName: summit.name,
      title: input.title,
      startTime: input.startTime,
      endTime: input.endTime,
      capacity: input.capacity,
      approvedCount: 1,
      status: 'open',
      createdAt: tripTable.createdAt
    }
  };
}

export function requestJoinTrip(
  hikerId: string,
  input: JoinTripInput
): ActionResult<TripParticipantDTO> {
  const hiker = db.hikerProfiles.get(hikerId);
  if (!hiker) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Hiker profile not found' }
    };
  }

  const trip = db.trips.get(input.tripId);
  if (!trip) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Trip not found' }
    };
  }

  if (trip.status !== 'open') {
    return {
      success: false,
      error: { code: 'TRIP_CLOSED', message: 'Trip is not open for requests' }
    };
  }

  if (!input.gearConfirmed) {
    return {
      success: false,
      error: { code: 'GEAR_NOT_CONFIRMED', message: 'Must confirm required gear' }
    };
  }

  // Check existing participation
  for (const part of db.tripParticipants.values()) {
    if (part.tripId === input.tripId && part.hikerId === hikerId) {
      return {
        success: false,
        error: { code: 'ALREADY_REQUESTED', message: 'Already submitted request for this trip' }
      };
    }
  }

  // Capacity check
  let approvedCount = 0;
  for (const part of db.tripParticipants.values()) {
    if (part.tripId === input.tripId && part.status === 'approved') {
      approvedCount++;
    }
  }
  if (approvedCount >= trip.capacity) {
    return {
      success: false,
      error: { code: 'TRIP_FULL', message: 'Trip capacity reached' }
    };
  }

  const partId = `part-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const participant: TripParticipantTable = {
    id: partId,
    tripId: input.tripId,
    hikerId,
    status: 'pending',
    experienceNote: input.experienceNote || null,
    gearConfirmed: input.gearConfirmed,
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.tripParticipants.set(partId, participant);

  return {
    success: true,
    data: {
      id: partId,
      tripId: input.tripId,
      hikerId,
      hikerName: hiker.fullName,
      hikerAvatarUrl: hiker.avatarUrl,
      fitnessAttestation: hiker.fitnessAttestation,
      status: 'pending',
      experienceNote: input.experienceNote,
      gearConfirmed: input.gearConfirmed,
      requestedAt: participant.requestedAt,
      updatedAt: participant.updatedAt
    }
  };
}

export function updateParticipantStatus(
  actorId: string,
  input: UpdateParticipantStatusInput
): ActionResult<TripParticipantDTO> {
  const trip = db.trips.get(input.tripId);
  if (!trip) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Trip not found' }
    };
  }

  let targetPart: TripParticipantTable | null = null;
  let targetPartKey: string | null = null;
  for (const [key, part] of db.tripParticipants.entries()) {
    if (part.tripId === input.tripId && part.hikerId === input.hikerId) {
      targetPart = part;
      targetPartKey = key;
      break;
    }
  }

  if (!targetPart || !targetPartKey) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Participant record not found' }
    };
  }

  // Authorization check
  const isOrganizer = trip.organizerId === actorId;
  const isSelf = input.hikerId === actorId;

  if (input.status === 'withdrawn') {
    if (!isSelf && !isOrganizer) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only participant or organizer can withdraw' }
      };
    }
  } else {
    if (!isOrganizer) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only trip organizer can approve or reject' }
      };
    }
  }

  targetPart.status = input.status;
  targetPart.updatedAt = new Date().toISOString();
  db.tripParticipants.set(targetPartKey, targetPart);

  const hiker = db.hikerProfiles.get(input.hikerId);

  return {
    success: true,
    data: {
      id: targetPart.id,
      tripId: targetPart.tripId,
      hikerId: targetPart.hikerId,
      hikerName: hiker?.fullName || 'Unknown',
      hikerAvatarUrl: hiker?.avatarUrl,
      fitnessAttestation: hiker?.fitnessAttestation,
      status: targetPart.status,
      experienceNote: targetPart.experienceNote || undefined,
      gearConfirmed: targetPart.gearConfirmed,
      requestedAt: targetPart.requestedAt,
      updatedAt: targetPart.updatedAt
    }
  };
}
