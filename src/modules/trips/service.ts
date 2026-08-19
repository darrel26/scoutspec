import crypto from 'node:crypto';
import { db } from '../../db/index.ts';
import type { TripParticipantTable, TripTable } from '../../db/schema.ts';
import type {
  ActionResult,
  CreateTripInput,
  EmergencyContactDTO,
  JoinTripInput,
  RequiredGearItem,
  SummitDTO,
  TripDetailDTO,
  TripParticipantDTO,
  TripStatus,
  TripSummaryDTO,
  UpdateParticipantStatusInput,
} from '../../types/dtos.ts';
import { decryptEmergencyContact, isWithinEmergencyAccessWindow } from './emergency.ts';

export function createTrip(
  organizerId: string,
  input: CreateTripInput
): ActionResult<TripDetailDTO> {
  const summit = db.summits.get(input.summitId);
  if (!summit) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Summit not found',
      },
    };
  }

  const tripId = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  const newTrip: TripTable = {
    id: tripId,
    organizerId,
    summitId: input.summitId,
    title: input.title,
    routeSummary: input.routeSummary || null,
    startTime: input.startTime,
    endTime: input.endTime || null,
    capacity: input.capacity,
    requiredGear: JSON.stringify(input.requiredGear || []),
    status: 'open',
    createdAt: nowIso,
  };

  db.trips.set(tripId, newTrip);

  // Automatically add organizer as approved participant
  const organizerParticipant: TripParticipantTable = {
    id: crypto.randomUUID(),
    tripId,
    hikerId: organizerId,
    status: 'approved',
    experienceNote: 'Trip Organizer',
    gearConfirmed: true,
    requestedAt: nowIso,
    updatedAt: nowIso,
  };

  db.tripParticipants.set(organizerParticipant.id, organizerParticipant);

  return getTripDetail(tripId);
}

export function getTripDetail(tripId: string): ActionResult<TripDetailDTO> {
  const trip = db.trips.get(tripId);
  if (!trip) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Trip not found',
      },
    };
  }

  const summit = db.summits.get(trip.summitId);
  if (!summit) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Summit not found',
      },
    };
  }

  const organizerProfile = db.hikerProfiles.get(trip.organizerId);

  const summitDTO: SummitDTO = {
    id: summit.id,
    name: summit.name,
    elevationM: summit.elevationM,
    difficultyClass: summit.difficultyClass as SummitDTO['difficultyClass'],
    latitude: summit.latitude,
    longitude: summit.longitude,
    gpxTrackUrl: summit.gpxTrackUrl,
    createdAt: summit.createdAt,
  };

  const participants = Array.from(db.tripParticipants.values()).filter(
    (p) => p.tripId === tripId
  );

  const approvedCount = participants.filter((p) => p.status === 'approved').length;

  const roster: TripParticipantDTO[] = participants.map((p) => {
    const profile = db.hikerProfiles.get(p.hikerId);
    return {
      id: p.id,
      tripId: p.tripId,
      hikerId: p.hikerId,
      hikerName: profile ? profile.fullName : 'Unknown Hiker',
      hikerAvatarUrl: profile?.avatarUrl || null,
      fitnessAttestation: profile?.fitnessAttestation || null,
      status: p.status,
      experienceNote: p.experienceNote || null,
      gearConfirmed: p.gearConfirmed,
      requestedAt: p.requestedAt,
      updatedAt: p.updatedAt,
    };
  });

  let requiredGear: RequiredGearItem[] = [];
  try {
    requiredGear = JSON.parse(trip.requiredGear || '[]');
  } catch {
    requiredGear = [];
  }

  return {
    success: true,
    data: {
      id: trip.id,
      organizerId: trip.organizerId,
      organizerName: organizerProfile ? organizerProfile.fullName : 'Trip Organizer',
      organizerAvatarUrl: organizerProfile?.avatarUrl || null,
      summitId: trip.summitId,
      summitName: summit.name,
      title: trip.title,
      startTime: trip.startTime,
      endTime: trip.endTime || null,
      capacity: trip.capacity,
      approvedCount,
      status: trip.status,
      createdAt: trip.createdAt,
      routeSummary: trip.routeSummary || null,
      requiredGear,
      summit: summitDTO,
      roster,
    },
  };
}

export function listTrips(params?: {
  summitId?: string;
  status?: TripStatus;
  startAfter?: string;
  startBefore?: string;
  limit?: number;
  offset?: number;
}): ActionResult<TripSummaryDTO[]> {
  let trips = Array.from(db.trips.values());

  if (params?.summitId) {
    trips = trips.filter((t) => t.summitId === params.summitId);
  }
  if (params?.status) {
    trips = trips.filter((t) => t.status === params.status);
  }
  if (params?.startAfter) {
    const afterTime = new Date(params.startAfter).getTime();
    trips = trips.filter((t) => new Date(t.startTime).getTime() >= afterTime);
  }
  if (params?.startBefore) {
    const beforeTime = new Date(params.startBefore).getTime();
    trips = trips.filter((t) => new Date(t.startTime).getTime() <= beforeTime);
  }

  const offset = params?.offset || 0;
  const limit = params?.limit || 50;
  const paginatedTrips = trips.slice(offset, offset + limit);

  const summaries: TripSummaryDTO[] = paginatedTrips.map((trip) => {
    const summit = db.summits.get(trip.summitId);
    const organizerProfile = db.hikerProfiles.get(trip.organizerId);
    const approvedCount = Array.from(db.tripParticipants.values()).filter(
      (p) => p.tripId === trip.id && p.status === 'approved'
    ).length;

    return {
      id: trip.id,
      organizerId: trip.organizerId,
      organizerName: organizerProfile ? organizerProfile.fullName : 'Trip Organizer',
      organizerAvatarUrl: organizerProfile?.avatarUrl || null,
      summitId: trip.summitId,
      summitName: summit ? summit.name : 'Unknown Summit',
      title: trip.title,
      startTime: trip.startTime,
      endTime: trip.endTime || null,
      capacity: trip.capacity,
      approvedCount,
      status: trip.status,
      createdAt: trip.createdAt,
    };
  });

  return {
    success: true,
    data: summaries,
  };
}

export function requestJoinTrip(
  hikerId: string,
  input: JoinTripInput
): ActionResult<TripParticipantDTO> {
  if (!input.gearConfirmed) {
    return {
      success: false,
      error: {
        code: 'GEAR_NOT_CONFIRMED',
        message: 'Required gear attestation must be confirmed.',
      },
    };
  }

  const trip = db.trips.get(input.tripId);
  if (!trip) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Trip not found.',
      },
    };
  }

  if (trip.status === 'cancelled' || trip.status === 'completed') {
    return {
      success: false,
      error: {
        code: 'TRIP_CLOSED',
        message: 'Trip is closed for join requests.',
      },
    };
  }

  const existingParticipant = Array.from(db.tripParticipants.values()).find(
    (p) => p.tripId === input.tripId && p.hikerId === hikerId
  );

  if (hikerId === trip.organizerId || (existingParticipant && existingParticipant.status !== 'withdrawn')) {
    return {
      success: false,
      error: {
        code: 'ALREADY_REQUESTED',
        message: 'User has already submitted a join request for this trip.',
      },
    };
  }

  const approvedCount = Array.from(db.tripParticipants.values()).filter(
    (p) => p.tripId === input.tripId && p.status === 'approved'
  ).length;

  if (approvedCount >= trip.capacity || trip.status === 'full') {
    if (trip.status !== 'full') {
      trip.status = 'full';
      db.trips.set(trip.id, trip);
    }
    return {
      success: false,
      error: {
        code: 'TRIP_FULL',
        message: 'Trip capacity has been reached.',
        details: { capacity: trip.capacity, approvedCount },
      },
    };
  }

  const nowIso = new Date().toISOString();
  let participant: TripParticipantTable;

  if (existingParticipant && existingParticipant.status === 'withdrawn') {
    participant = {
      ...existingParticipant,
      status: 'pending',
      experienceNote: input.experienceNote || existingParticipant.experienceNote,
      gearConfirmed: input.gearConfirmed,
      updatedAt: nowIso,
    };
  } else {
    participant = {
      id: crypto.randomUUID(),
      tripId: input.tripId,
      hikerId,
      status: 'pending',
      experienceNote: input.experienceNote || null,
      gearConfirmed: input.gearConfirmed,
      requestedAt: nowIso,
      updatedAt: nowIso,
    };
  }

  db.tripParticipants.set(participant.id, participant);

  const profile = db.hikerProfiles.get(hikerId);
  const dto: TripParticipantDTO = {
    id: participant.id,
    tripId: participant.tripId,
    hikerId: participant.hikerId,
    hikerName: profile ? profile.fullName : 'Unknown Hiker',
    hikerAvatarUrl: profile?.avatarUrl || null,
    fitnessAttestation: profile?.fitnessAttestation || null,
    status: participant.status,
    experienceNote: participant.experienceNote || null,
    gearConfirmed: participant.gearConfirmed,
    requestedAt: participant.requestedAt,
    updatedAt: participant.updatedAt,
  };

  return {
    success: true,
    data: dto,
  };
}

export function updateParticipantStatus(
  requestingHikerId: string,
  input: UpdateParticipantStatusInput
): ActionResult<TripParticipantDTO> {
  const trip = db.trips.get(input.tripId);
  if (!trip) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Trip not found.',
      },
    };
  }

  const participant = Array.from(db.tripParticipants.values()).find(
    (p) => p.tripId === input.tripId && p.hikerId === input.hikerId
  );

  if (!participant) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Participant record not found.',
      },
    };
  }

  if (input.status === 'approved' || input.status === 'rejected') {
    if (requestingHikerId !== trip.organizerId) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only the trip organizer can approve or reject participants.',
        },
      };
    }
  } else if (input.status === 'withdrawn') {
    if (requestingHikerId !== input.hikerId && requestingHikerId !== trip.organizerId) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to withdraw participant.',
        },
      };
    }
  }

  if (input.status === 'approved' && participant.status !== 'approved') {
    const currentApprovedCount = Array.from(db.tripParticipants.values()).filter(
      (p) => p.tripId === input.tripId && p.status === 'approved'
    ).length;

    if (currentApprovedCount >= trip.capacity) {
      trip.status = 'full';
      db.trips.set(trip.id, trip);
      return {
        success: false,
        error: {
          code: 'TRIP_FULL',
          message: 'Trip capacity has been reached.',
          details: { capacity: trip.capacity, approvedCount: currentApprovedCount },
        },
      };
    }
  }

  participant.status = input.status;
  participant.updatedAt = new Date().toISOString();
  db.tripParticipants.set(participant.id, participant);

  const updatedApprovedCount = Array.from(db.tripParticipants.values()).filter(
    (p) => p.tripId === input.tripId && p.status === 'approved'
  ).length;

  if (updatedApprovedCount >= trip.capacity) {
    trip.status = 'full';
  } else if (trip.status === 'full' && updatedApprovedCount < trip.capacity) {
    trip.status = 'open';
  }
  db.trips.set(trip.id, trip);

  const profile = db.hikerProfiles.get(input.hikerId);
  const dto: TripParticipantDTO = {
    id: participant.id,
    tripId: participant.tripId,
    hikerId: participant.hikerId,
    hikerName: profile ? profile.fullName : 'Unknown Hiker',
    hikerAvatarUrl: profile?.avatarUrl || null,
    fitnessAttestation: profile?.fitnessAttestation || null,
    status: participant.status,
    experienceNote: participant.experienceNote || null,
    gearConfirmed: participant.gearConfirmed,
    requestedAt: participant.requestedAt,
    updatedAt: participant.updatedAt,
  };

  return {
    success: true,
    data: dto,
  };
}

export function getEmergencyContacts(
  tripId: string,
  requestingHikerId: string,
  now: Date = new Date(),
  secretKey?: string
): ActionResult<EmergencyContactDTO[]> {
  const trip = db.trips.get(tripId);
  if (!trip) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Trip not found.',
      },
    };
  }

  const isOrganizer = requestingHikerId === trip.organizerId;
  const isApprovedParticipant = Array.from(db.tripParticipants.values()).some(
    (p) => p.tripId === tripId && p.hikerId === requestingHikerId && p.status === 'approved'
  );

  if (!isOrganizer && !isApprovedParticipant) {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied. Must be trip organizer or approved participant.',
      },
    };
  }

  if (!isWithinEmergencyAccessWindow(trip.startTime, trip.endTime, now)) {
    return {
      success: false,
      error: {
        code: 'EMERGENCY_CONTACT_LOCKED',
        message: 'Emergency contact requested outside active approved trip window.',
      },
    };
  }

  const approvedParticipants = Array.from(db.tripParticipants.values()).filter(
    (p) => p.tripId === tripId && p.status === 'approved'
  );

  const contacts: EmergencyContactDTO[] = [];
  for (const p of approvedParticipants) {
    const profile = db.hikerProfiles.get(p.hikerId);
    if (profile && profile.emergencyContactEncrypted) {
      try {
        const decrypted = decryptEmergencyContact(profile.emergencyContactEncrypted, secretKey);
        contacts.push({
          hikerId: profile.id,
          hikerName: profile.fullName,
          emergencyContactDecrypted: decrypted,
        });
      } catch {
        // Skip payload if decryption fails
      }
    }
  }

  return {
    success: true,
    data: contacts,
  };
}
