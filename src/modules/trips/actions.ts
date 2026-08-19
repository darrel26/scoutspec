'use server';

import type {
  ActionResult,
  CreateTripInput,
  JoinTripInput,
  TripDetailDTO,
  TripParticipantDTO,
  UpdateParticipantStatusInput,
} from '../../types/dtos.ts';
import {
  createTrip,
  requestJoinTrip,
  updateParticipantStatus,
} from './service.ts';

/**
 * Server Action: Create a new trip expedition.
 */
export async function createTripAction(
  input: CreateTripInput,
  requestingHikerId?: string
): Promise<ActionResult<TripDetailDTO>> {
  const hikerId = requestingHikerId || 'default-hiker-id';
  return createTrip(hikerId, input);
}

/**
 * Server Action: Submit join request for a trip.
 */
export async function requestJoinTripAction(
  input: JoinTripInput,
  requestingHikerId?: string
): Promise<ActionResult<TripParticipantDTO>> {
  const hikerId = requestingHikerId || 'default-hiker-id';
  return requestJoinTrip(hikerId, input);
}

/**
 * Server Action: Update participant roster status (approve, reject, withdraw).
 */
export async function updateParticipantStatusAction(
  input: UpdateParticipantStatusInput,
  requestingHikerId?: string
): Promise<ActionResult<TripParticipantDTO>> {
  const hikerId = requestingHikerId || 'default-hiker-id';
  return updateParticipantStatus(hikerId, input);
}
